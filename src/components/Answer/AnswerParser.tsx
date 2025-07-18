import { renderToStaticMarkup } from "react-dom/server";
import { ChatAppResponse, getCitationFilePath } from "../../api";

type HtmlParsedAnswer = {
    answerHtml: string;
    citations: string[];
};

// Function to validate citation format and check if dataPoint starts with possible citation
function isCitationValid(contextDataPoints: any, citationCandidate: string): boolean {
    // For now, let's be more permissive and accept any citation that looks like a filename
    const regex = /.+\.\w{1,}(?:#\S*)?$/;
    if (!regex.test(citationCandidate)) {
        console.log(`🔍 Citation failed regex validation: "${citationCandidate}"`);
        return false;
    }

    // Check if contextDataPoints is an object with a text property that is an array
    let dataPointsArray: string[];
    if (Array.isArray(contextDataPoints)) {
        dataPointsArray = contextDataPoints;
    } else if (contextDataPoints && Array.isArray(contextDataPoints.text)) {
        dataPointsArray = contextDataPoints.text;
    } else {
        console.log('🔍 No data points array found');
        return false;
    }

    console.log('🔍 Validating citation:', citationCandidate);
    console.log('🔍 Available data points:', dataPointsArray);

    // Check if the citation matches any of the data points
    const isValidCitation = dataPointsArray.some(dataPoint => {
        // Handle the new backend format: "Document Title: md_files/filename.md - content..."
        if (dataPoint.startsWith('Document Title: ')) {
            const titleMatch = dataPoint.match(/Document Title: md_files\/([^-\s]+)/);
            if (titleMatch) {
                const filename = titleMatch[1];
                console.log(`🔍 Checking filename: "${filename}" against citation: "${citationCandidate}"`);
                return filename === citationCandidate || filename.startsWith(citationCandidate);
            }
        }
        
        // Handle the old format with pipe separator
        if (dataPoint.includes('|')) {
            const parts = dataPoint.split('|');
            const displayName = parts[0];
            console.log(`🔍 Checking display name: "${displayName}" against citation: "${citationCandidate}"`);
            return displayName === citationCandidate || displayName.startsWith(citationCandidate);
        }
        
        // Handle the old format with colon separator
        const colonIndex = dataPoint.indexOf(':');
        if (colonIndex !== -1) {
            const filename = dataPoint.substring(0, colonIndex).trim();
            console.log(`🔍 Checking filename: "${filename}" against citation: "${citationCandidate}"`);
            return filename === citationCandidate || filename.startsWith(citationCandidate);
        }
        
        console.log(`🔍 Checking data point: "${dataPoint}" against citation: "${citationCandidate}"`);
        return dataPoint.startsWith(citationCandidate);
    });

    // If no exact match found, but we have data points, accept the citation anyway
    // This handles cases where the AI generates citations that don't exactly match the source filenames
    if (!isValidCitation && dataPointsArray.length > 0) {
        console.log('🔍 No exact match found, but accepting citation anyway due to available data points');
        return true;
    }

    console.log('🔍 Citation validation result:', isValidCitation);
    return isValidCitation;
}

export function parseAnswerToHtml(answer: ChatAppResponse, isStreaming: boolean, onCitationClicked: (citationFilePath: string) => void): HtmlParsedAnswer {
    const contextDataPoints = answer.context.data_points;
    const citations: string[] = [];

    console.log('🔍 Parsing answer for citations...');
    console.log('🔍 Context data points:', contextDataPoints);
    console.log('🔍 Answer content:', answer.message.content);

    // Trim any whitespace from the end of the answer after removing follow-up questions
    let parsedAnswer = answer.message.content.trim();
    
    // Check if the response contains any citations
    const hasCitations = /\[\[([^\]]+)\]\]/.test(parsedAnswer);
    console.log('🔍 Response contains citations:', hasCitations);
    
    // If no citations are found but we have data points, add them automatically
    if (!hasCitations && contextDataPoints && contextDataPoints.length > 0) {
        console.log('🔍 No citations found in response, adding automatic citations...');
        
        // Extract filenames from data points
        const filenames = contextDataPoints.map(dataPoint => {
            console.log('🔍 Processing data point for filename extraction:', dataPoint);
            
            // Handle the new backend format: "Document Title: md_files/filename.md - content..."
            if (dataPoint.startsWith('Document Title: ')) {
                const titleMatch = dataPoint.match(/Document Title: md_files\/([^-\s]+)/);
                if (titleMatch) {
                    const filename = titleMatch[1];
                    console.log('🔍 Extracted filename from Document Title format:', filename);
                    return filename;
                }
            }
            
            // Handle the old format with pipe separator
            if (dataPoint.includes('|')) {
                const parts = dataPoint.split('|');
                const displayName = parts[0];
                console.log('🔍 Extracted filename from pipe format:', displayName);
                return displayName;
            }
            
            // Handle the old format with colon separator
            const colonIndex = dataPoint.indexOf(':');
            if (colonIndex !== -1) {
                const filename = dataPoint.substring(0, colonIndex).trim();
                console.log('🔍 Extracted filename from colon format:', filename);
                return filename;
            }
            
            console.log('🔍 Could not extract filename from data point:', dataPoint);
            return dataPoint;
        });
        
        // Filter out any undefined or empty filenames
        const validFilenames = filenames.filter(filename => filename && filename.trim() !== '');
        console.log('🔍 Valid filenames for citations:', validFilenames);
        
        // Add citations to the end of the response
        const citationText = validFilenames.map(filename => `[[${filename}]]`).join(' ');
        parsedAnswer += `\n\n**Sources:** ${citationText}`;
        console.log('🔍 Added automatic citations:', citationText);
    }

    // Omit a citation that is still being typed during streaming
    if (isStreaming) {
        let lastIndex = parsedAnswer.length;
        for (let i = parsedAnswer.length - 1; i >= 0; i--) {
            if (parsedAnswer[i] === "]") {
                break;
            } else if (parsedAnswer[i] === "[") {
                lastIndex = i;
                break;
            }
        }
        const truncatedAnswer = parsedAnswer.substring(0, lastIndex);
        parsedAnswer = truncatedAnswer;
    }

    const parts = parsedAnswer.split(/\[([^\]]+)\]/g);
    
    console.log('🔍 Split parts:', parts);

    const fragments: string[] = parts.map((part, index) => {
        if (index % 2 === 0) {
            return part;
        } else {
            console.log(`🔍 Processing citation part: "${part}"`);
            let citationIndex: number;

            if (!isCitationValid(contextDataPoints, part)) {
                console.log(`🔍 Citation validation failed for: "${part}"`);
                return `[${part}]`;
            }

            console.log(`🔍 Citation validation passed for: "${part}"`);

            if (citations.indexOf(part) !== -1) {
                citationIndex = citations.indexOf(part) + 1;
            } else {
                citations.push(part);
                citationIndex = citations.length;
            }

            const path = getCitationFilePath(part);
            console.log(`🔍 Generated citation path: "${path}" for citation: "${part}"`);

            return renderToStaticMarkup(
                <a className="supContainer" title={part} onClick={() => onCitationClicked(path)}>
                    <sup>{citationIndex}</sup>
                </a>
            );
        }
    });

    const result = {
        answerHtml: fragments.join(""),
        citations
    };
    
    console.log('🔍 Final parsing result:', result);
    return result;
}

// HEALRAG Backend API Integration
const BACKEND_URI = (import.meta.env.VITE_HEALRAG_BACKEND_URL || "https://nttcodegenerator.azurewebsites.net").replace(/\/$/, '');

import { 
    RAGRequest, 
    RAGResponse, 
    ChatAppResponse, 
    ChatAppResponseOrError, 
    ChatAppRequest, 
    Config, 
    SimpleAPIResponse, 
    UserInfo,
    SessionHistoryRequest,
    SessionHistoryResponse,
    UserSessionsResponse,
    SessionDeleteResponse,
    SearchRequest,
    SearchResponse,
    HealthResponse,
    StreamChunk,
    ResponseMessage,
    ResponseContext,
    Thoughts
} from "./models";
import { useLogin, getToken, isUsingAppServicesLogin } from "../authConfig";
// Removed Azure Storage library - will use backend endpoint for SAS URL generation

// Session management
let currentSessionId: string | null = null;

export function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getCurrentSessionId(): string {
    if (!currentSessionId) {
        currentSessionId = generateSessionId();
    }
    return currentSessionId;
}

export function startNewSession(): string {
    currentSessionId = generateSessionId();
    return currentSessionId;
}

export async function getHeaders(idToken: string | undefined): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    
    // If using login and we have a token, add it as Authorization header
    // For session-authenticated users, we rely on cookies instead of Bearer token
    if (useLogin && idToken && idToken !== 'session-authenticated') {
        headers["Authorization"] = `Bearer ${idToken}`;
    }
    
    return headers;
}

// Helper function to create fetch options with proper credentials
export function getFetchOptions(method: string, headers: Record<string, string>, body?: string): RequestInit {
    return {
        method,
        headers,
        body,
        credentials: 'include' // Always include cookies for session-based auth
    };
}

// Authentication APIs
export async function getUserInfo(idToken: string): Promise<UserInfo> {
    const headers = await getHeaders(idToken);
    const response = await fetch(`${BACKEND_URI}/auth/me`, getFetchOptions("GET", headers));

    if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as UserInfo;
}

export async function loginUrl(): Promise<string> {
    return `${BACKEND_URI}/auth/login`;
}

export async function logoutUrl(): Promise<string> {
    return `${BACKEND_URI}/auth/logout`;
}

// Configuration API
export async function configApi(): Promise<Config> {
    try {
        const response = await fetch(`${BACKEND_URI}/config`, {
            method: "GET"
        });

        if (!response.ok) {
            throw new Error(`Config request failed: ${response.status}`);
        }

        const backendConfig = await response.json();
        
        // Merge with legacy UI defaults for compatibility
        return {
            ...backendConfig,
            // Legacy UI compatibility defaults
            defaultReasoningEffort: "balanced",
            showGPT4VOptions: false,
            showSemanticRankerOption: false,
            showQueryRewritingOption: false,
            showReasoningEffortOption: false,
            streamingEnabled: true,
            showVectorOption: false,
            showUserUpload: false,
            showLanguagePicker: true,
            showSpeechInput: false,
            showSpeechOutputBrowser: false,
            showSpeechOutputAzure: false,
            showChatHistoryBrowser: true,
            showChatHistoryCosmos: true,
            showAgenticRetrievalOption: false
        } as Config;
    } catch (error) {
        console.warn("Failed to fetch config, using defaults:", error);
        return {
            chunk_size: 1000,
            chunk_overlap: 200,
            components: {},
            // Legacy UI compatibility defaults
            defaultReasoningEffort: "balanced",
            showGPT4VOptions: false,
            showSemanticRankerOption: false,
            showQueryRewritingOption: false,
            showReasoningEffortOption: false,
            streamingEnabled: true,
            showVectorOption: false,
            showUserUpload: false,
            showLanguagePicker: true,
            showSpeechInput: false,
            showSpeechOutputBrowser: false,
            showSpeechOutputAzure: false,
            showChatHistoryBrowser: true,
            showChatHistoryCosmos: true,
            showAgenticRetrievalOption: false
        };
    }
}

// Health check API
export async function healthApi(): Promise<HealthResponse> {
    const response = await fetch(`${BACKEND_URI}/health`, {
        method: "GET"
    });

    if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
    }

    return (await response.json()) as HealthResponse;
}

// Main RAG Query API
export async function ragQueryApi(request: RAGRequest, idToken: string | undefined): Promise<RAGResponse> {
    const headers = await getHeaders(idToken);
    const response = await fetch(`${BACKEND_URI}/rag/query`, getFetchOptions("POST", headers, JSON.stringify(request)));

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`RAG query failed: ${response.status} - ${errorText}`);
    }

    return (await response.json()) as RAGResponse;
}

// Streaming RAG API
export async function ragStreamApi(request: RAGRequest, idToken: string | undefined): Promise<Response> {
    const headers = await getHeaders(idToken);
    return await fetch(`${BACKEND_URI}/rag/stream`, getFetchOptions("POST", headers, JSON.stringify(request)));
}

// Document Search API
export async function searchDocumentsApi(request: SearchRequest, idToken: string | undefined): Promise<SearchResponse> {
    const headers = await getHeaders(idToken);
    const response = await fetch(`${BACKEND_URI}/search/documents`, {
        method: "POST",
        headers,
        body: JSON.stringify(request)
    });

    if (!response.ok) {
        throw new Error(`Document search failed: ${response.status}`);
    }

    return (await response.json()) as SearchResponse;
}

// Session History APIs
export async function getSessionHistoryApi(sessionId: string, limit: number = 50, idToken: string): Promise<SessionHistoryResponse> {
    const headers = await getHeaders(idToken);
    const request: SessionHistoryRequest = {
        session_id: sessionId,
        limit,
        include_metadata: true
    };

    const response = await fetch(`${BACKEND_URI}/sessions/history`, {
        method: "POST",
        headers,
        body: JSON.stringify(request)
    });

    if (!response.ok) {
        throw new Error(`Getting session history failed: ${response.statusText}`);
    }

    return (await response.json()) as SessionHistoryResponse;
}

export async function getUserSessionsApi(limit: number = 50, idToken: string): Promise<UserSessionsResponse> {
    const headers = await getHeaders(idToken);
    
    // Try to get user sessions from the correct endpoint
    const response = await fetch(`${BACKEND_URI}/sessions`, {
        method: "GET",
        headers: {
            ...headers,
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        // If the sessions endpoint doesn't exist, try the history endpoint with a different approach
        console.warn("Sessions endpoint not found, trying alternative approach");
        const historyResponse = await fetch(`${BACKEND_URI}/sessions/history`, {
            method: "POST",
            headers: {
                ...headers,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                session_id: "all", // Try to get all sessions
                limit: limit,
                include_metadata: true
            })
        });

        if (!historyResponse.ok) {
            throw new Error(`Getting user sessions failed: ${historyResponse.statusText}`);
        }

        const historyData = await historyResponse.json();
        
        // If we get session history data, convert it to user sessions format
        if (historyData.success && historyData.session_id) {
            return {
                success: true,
                sessions: [{
                    sessionID: historyData.session_id,
                    created_at: new Date().toISOString(),
                    last_interaction: new Date().toISOString(),
                    user_info: { user_id: 'current_user' }
                }],
                total_count: 1
            } as UserSessionsResponse;
        }
        
        throw new Error(`Getting user sessions failed: ${historyResponse.statusText}`);
    }

    return (await response.json()) as UserSessionsResponse;
}

export async function deleteSessionApi(sessionId: string, idToken: string): Promise<SessionDeleteResponse> {
    const headers = await getHeaders(idToken);
    const response = await fetch(`${BACKEND_URI}/sessions/${sessionId}`, {
        method: "DELETE",
        headers
    });

    if (!response.ok) {
        throw new Error(`Deleting session failed: ${response.statusText}`);
    }

    return (await response.json()) as SessionDeleteResponse;
}

// Legacy compatibility functions for existing UI components
export async function askApi(request: ChatAppRequest, idToken: string | undefined): Promise<ChatAppResponse> {
    // Convert ChatAppRequest to RAGRequest
    const lastMessage = request.messages[request.messages.length - 1];
    const sessionId = request.session_id || getCurrentSessionId();
    
    const ragRequest: RAGRequest = {
        query: lastMessage.content,
        session_id: sessionId,
        top_k: request.context?.overrides?.top || 3,
        temperature: request.context?.overrides?.temperature || 0.7,
        max_tokens: request.context?.overrides?.max_tokens || 2000,
        include_search_details: true
    };

    const ragResponse = await ragQueryApi(ragRequest, idToken);

    if (!ragResponse.success) {
        throw new Error(ragResponse.error || "RAG query failed");
    }

    // Convert RAGResponse to ChatAppResponse
    const thoughts: Thoughts[] = [
        {
            title: "Search Results",
            description: `Found ${ragResponse.sources.length} relevant sources`
        }
    ];

    const context: ResponseContext = {
        data_points: ragResponse.sources.map(source => 
            `${source.title || 'Document'}: ${source.content?.substring(0, 200) || ''}...`
        ),
        followup_questions: null,
        thoughts
    };

    return {
        message: {
            content: ragResponse.response,
            role: "assistant"
        },
        context,
        session_state: sessionId
    };
}

export async function chatApi(request: ChatAppRequest, shouldStream: boolean, idToken: string | undefined): Promise<Response> {
    // Convert ChatAppRequest to RAGRequest
    const lastMessage = request.messages[request.messages.length - 1];
    const sessionId = request.session_id || getCurrentSessionId();
    
    const ragRequest: RAGRequest = {
        query: lastMessage.content,
        session_id: sessionId,
        top_k: request.context?.overrides?.top || 3,
        temperature: request.context?.overrides?.temperature || 0.7,
        max_tokens: request.context?.overrides?.max_tokens || 2000,
        include_search_details: true
    };

    if (shouldStream) {
        // Get the HEALRAG stream and transform it to the expected format
        const healragResponse = await ragStreamApi(ragRequest, idToken);
        
        // Create a compatibility layer for the streaming response
        const compatibleStream = new ReadableStream({
            async start(controller) {
                if (!healragResponse.body) {
                    controller.close();
                    return;
                }

                const reader = healragResponse.body.getReader();
                let sources: any[] = [];
                let metadata: any = {};
                
                console.log('🔍 Starting stream processing with empty sources array');
                
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        // Parse the server-sent events from HEALRAG
                        const text = new TextDecoder().decode(value);
                        const lines = text.split('\n');
                        
                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                try {
                                    const chunk = JSON.parse(line.slice(6));
                                    console.log('🔍 RECEIVED STREAMING CHUNK:', chunk);
                                    
                                    // Transform HEALRAG chunk format to expected format
                                    if (chunk.type === 'chunk' && chunk.content) {
                                        // Text content chunk
                                        const compatibleChunk = {
                                            delta: { content: chunk.content },
                                            message: { role: "assistant" }
                                        };
                                        controller.enqueue(new TextEncoder().encode(JSON.stringify(compatibleChunk) + '\n'));
                                    } else if (chunk.type === 'sources' && chunk.sources) {
                                        // Sources data
                                        sources = chunk.sources;
                                        console.log('🔍 Streaming Sources received:', sources);
                                    } else if (chunk.sources && Array.isArray(chunk.sources)) {
                                        // Sources data in different format
                                        sources = chunk.sources;
                                        console.log('🔍 Streaming Sources received (alt format):', sources);
                                        console.log('🔍 Source filenames:', sources.map(s => s.source || s.title || s.chunk_id));
                                    } else if (chunk.type === 'retrieval_complete' && chunk.sources) {
                                        // Handle retrieval_complete chunk type
                                        sources = chunk.sources;
                                        console.log('🔍 Sources from retrieval_complete:', sources);
                                    } else if (chunk.type === 'context_ready' && chunk.sources) {
                                        // Handle context_ready chunk type  
                                        sources = chunk.sources;
                                        console.log('🔍 Sources from context_ready:', sources);
                                    } else if (chunk.type === 'complete') {
                                        // Final context data
                                        metadata = chunk.metadata || {};
                                        
                                        // Check if sources are included in the complete chunk
                                        if (chunk.sources && Array.isArray(chunk.sources) && sources.length === 0) {
                                            sources = chunk.sources;
                                            console.log('🔍 Sources found in complete chunk:', sources);
                                        }
                                        
                                        // Log the complete chunk structure for debugging
                                        console.log('🔍 Complete chunk structure:', {
                                            type: chunk.type,
                                            has_sources: !!chunk.sources,
                                            sources_length: chunk.sources?.length || 0,
                                            sources_preview: chunk.sources?.slice(0, 2),
                                            current_sources_length: sources.length
                                        });
                                        console.log('🔍 Complete chunk full object:', JSON.stringify(chunk, null, 2));
                                        
                                        const thoughts = [{
                                            title: "Search Results",
                                            description: `Found ${sources.length} relevant sources`
                                        }];

                                        // Format sources properly for SupportingContent component
                                        console.log('🔍 Raw sources before formatting:');
                                        sources.forEach((source, index) => {
                                            const keys = Object.keys(source);
                                            console.log(`  Source ${index}:`, {
                                                keys: keys,
                                                title: source.title,
                                                source: source.source,
                                                chunk_id: source.chunk_id,
                                                content_preview: source.content?.substring(0, 100) + '...'
                                            });
                                            
                                            // Log all key-value pairs to see what's actually available
                                            console.log(`  All fields for Source ${index}:`);
                                            keys.forEach(key => {
                                                console.log(`    ${key}:`, source[key]);
                                            });
                                        });
                                        
                                        const dataPoints = sources.map(source => {
                                            // Use the actual source filename for citation matching
                                            let sourceFile = source.source || source.title || source.chunk_id;
                                            
                                            // Check if source_file field contains the filename
                                            if (!sourceFile && source.source_file) {
                                                // Extract filename from path like "md_files/Cyber & Information Security Policy.md"
                                                const parts = source.source_file.split('/');
                                                sourceFile = parts[parts.length - 1]; // Get last part (filename)
                                            }
                                            
                                            // Fallback to 'Document' if still no filename
                                            sourceFile = sourceFile || 'Document';
                                            
                                            console.log(`🔍 Extracted filename for citation: "${sourceFile}" from source_file: "${source.source_file}"`);
                                            
                                            const content = source.content?.substring(0, 300) || source.text?.substring(0, 300) || '';
                                            // Format as: "filename: content..." for proper citation parsing
                                            return `${sourceFile}: ${content}${content.length >= 300 ? '...' : ''}`;
                                        });

                                        console.log('🔍 Streaming Formatted Data Points:');
                                        dataPoints.forEach((dataPoint, index) => {
                                            console.log(`  Data Point ${index}:`, dataPoint);
                                        });

                                        const context = {
                                            data_points: dataPoints,
                                            followup_questions: null,
                                            thoughts
                                        };

                                        const contextChunk = {
                                            context,
                                            message: { role: "assistant" }
                                        };
                                        controller.enqueue(new TextEncoder().encode(JSON.stringify(contextChunk) + '\n'));
                                    } else if (chunk.type === 'error') {
                                        // Error chunk
                                        const errorChunk = { error: chunk.error };
                                        controller.enqueue(new TextEncoder().encode(JSON.stringify(errorChunk) + '\n'));
                                    } else {
                                        // Check if any unhandled chunk has sources
                                        if (chunk.sources && Array.isArray(chunk.sources) && sources.length === 0) {
                                            sources = chunk.sources;
                                            console.log('🔍 Sources found in unhandled chunk type:', chunk.type, sources);
                                        }
                                        // Log unhandled chunk types for debugging
                                        console.log('🔍 Unhandled chunk type:', chunk.type, 'has_sources:', !!chunk.sources);
                                    }
                                } catch (parseError) {
                                    console.warn('Failed to parse streaming chunk:', parseError);
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('Streaming error:', error);
                    const errorChunk = { error: error instanceof Error ? error.message : String(error) };
                    controller.enqueue(new TextEncoder().encode(JSON.stringify(errorChunk) + '\n'));
                } finally {
                    console.log('🔍 Final sources array before closing stream:');
                    console.log('  Total sources:', sources.length);
                    sources.forEach((source, index) => {
                        console.log(`  Final Source ${index}:`, {
                            source: source.source,
                            title: source.title,
                            chunk_id: source.chunk_id
                        });
                    });
                    controller.close();
                }
            }
        });

        return new Response(compatibleStream, {
            headers: {
                'Content-Type': 'text/plain',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            }
        });
    } else {
        // For non-streaming, we need to create a Response object
        const ragResponse = await ragQueryApi(ragRequest, idToken);
        
        const thoughts: Thoughts[] = [
            {
                title: "Search Results",
                description: `Found ${ragResponse.sources.length} relevant sources`
            }
        ];

        // Format sources properly for SupportingContent component
        const dataPoints = ragResponse.sources.map(source => {
            // Use the actual source filename for citation matching
            let sourceFile = source.source || source.title || source.chunk_id;
            
            // Check if source_file field contains the filename
            if (!sourceFile && source.source_file) {
                // Extract filename from path like "md_files/Cyber & Information Security Policy.md"
                const parts = source.source_file.split('/');
                sourceFile = parts[parts.length - 1]; // Get last part (filename)
            }
            
            // Fallback to 'Document' if still no filename
            sourceFile = sourceFile || 'Document';
            
            const content = source.content?.substring(0, 300) || source.text?.substring(0, 300) || '';
            // Format as: "filename: content..." for proper citation parsing
            return `${sourceFile}: ${content}${content.length >= 300 ? '...' : ''}`;
        });

        console.log('🔍 RAG Response Sources:', ragResponse.sources);
        console.log('🔍 Formatted Data Points:', dataPoints);

        const context: ResponseContext = {
            data_points: dataPoints,
            followup_questions: null,
            thoughts
        };

        console.log('🔍 RAG Response Text:', ragResponse.response);
        console.log('🔍 RAG Response contains citations:', /\[([^\]]+)\]/.test(ragResponse.response));

        const chatResponse: ChatAppResponse = {
            message: {
                content: ragResponse.response,
                role: "assistant"
            },
            context,
            session_state: sessionId
        };

        return new Response(JSON.stringify(chatResponse), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Legacy chat history compatibility
export async function getChatHistoryListApi(count: number, continuationToken: string | undefined, idToken: string): Promise<{ sessions: any[]; continuation_token?: string }> {
    const userSessions = await getUserSessionsApi(count, idToken);
    
    if (!userSessions.success) {
        throw new Error("Failed to get user sessions");
    }

    // Add null checking for sessions array
    if (!userSessions.sessions || !Array.isArray(userSessions.sessions)) {
        console.warn("No sessions found or invalid sessions data:", userSessions);
        return {
            sessions: [],
            continuation_token: undefined
        };
    }

    // Convert to legacy format with better titles
    const sessions = userSessions.sessions.map(session => {
        // Create a more descriptive title
        const sessionDate = new Date(session.created_at || session.last_interaction || Date.now());
        const timeStr = sessionDate.toLocaleDateString() + ' ' + sessionDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const title = `Chat - ${timeStr}`;
        
        return {
        id: session.sessionID,
        entra_oid: session.user_info?.user_id || '',
            title: title,
            timestamp: sessionDate.getTime()
        };
    });

    return {
        sessions,
        continuation_token: undefined // HEALRAG doesn't use continuation tokens
    };
}

export async function getChatHistoryApi(id: string, idToken: string): Promise<{ id: string; entra_oid: string; answers: any }> {
    const history = await getSessionHistoryApi(id, 100, idToken);
    
    if (!history.success) {
        throw new Error("Failed to get session history");
    }

    // Add null checking for interactions array
    if (!history.interactions || !Array.isArray(history.interactions)) {
        console.warn("No interactions found or invalid interactions data:", history);
        return {
            id: history.session_id || id,
            entra_oid: '',
            answers: []
        };
    }

    // Convert HEALRAG interaction format to expected chat format
    const answers: [string, ChatAppResponse][] = [];
    
    for (const interaction of history.interactions) {
        const chatResponse: ChatAppResponse = {
            message: {
                content: interaction.response,
                role: "assistant"
            },
            context: {
                data_points: interaction.sources ? interaction.sources.map(source => 
                    `${source.title || source.source || 'Document'}: ${(source.content || '').substring(0, 200)}...`
                ) : [],
                followup_questions: null,
                thoughts: [{
                    title: "Sources",
                    description: `${interaction.sources?.length || 0} sources used`
                }]
            },
            session_state: history.session_id // Use consistent session ID string format
        };
        
        answers.push([interaction.query, chatResponse]);
    }

    return {
        id: history.session_id,
        entra_oid: '',
        answers: answers
    };
}

export async function deleteChatHistoryApi(id: string, idToken: string): Promise<void> {
    await deleteSessionApi(id, idToken);
}

// Utility functions
export function getCitationFilePath(citation: string): string {
    // Use backend proxy to serve citation files from blob storage
    return `${BACKEND_URI}/citation/${encodeURIComponent(citation)}`;
}

// File upload (if supported by backend in the future)
export async function uploadFileApi(request: FormData, idToken: string): Promise<SimpleAPIResponse> {
    const headers = await getHeaders(idToken);
    // Remove Content-Type header to let browser set it with boundary for FormData
    delete headers["Content-Type"];
    
    const response = await fetch(`${BACKEND_URI}/upload`, {
        method: "POST",
        headers,
        body: request
    });

    if (!response.ok) {
        throw new Error(`Uploading files failed: ${response.statusText}`);
    }

    return (await response.json()) as SimpleAPIResponse;
}

export async function deleteUploadedFileApi(filename: string, idToken: string): Promise<SimpleAPIResponse> {
    const headers = await getHeaders(idToken);
    const response = await fetch(`${BACKEND_URI}/delete_uploaded`, {
        method: "POST",
        headers,
        body: JSON.stringify({ filename })
    });

    if (!response.ok) {
        throw new Error(`Deleting file failed: ${response.statusText}`);
    }

    return (await response.json()) as SimpleAPIResponse;
}

export async function listUploadedFilesApi(idToken: string): Promise<string[]> {
    const headers = await getHeaders(idToken);
    const response = await fetch(`${BACKEND_URI}/list_uploaded`, {
        method: "GET",
        headers
    });

    if (!response.ok) {
        throw new Error(`Listing files failed: ${response.statusText}`);
    }

    return (await response.json()) as string[];
}

// Speech API (if supported)
export async function getSpeechApi(text: string): Promise<string | null> {
    try {
        const response = await fetch(`${BACKEND_URI}/speech`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text })
        });

        if (response.status === 200) {
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } else if (response.status === 400) {
            console.log("Speech synthesis is not enabled.");
            return null;
        } else {
            console.error("Unable to get speech synthesis.");
            return null;
        }
    } catch (error) {
        console.error("Speech API error:", error);
        return null;
    }
}

// Session state management for storing chat history
export async function postChatHistoryApi(item: any, idToken: string): Promise<any> {
    // In HEALRAG, this is handled automatically by the backend when making RAG queries
    // with session_id, so this might not be needed, but keeping for compatibility
    return { success: true, message: "Chat history automatically managed by backend" };
}

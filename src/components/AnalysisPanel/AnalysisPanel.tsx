import { Stack, Pivot, PivotItem, IconButton, Spinner, SpinnerSize } from "@fluentui/react";
import { useTranslation } from "react-i18next";
import styles from "./AnalysisPanel.module.css";

import { SupportingContent } from "../SupportingContent";
import { ChatAppResponse } from "../../api";
import { AnalysisPanelTabs } from "./AnalysisPanelTabs";
import { ThoughtProcess } from "./ThoughtProcess";
import { MarkdownViewer } from "../MarkdownViewer";
import { useMsal } from "@azure/msal-react";
import { getHeaders } from "../../api";
import { useLogin, getToken } from "../../authConfig";
import { useState, useEffect } from "react";

interface Props {
    className: string;
    activeTab: AnalysisPanelTabs;
    onActiveTabChanged: (tab: AnalysisPanelTabs) => void;
    activeCitation: string | undefined;
    citationHeight: string;
    answer: ChatAppResponse;
    onClose?: () => void;
}

const pivotItemDisabledStyle = { disabled: true, style: { color: "grey" } };

export const AnalysisPanel = ({ answer, activeTab, activeCitation, citationHeight, className, onActiveTabChanged, onClose }: Props) => {
    const isDisabledThoughtProcessTab: boolean = !answer.context.thoughts;
    const isDisabledSupportingContentTab: boolean = !answer.context.data_points;
    const isDisabledCitationTab: boolean = !activeCitation;
    const [citation, setCitation] = useState("");
    const [isCitationLoading, setIsCitationLoading] = useState(false);
    const [citationError, setCitationError] = useState<string | null>(null);

    // Function to get citation content from response context as fallback
    const getCitationContentFromContext = (citationName: string): string | null => {
        if (!answer.context.data_points) return null;
        
        for (const dataPoint of answer.context.data_points) {
            if (dataPoint.startsWith(citationName)) {
                // Extract content after the colon
                const colonIndex = dataPoint.indexOf(':');
                if (colonIndex !== -1) {
                    return dataPoint.substring(colonIndex + 1).trim();
                }
            }
        }
        return null;
    };

    const client = useLogin ? useMsal().instance : undefined;
    const { t } = useTranslation();

    const fetchCitation = async () => {
        const token = client ? await getToken(client) : undefined;
        if (activeCitation) {
            setIsCitationLoading(true);
            try {
                // Get hash from the URL as it may contain #page=N
                // which helps browser PDF renderer jump to correct page N
                const originalHash = activeCitation.indexOf("#") ? activeCitation.split("#")[1] : "";
                const response = await fetch(activeCitation, {
                    method: "GET",
                    headers: await getHeaders(token)
                });
                
                if (!response.ok) {
                    // Handle specific backend errors
                    if (response.status === 500) {
                        const errorText = await response.text();
                        if (errorText.includes("Failed to generate SAS URL") || errorText.includes("Azure Storage")) {
                            throw new Error("Citation file temporarily unavailable due to backend configuration. Please try again later or contact support.");
                        }
                    }
                    throw new Error(`Failed to fetch citation: ${response.status} ${response.statusText}`);
                }
                
                const citationContent = await response.blob();
                let citationObjectUrl = URL.createObjectURL(citationContent);
                // Add hash back to the new blob URL
                if (originalHash) {
                    citationObjectUrl += "#" + originalHash;
                }
                setCitation(citationObjectUrl);
            } catch (error) {
                console.error("Error fetching citation:", error);
                setCitation(""); // Clear citation on error
                setCitationError(error instanceof Error ? error.message : String(error));
            } finally {
                setIsCitationLoading(false);
            }
        }
    };
    useEffect(() => {
        fetchCitation();
    }, [activeCitation, client]);

    const renderFileViewer = () => {
        if (!activeCitation) {
            return null;
        }

        if (isCitationLoading) {
            return (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                    <Spinner size={SpinnerSize.large} label="Loading citation file..." />
                </div>
            );
        }

        if (!citation) {
            // Try to get citation content from context as fallback
            const fallbackContent = activeCitation ? getCitationContentFromContext(activeCitation) : null;
            
            if (fallbackContent) {
                return (
                    <div style={{ padding: '20px' }}>
                        <div style={{ marginBottom: '10px', color: '#666', fontSize: '12px' }}>
                            <strong>Citation Preview</strong> (file temporarily unavailable)
                        </div>
                        <div style={{ 
                            backgroundColor: '#f5f5f5', 
                            padding: '15px', 
                            borderRadius: '4px',
                            fontSize: '14px',
                            lineHeight: '1.5',
                            maxHeight: '400px',
                            overflow: 'auto'
                        }}>
                            {fallbackContent}
                        </div>
                        <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
                            This is a preview of the citation content. The full document is temporarily unavailable.
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            <button 
                                onClick={() => {
                                    setCitationError(null);
                                    fetchCitation();
                                }}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#0078d4',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                Retry Loading Full Document
                            </button>
                        </div>
                    </div>
                );
            }
            
            return (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    <div style={{ marginBottom: '10px' }}>
                        <strong>Citation file unavailable</strong>
                    </div>
                    <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                        The citation file is temporarily unavailable due to backend configuration issues. 
                        The AI response is still accurate and based on the source documents.
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
                        Please try again later or contact your system administrator.
                    </div>
                    <div style={{ marginTop: '10px' }}>
                        <button 
                            onClick={() => {
                                setCitationError(null);
                                fetchCitation();
                            }}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#0078d4',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            Retry
                        </button>
                    </div>
                </div>
            );
        }

        const fileExtension = activeCitation.split(".").pop()?.toLowerCase();
        switch (fileExtension) {
            case "png":
                return <img src={citation} className={styles.citationImg} alt="Citation Image" />;
            case "md":
                return <MarkdownViewer src={citation} />;
            default:
                return <iframe title="Citation" src={citation} width="100%" height={citationHeight} />;
        }
    };

    return (
        <div className={className}>
            <Stack horizontal horizontalAlign="space-between" verticalAlign="center" style={{ marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                    <Pivot
                        selectedKey={activeTab}
                        onLinkClick={pivotItem => pivotItem && onActiveTabChanged(pivotItem.props.itemKey! as AnalysisPanelTabs)}
                        headersOnly={true}
                    >
                        <PivotItem
                            itemKey={AnalysisPanelTabs.ThoughtProcessTab}
                            headerText={t("headerTexts.thoughtProcess")}
                            headerButtonProps={isDisabledThoughtProcessTab ? pivotItemDisabledStyle : undefined}
                        />
                        <PivotItem
                            itemKey={AnalysisPanelTabs.SupportingContentTab}
                            headerText={t("headerTexts.supportingContent")}
                            headerButtonProps={isDisabledSupportingContentTab ? pivotItemDisabledStyle : undefined}
                        />
                        <PivotItem
                            itemKey={AnalysisPanelTabs.CitationTab}
                            headerText={t("headerTexts.citation")}
                            headerButtonProps={isDisabledCitationTab ? pivotItemDisabledStyle : undefined}
                        />
                    </Pivot>
                </div>
                {onClose && (
                    <IconButton
                        iconProps={{ iconName: "Cancel" }}
                        title={t("labels.closeButton")}
                        ariaLabel={t("labels.closeButton")}
                        onClick={onClose}
                        styles={{ root: { color: "#424242" } }}
                    />
                )}
            </Stack>
            <div>
                {activeTab === AnalysisPanelTabs.ThoughtProcessTab && (
                    <ThoughtProcess thoughts={answer.context.thoughts || []} />
                )}
                {activeTab === AnalysisPanelTabs.SupportingContentTab && (
                    <SupportingContent supportingContent={answer.context.data_points} />
                )}
                {activeTab === AnalysisPanelTabs.CitationTab && renderFileViewer()}
            </div>
        </div>
    );
};

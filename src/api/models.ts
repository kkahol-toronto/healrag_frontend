// HEALRAG Backend API Models
// Based on the FastAPI backend at https://healrag-security.azurewebsites.net

// Legacy enum types for compatibility with existing UI components
export const enum RetrievalMode {
    Hybrid = "hybrid",
    Vectors = "vectors", 
    Text = "text"
}

export const enum GPT4VInput {
    TextAndImages = "textAndImages",
    Images = "images",
    Texts = "texts"
}

export const enum VectorFields {
    Embedding = "textEmbeddingOnly",
    ImageEmbedding = "imageEmbeddingOnly", 
    TextAndImageEmbeddings = "textAndImageEmbeddings"
}

export interface UserInfo {
    user_id: string;
    email?: string;
    name?: string;
    roles: string[];
}

export interface RAGRequest {
    query: string;
    session_id?: string;
    top_k?: number;
    temperature?: number;
    max_tokens?: number;
    custom_system_prompt?: string;
    include_search_details?: boolean;
}

export interface RAGResponse {
    success: boolean;
    response: string;
    sources: Array<{
        title?: string;
        content?: string;
        source?: string;
        score?: number;
        chunk_id?: string;
        [key: string]: any;
    }>;
    metadata: {
        user?: string;
        processing_time?: number;
        model_used?: string;
        [key: string]: any;
    };
    error?: string;
}

export interface SearchRequest {
    query: string;
    top_k?: number;
}

export interface SearchResponse {
    success: boolean;
    results: Array<{
        content: string;
        score: number;
        source?: string;
        [key: string]: any;
    }>;
    metadata: {
        user?: string;
        [key: string]: any;
    };
    error?: string;
}

export interface SessionHistoryRequest {
    session_id: string;
    limit?: number;
    include_metadata?: boolean;
}

export interface SessionHistoryResponse {
    success: boolean;
    session_id: string;
    interactions: Array<{
        query: string;
        response: string;
        timestamp: string;
        sources?: any[];
        metadata?: any;
        [key: string]: any;
    }>;
    total_count: number;
    error?: string;
}

export interface UserSessionsResponse {
    success: boolean;
    user_identifier: string;
    sessions: Array<{
        sessionID: string;
        user_info?: any;
        created_at?: string;
        last_interaction?: string;
        interaction_count?: number;
        [key: string]: any;
    }>;
    total_count: number;
    error?: string;
}

export interface HealthResponse {
    status: string;
    timestamp: string;
    components: Record<string, boolean>;
    configuration: Record<string, any>;
}

export interface Config {
    azure_openai_endpoint?: string;
    azure_openai_chat_deployment?: string;
    azure_openai_embedding_deployment?: string;
    azure_search_endpoint?: string;
    azure_search_index_name?: string;
    azure_storage_container?: string;
    chunk_size?: number;
    chunk_overlap?: number;
    components?: Record<string, boolean>;
    rag_settings?: Record<string, any>;
    
    // Legacy compatibility fields for existing UI components
    defaultReasoningEffort: string;
    showGPT4VOptions: boolean;
    showSemanticRankerOption: boolean;
    showQueryRewritingOption: boolean;
    showReasoningEffortOption: boolean;
    streamingEnabled: boolean;
    showVectorOption: boolean;
    showUserUpload: boolean;
    showLanguagePicker: boolean;
    showSpeechInput: boolean;
    showSpeechOutputBrowser: boolean;
    showSpeechOutputAzure: boolean;
    showChatHistoryBrowser: boolean;
    showChatHistoryCosmos: boolean;
    showAgenticRetrievalOption: boolean;
}

export interface SimpleAPIResponse {
    message?: string;
    success?: boolean;
    error?: string;
}

// Legacy models for compatibility with existing components
export interface ResponseMessage {
    content: string;
    role: string;
}

export interface Thoughts {
    title: string;
    description: any;
    props?: { [key: string]: any };
}

export interface ResponseContext {
    data_points: string[];
    followup_questions: string[] | null;
    thoughts: Thoughts[];
}

export interface ChatAppResponse {
    message: ResponseMessage;
    context: ResponseContext;
    session_state?: any;
}

export interface ChatAppRequest {
    messages: ResponseMessage[];
    session_id?: string;
    session_state?: any; // Add this for compatibility
    context?: {
        overrides?: {
            temperature?: number;
            max_tokens?: number;
            top?: number;
            [key: string]: any;
        };
    };
}

export interface ChatAppResponseOrError {
    message: ResponseMessage;
    context: ResponseContext;
    session_state?: any;
    error?: string;
}

// Streaming response types
export interface StreamChunk {
    type: 'chunk' | 'sources' | 'complete' | 'error' | 'stream_complete';
    content?: string;
    sources?: any[];
    metadata?: any;
    full_response?: string;
    error?: string;
}

// Authentication types
export interface AuthResponse {
    message: string;
    user_info?: UserInfo;
    access_token?: string;
    token_type?: string;
    expires_in?: number;
    instructions?: string[];
}

// Session management
export interface SessionDeleteResponse {
    success: boolean;
    message: string;
    session_id: string;
}

// Speech and media interfaces (for potential future use)
export interface SpeechConfig {
    speechUrls: (string | null)[];
    setSpeechUrls: (urls: (string | null)[]) => void;
    audio: HTMLAudioElement;
    isPlaying: boolean;
    setIsPlaying: (isPlaying: boolean) => void;
}

// Training pipeline types (for admin interface)
export interface TrainingRequest {
    container_name?: string;
    extract_images?: boolean;
    chunk_size?: number;
    chunk_overlap?: number;
}

export interface TrainingStatusResponse {
    status: string;
    message: string;
    start_time?: string;
    end_time?: string;
    progress: Record<string, any>;
    results: Record<string, any>;
    started_by?: string;
}

// File upload types
export interface FileUploadResponse {
    success: boolean;
    message: string;
    filename?: string;
    error?: string;
}

// Error types
export interface APIError {
    detail: string;
    status_code?: number;
    type?: string;
}

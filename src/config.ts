// HEALRAG Frontend Configuration
export const config = {
    // Backend Configuration
    BACKEND_URL: import.meta.env.VITE_HEALRAG_BACKEND_URL || "https://healrag-security.azurewebsites.net",
    
    // Application Settings
    APP_TITLE: import.meta.env.VITE_APP_TITLE || "Intelligent Code Generator",
    VERSION: "1.0.0",
    
    // Session Management
    DEFAULT_SESSION_TIMEOUT: parseInt(import.meta.env.VITE_DEFAULT_SESSION_TIMEOUT) || 3600,
    AUTO_GENERATE_SESSION_ID: true,
    
    // Authentication
    USE_AUTHENTICATION: true,
    REQUIRE_LOGIN: true,
    
    // Chat Configuration
    DEFAULT_TEMPERATURE: 0.7,
    DEFAULT_MAX_TOKENS: 500,
    DEFAULT_TOP_K: 3,
    MAX_CHAT_HISTORY: 50,
    
    // UI Configuration
    ENABLE_STREAMING: true,
    ENABLE_SPEECH: false,
    ENABLE_FILE_UPLOAD: false,
    SHOW_DEBUG_INFO: import.meta.env.VITE_DEBUG_MODE === "true",
    
    // API Configuration
    REQUEST_TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    
    // Azure Storage Configuration
    AZURE_STORAGE: {
        ACCOUNT_NAME: import.meta.env.VITE_AZURE_STORAGE_ACCOUNT_NAME,
        CONTAINER_NAME: import.meta.env.VITE_AZURE_CONTAINER_NAME,
        MD_FILES_FOLDER: "md_files"
    },
    
    // Feature Flags
    FEATURES: {
        CHAT_HISTORY: true,
        SESSION_MANAGEMENT: true,
        DOCUMENT_SEARCH: true,
        ANALYSIS_PANEL: true,
        SETTINGS_PANEL: true,
        USER_PROFILE: true,
        DARK_MODE: true,
        INTERNATIONALIZATION: true
    }
};

export default config; 
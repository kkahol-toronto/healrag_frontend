// Refactored from https://github.com/Azure-Samples/ms-identity-javascript-react-tutorial/blob/main/1-Authentication/1-sign-in/SPA/src/authConfig.js

import { IPublicClientApplication } from "@azure/msal-browser";

const BACKEND_URI = import.meta.env.VITE_HEALRAG_BACKEND_URL || "https://nttcodegenerator.azurewebsites.net";

interface HealragAuthConfig {
    useLogin: boolean;
    requireAccessControl: boolean;
    enableUnauthenticatedAccess: boolean;
    backendUri: string;
}

interface StoredToken {
    access_token: string;
    expires_at: number;
    user_info?: any;
}

// HEALRAG-specific configuration
const healragAuthConfig: HealragAuthConfig = {
    useLogin: true,
    requireAccessControl: true,
    enableUnauthenticatedAccess: false,
    backendUri: BACKEND_URI
};

export const useLogin = healragAuthConfig.useLogin;
export const requireAccessControl = healragAuthConfig.requireAccessControl;
export const enableUnauthenticatedAccess = healragAuthConfig.enableUnauthenticatedAccess;
export const requireLogin = requireAccessControl && !enableUnauthenticatedAccess;

// For compatibility with MSAL-based components, provide minimal config
export const msalConfig = {
    auth: {
        clientId: import.meta.env.VITE_AZURE_CLIENT_ID || "your-client-id-here", // Replace with your actual Azure AD client ID
        authority: "https://login.microsoftonline.com/mirakalous.com", // Using your tenant domain
        redirectUri: window.location.origin,
        postLogoutRedirectUri: window.location.origin,
        navigateToLoginRequestUrl: false
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false
    }
};

export const loginRequest = {
    scopes: ["openid", "profile", "User.Read"]
};

export const getRedirectUri = () => {
    return window.location.origin;
};

// HEALRAG-specific authentication functions
const TOKEN_STORAGE_KEY = 'healrag_auth_token';

/**
 * Store authentication token in local storage
 */
function storeToken(token: string, expiresIn: number = 3600, userInfo?: any): void {
    const storedToken: StoredToken = {
        access_token: token,
        expires_at: Date.now() + (expiresIn * 1000),
        user_info: userInfo
    };
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(storedToken));
}

/**
 * Retrieve stored authentication token
 */
function getStoredToken(): StoredToken | null {
    try {
        const tokenStr = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (!tokenStr) return null;
        
        const token: StoredToken = JSON.parse(tokenStr);
        
        // Check if token is expired
        if (Date.now() >= token.expires_at) {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            return null;
        }
        
        return token;
    } catch (error) {
        console.error('Error retrieving stored token:', error);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        return null;
    }
}

/**
 * Clear stored authentication token
 */
function clearStoredToken(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/**
 * Initiate login by redirecting to HEALRAG backend
 */
export const initiateLogin = (): void => {
    const redirectUri = encodeURIComponent(window.location.origin);
    window.location.href = `${BACKEND_URI}/auth/login?redirect_uri=${redirectUri}`;
};

/**
 * Handle authentication callback (typically called when user returns from Azure AD)
 */
export const handleAuthCallback = (): Promise<boolean> => {
    return new Promise((resolve) => {
        // Debug logging
        console.log('🔍 Checking for auth callback...');
        console.log('🔍 Current URL:', window.location.href);
        console.log('🔍 Search params:', window.location.search);
        console.log('🔍 Hash:', window.location.hash);
        
        // Check if we have a token in URL parameters (if backend redirects back with token)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const expiresIn = urlParams.get('expires_in');
        
        console.log('🔍 Token found in URL:', token ? 'YES' : 'NO');
        
        if (token) {
            console.log('✅ Token found! Storing and cleaning URL...');
            storeToken(token, expiresIn ? parseInt(expiresIn) : 3600);
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
            resolve(true);
        } else {
            console.log('❌ No token found in URL parameters');
            resolve(false);
        }
    });
};

/**
 * Check if user is currently logged in
 */
export const checkLoggedIn = async (client?: IPublicClientApplication): Promise<boolean> => {
    const storedToken = getStoredToken();
    return storedToken !== null;
};

/**
 * Get current access token
 */
export const getToken = async (client?: IPublicClientApplication): Promise<string | undefined> => {
    const storedToken = getStoredToken();
    return storedToken?.access_token;
};

/**
 * Get current user information
 */
export const getUsername = async (client?: IPublicClientApplication): Promise<string | null> => {
    const storedToken = getStoredToken();
    if (!storedToken?.user_info) {
        return null;
    }
    
    return storedToken.user_info.name || storedToken.user_info.email || 'User';
};

/**
 * Get token claims
 */
export const getTokenClaims = async (client?: IPublicClientApplication): Promise<Record<string, unknown> | undefined> => {
    const storedToken = getStoredToken();
    return storedToken?.user_info;
};

/**
 * Logout user
 */
export const logout = (): void => {
    clearStoredToken();
    const redirectUri = encodeURIComponent(window.location.origin);
    window.location.href = `${BACKEND_URI}/auth/logout?redirect_uri=${redirectUri}`;
};

/**
 * Compatibility function for app services logout
 */
export const appServicesLogout = logout;

/**
 * Check if using app services login (always false for HEALRAG)
 */
export const isUsingAppServicesLogin = false;

/**
 * Poll backend to check if authentication succeeded
 */
const pollForAuthSuccess = async (): Promise<boolean> => {
    console.log('🔄 Polling backend for auth status...');
    try {
        const response = await fetch(`${BACKEND_URI}/auth/me`, {
            credentials: 'include' // Include cookies for session-based auth
        });
        
        console.log('🔄 Auth polling response status:', response.status);
        
        if (response.ok) {
            const userInfo = await response.json();
            console.log('✅ User authenticated via session!', userInfo);
            // If backend returns user info, we're authenticated
            // For now, create a dummy token since backend might be using session-based auth
            storeToken('session-authenticated', 3600, userInfo);
            return true;
        } else {
            console.log('❌ Auth polling failed:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('❌ Error checking auth status:', error);
    }
    return false;
};

/**
 * Initialize authentication system
 * Should be called when the app starts
 */
export const initializeAuth = async (): Promise<void> => {
    console.log('🚀 Initializing authentication system...');
    
    // Check if we're returning from authentication via URL parameters
    const callbackHandled = await handleAuthCallback();
    
    console.log('🚀 Callback handled:', callbackHandled);
    
    // If no URL token found, check if we have session-based auth
    if (!callbackHandled) {
        console.log('🚀 No callback token found, checking session auth...');
        await pollForAuthSuccess();
    }
    
    // If we have a token, try to validate it
    const token = await getToken();
    if (token && token !== 'session-authenticated') {
        try {
            const response = await fetch(`${BACKEND_URI}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                // Token is invalid, clear it
                clearStoredToken();
            } else {
                const userInfo = await response.json();
                // Update stored token with fresh user info
                const storedToken = getStoredToken();
                if (storedToken) {
                    storeToken(storedToken.access_token, 
                              Math.floor((storedToken.expires_at - Date.now()) / 1000), 
                              userInfo);
                }
            }
        } catch (error) {
            console.error('Error validating token:', error);
            clearStoredToken();
        }
    }
};

/**
 * Get login URL for manual redirect
 */
export const getLoginUrl = (): string => {
    return `${BACKEND_URI}/auth/login`;
};

/**
 * Check if the current page is the auth callback page
 */
export const isAuthCallback = (): boolean => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('code') || urlParams.has('token') || urlParams.has('access_token');
};

/**
 * Handle special case where backend redirects with token in hash
 */
export const handleHashToken = (): boolean => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get('access_token');
    const expiresIn = params.get('expires_in');
    
    if (token) {
        storeToken(token, expiresIn ? parseInt(expiresIn) : 3600);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return true;
    }
    
    return false;
};

// Export backend URI for other modules
export const HEALRAG_BACKEND_URI = BACKEND_URI;

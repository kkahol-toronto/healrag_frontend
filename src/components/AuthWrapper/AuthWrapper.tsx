import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Stack, Spinner, Text, PrimaryButton, SpinnerSize } from "@fluentui/react";
import { checkLoggedIn, initiateLogin, initializeAuth } from "../../authConfig";
import styles from "./AuthWrapper.module.css";

interface AuthWrapperProps {
    children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                // Initialize authentication system
                await initializeAuth();
                
                // Check if user is logged in
                const loggedIn = await checkLoggedIn();
                
                if (loggedIn) {
                    setIsAuthenticated(true);
                } else if (!hasAttemptedLogin) {
                    // First time loading, attempt automatic login
                    setHasAttemptedLogin(true);
                    initiateLogin();
                    return; // Don't set loading to false yet
                }
                
                setIsLoading(false);
            } catch (error) {
                console.error("Authentication check failed:", error);
                setIsLoading(false);
            }
        };

        checkAuthentication();
    }, [hasAttemptedLogin]);

    const handleRetryLogin = () => {
        setIsLoading(true);
        setHasAttemptedLogin(false);
        initiateLogin();
    };

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <Stack horizontalAlign="center" verticalAlign="center" tokens={{ childrenGap: 20 }}>
                    <Spinner size={SpinnerSize.large} label={t("auth.loading")} />
                    <Text variant="medium">{t("auth.checkingAccess")}</Text>
                </Stack>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className={styles.accessDeniedContainer}>
                <Stack horizontalAlign="center" verticalAlign="center" tokens={{ childrenGap: 20 }}>
                    <div className={styles.accessDeniedIcon}>🚫</div>
                    <Text variant="xLarge" className={styles.accessDeniedTitle}>
                        {t("auth.accessDenied")}
                    </Text>
                    <Text variant="medium" className={styles.accessDeniedMessage}>
                        {t("auth.noAccessMessage")}
                    </Text>
                    <PrimaryButton 
                        text={t("auth.retryLogin")} 
                        onClick={handleRetryLogin}
                        className={styles.retryButton}
                    />
                </Stack>
            </div>
        );
    }

    return <>{children}</>;
}; 
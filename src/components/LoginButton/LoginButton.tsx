import { DefaultButton } from "@fluentui/react";
import { useMsal } from "@azure/msal-react";
import { useTranslation } from "react-i18next";

import styles from "./LoginButton.module.css";
import { initiateLogin, logout, getUsername, checkLoggedIn } from "../../authConfig";
import { useState, useEffect, useContext } from "react";
import { LoginContext } from "../../loginContext";

export const LoginButton = () => {
    const { instance } = useMsal();
    const { loggedIn, setLoggedIn } = useContext(LoginContext);
    const activeAccount = instance.getActiveAccount();
    const [username, setUsername] = useState("");
    const { t } = useTranslation();

    useEffect(() => {
        const fetchUsername = async () => {
            setUsername((await getUsername(instance)) ?? "");
        };

        fetchUsername();
    }, []);

    const handleLoginRedirect = () => {
        // Use HEALRAG backend authentication - redirects to Azure AD via backend
        initiateLogin();
    };
    
    const handleLogout = () => {
        // Use HEALRAG backend logout
        logout();
    };
    return (
        <DefaultButton
            text={loggedIn ? `${t("logout")}\n${username}` : `${t("login")}`}
            className={styles.loginButton}
            onClick={loggedIn ? handleLogout : handleLoginRedirect}
        ></DefaultButton>
    );
};

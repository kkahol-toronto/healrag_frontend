import React from "react";
import { Outlet, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./Layout.module.css";

import { useLogin } from "../../authConfig";

import { LoginButton } from "../../components/LoginButton";
import p32Icon from "../../p32icon.jpg";


const Layout = () => {
    const { t } = useTranslation();

    return (
        <div className={styles.layout}>
            <header className={styles.header} role={"banner"}>
                <div className={styles.headerContainer}>
                    <Link to="/" className={styles.headerTitleContainer}>
                        <img src={p32Icon} alt="Point32 Icon" className={styles.headerIcon} />
                        <h3 className={styles.headerTitle}>{t("headerTitle")}</h3>
                    </Link>

                    <div className={styles.loginMenuContainer}>
                        {useLogin && <LoginButton />}
                    </div>
                </div>
            </header>

            <Outlet />
        </div>
    );
};

export default Layout;

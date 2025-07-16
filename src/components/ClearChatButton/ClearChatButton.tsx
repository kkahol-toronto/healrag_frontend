import { Delete24Regular } from "@fluentui/react-icons";
import { Button } from "@fluentui/react-components";
import { useTranslation } from "react-i18next";

import styles from "./ClearChatButton.module.css";

interface Props {
    className?: string;
    onClick: () => void;
    disabled?: boolean;
}

export const ClearChatButton = ({ className, disabled, onClick }: Props) => {
    const { t, i18n } = useTranslation();
    
    const handleClick = () => {
        console.log("ClearChatButton clicked");
        try {
            onClick();
        } catch (error) {
            console.error("Error in clearChat:", error);
        }
    };
    
    return (
        <div className={`${styles.container} ${className ?? ""}`}>
            <Button 
                icon={<Delete24Regular />} 
                disabled={disabled} 
                onClick={handleClick}
                title={t("clearChat")}
            >
                {t("clearChat")}
            </Button>
        </div>
    );
};

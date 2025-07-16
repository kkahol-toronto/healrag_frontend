import { useState, useEffect, useContext } from "react";
import { Stack, TextField } from "@fluentui/react";
import { Button, Tooltip } from "@fluentui/react-components";
import { Send28Filled, Add24Regular, Broom24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";

import styles from "./QuestionInput.module.css";
import { SpeechInput } from "./SpeechInput";
import { LoginContext } from "../../loginContext";
import { requireLogin } from "../../authConfig";

interface Props {
    onSend: (question: string) => void;
    disabled: boolean;
    initQuestion?: string;
    placeholder?: string;
    clearOnSend?: boolean;
    showSpeechInput?: boolean;
    onNewChat?: () => void;
    onClearHistory?: () => void;
}

export const QuestionInput = ({ onSend, disabled, placeholder, clearOnSend, initQuestion, showSpeechInput, onNewChat, onClearHistory }: Props) => {
    const [question, setQuestion] = useState<string>("");
    const { loggedIn } = useContext(LoginContext);
    const { t } = useTranslation();

    useEffect(() => {
        initQuestion && setQuestion(initQuestion);
    }, [initQuestion]);

    const sendQuestion = () => {
        if (disabled || !question.trim()) {
            return;
        }

        onSend(question);

        if (clearOnSend) {
            setQuestion("");
        }
    };

    const onEnterPress = (ev: React.KeyboardEvent<Element>) => {
        if (ev.key === "Enter" && !ev.shiftKey) {
            ev.preventDefault();
            sendQuestion();
        }
    };

    // Removed composition handlers that might interfere with paste

    const onQuestionChange = (_ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        if (!newValue) {
            setQuestion("");
        } else if (newValue.length <= 1000) {
            setQuestion(newValue);
        }
    };

    const disableRequiredAccessControl = requireLogin && !loggedIn;
    const sendQuestionDisabled = disabled || !question.trim() || disableRequiredAccessControl;

    if (disableRequiredAccessControl) {
        placeholder = "Please login to continue...";
    }

    return (
        <Stack horizontal className={styles.questionInputContainer}>
            <div className={styles.questionInputLeftIcons}>
                {onNewChat && (
                    <Tooltip 
                        content="New Chat" 
                        relationship="label"
                        positioning={{
                            position: 'below',
                            offset: { mainAxis: 10 }
                        }}
                    >
                        <Button size="medium" icon={<Add24Regular />} disabled={disabled} onClick={onNewChat} />
                    </Tooltip>
                )}
                {onClearHistory && (
                    <Tooltip 
                        content="Clear History" 
                        relationship="label"
                        positioning={{
                            position: 'below',
                            offset: { mainAxis: 10 }
                        }}
                    >
                        <Button size="medium" icon={<Broom24Regular />} disabled={disabled} onClick={onClearHistory} />
                    </Tooltip>
                )}
            </div>
            <TextField
                className={styles.questionInputTextArea}
                disabled={disableRequiredAccessControl}
                placeholder={placeholder}
                multiline
                resizable={false}
                borderless
                value={question}
                onChange={onQuestionChange}
                onKeyDown={onEnterPress}
            />
            <div className={styles.questionInputButtonsContainer}>
                <Tooltip content={t("tooltips.submitQuestion")} relationship="label">
                    <Button size="large" icon={<Send28Filled primaryFill="rgba(115, 118, 225, 1)" />} disabled={sendQuestionDisabled} onClick={sendQuestion} />
                </Tooltip>
            </div>
            {showSpeechInput && <SpeechInput updateQuestion={setQuestion} />}
        </Stack>
    );
};

import { useEffect, useState } from "react";
import { Stack, Checkbox, ICheckboxProps, IDropdownOption, IDropdownProps, Dropdown } from "@fluentui/react";
import { useId } from "@fluentui/react-hooks";
import { useTranslation } from "react-i18next";

import styles from "./GPT4VSettings.module.css";
import { GPT4VInput } from "../../api";
import { HelpCallout } from "../HelpCallout";

interface Props {
    gpt4vInputs: GPT4VInput;
    isUseGPT4V: boolean;
    updateGPT4VInputs: (input: GPT4VInput) => void;
    updateUseGPT4V: (useGPT4V: boolean) => void;
}

export const GPT4VSettings = ({ updateGPT4VInputs, updateUseGPT4V, isUseGPT4V, gpt4vInputs }: Props) => {
    const [useGPT4V, setUseGPT4V] = useState<boolean>(isUseGPT4V);
    const [vectorFieldOption, setVectorFieldOption] = useState<GPT4VInput>(gpt4vInputs || GPT4VInput.TextAndImages);

    const onuseGPT4V = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        updateUseGPT4V(!!checked);
        setUseGPT4V(!!checked);
    };

    const onSetGPT4VInput = (_ev: React.FormEvent<HTMLDivElement>, option?: IDropdownOption<GPT4VInput> | undefined) => {
        if (option) {
            const data = option.key as GPT4VInput;
            updateGPT4VInputs(data || GPT4VInput.TextAndImages);
            data && setVectorFieldOption(data);
        }
    };

    useEffect(() => {
        useGPT4V && updateGPT4VInputs(GPT4VInput.TextAndImages);
    }, [useGPT4V]);

    const useGPT4VId = useId("useGPT4V");
    const useGPT4VFieldId = useId("useGPT4VField");
    const gpt4VInputId = useId("gpt4VInput");
    const gpt4VInputFieldId = useId("gpt4VInputField");
    const { t } = useTranslation();

    return (
        <Stack className={styles.container} tokens={{ childrenGap: 10 }}>
            <Checkbox
                id={useGPT4VFieldId}
                checked={useGPT4V}
                label={t("labels.useGPT4V")}
                onChange={onuseGPT4V}
                aria-labelledby={useGPT4VId}
                onRenderLabel={(props: ICheckboxProps | undefined) => (
                    <HelpCallout labelId={useGPT4VId} fieldId={useGPT4VFieldId} helpText={t("helpTexts.useGPT4Vision")} label={props?.label} />
                )}
            />
            {useGPT4V && (
                <Dropdown
                    id={gpt4VInputFieldId}
                    selectedKey={vectorFieldOption}
                    label={t("labels.gpt4VInput.label")}
                    options={[
                        {
                            key: GPT4VInput.TextAndImages,
                            text: t("labels.gpt4VInput.options.textAndImages")
                        },
                        { text: t("labels.gpt4VInput.options.images"), key: GPT4VInput.Images },
                        { text: t("labels.gpt4VInput.options.texts"), key: GPT4VInput.Texts }
                    ]}
                    required
                    onChange={onSetGPT4VInput}
                    aria-labelledby={gpt4VInputId}
                    onRenderLabel={(props: IDropdownProps | undefined) => (
                        <HelpCallout labelId={gpt4VInputId} fieldId={gpt4VInputFieldId} helpText={t("helpTexts.gpt4VisionInputs")} label={props?.label} />
                    )}
                />
            )}
        </Stack>
    );
};

import { useId } from "@fluentui/react-hooks";
import { useTranslation } from "react-i18next";
import { TextField, ITextFieldProps } from "@fluentui/react";
import { HelpCallout } from "../HelpCallout";
import styles from "./Settings.module.css";

// Add type for onRenderLabel
type RenderLabelType = ITextFieldProps;

export interface SettingsProps {
    temperature: number;
    className?: string;
    onChange: (field: string, value: any) => void;
}

export const Settings = ({
    temperature,
    className,
    onChange
}: SettingsProps) => {
    const { t } = useTranslation();

    // Form field IDs
    const temperatureId = useId("temperature");
    const temperatureFieldId = useId("temperatureField");

    const renderLabel = (props: RenderLabelType | undefined, labelId: string, fieldId: string, helpText: string) => (
        <HelpCallout labelId={labelId} fieldId={fieldId} helpText={helpText} label={props?.label} />
    );

    return (
        <div className={className}>
            <TextField
                id={temperatureFieldId}
                className={styles.settingsSeparator}
                label={t("labels.temperature")}
                type="number"
                min={0}
                max={1}
                step={0.1}
                defaultValue={temperature.toString()}
                onChange={(_ev, val) => onChange("temperature", parseFloat(val || "0"))}
                aria-labelledby={temperatureId}
                onRenderLabel={props => renderLabel(props, temperatureId, temperatureFieldId, t("helpTexts.temperature"))}
            />
        </div>
    );
};

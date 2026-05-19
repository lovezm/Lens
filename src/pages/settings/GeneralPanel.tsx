import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";
import SettingSection from "../../components/SettingSection";
import SettingRow from "../../components/SettingRow";
import Toggle from "../../components/Toggle";
import LanguageToggle from "../../components/settings/LanguageToggle";

type Lang = "zh" | "en";

interface GeneralPanelProps {
  lang: Lang;
  onLangChange: (l: Lang) => void;
}

export default function GeneralPanel({ lang, onLangChange }: GeneralPanelProps) {
  const { t } = useTranslation();
  const [launchAtLogin, setLaunchAtLogin] = useState(false);

  useEffect(() => {
    isEnabled().then(setLaunchAtLogin).catch(() => setLaunchAtLogin(false));
  }, []);

  const handleToggle = async (val: boolean) => {
    setLaunchAtLogin(val);
    if (val) await enable();
    else await disable();
  };

  return (
    <SettingSection>
      <SettingRow label={t("settings.general.language")} last={false}>
        <LanguageToggle lang={lang} onChange={onLangChange} />
      </SettingRow>
      <SettingRow
        label={t("settings.general.launchAtLogin")}
        description={t("settings.general.launchAtLoginDesc")}
        last
      >
        <Toggle checked={launchAtLogin} onChange={handleToggle} />
      </SettingRow>
    </SettingSection>
  );
}

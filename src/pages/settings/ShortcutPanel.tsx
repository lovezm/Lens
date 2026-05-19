import { useTranslation } from "react-i18next";
import SettingSection from "../../components/SettingSection";
import SettingRow from "../../components/SettingRow";
import ShortcutRecorder from "../../components/ShortcutRecorder";

interface ShortcutPanelProps {
  accelerator: string;
  onChange: (acc: string) => void;
}

export default function ShortcutPanel({ accelerator, onChange }: ShortcutPanelProps) {
  const { t } = useTranslation();
  return (
    <SettingSection>
      <SettingRow
        label={t("settings.shortcut.summon")}
        description={t("settings.shortcut.summonDesc")}
        last
      >
        <ShortcutRecorder value={accelerator} onChange={onChange} />
      </SettingRow>
    </SettingSection>
  );
}

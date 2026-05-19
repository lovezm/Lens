import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getVersion } from "@tauri-apps/api/app";
import SettingSection from "../../components/SettingSection";

export default function AboutPanel() {
  const { t } = useTranslation();
  const [version, setVersion] = useState("");

  useEffect(() => {
    getVersion().then(setVersion).catch(() => setVersion(""));
  }, []);

  return (
    <SettingSection>
      <div
        style={{
          padding: "20px 16px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <img src="/icon.png" alt="Lens" style={{ width: 56, height: 56, borderRadius: 14 }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em" }}>Lens</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3 }}>
            {t("settings.about.description")}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 5 }}>
            {t("settings.about.version")} {version}
          </div>
        </div>
      </div>
    </SettingSection>
  );
}

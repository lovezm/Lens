import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { getVersion } from "@tauri-apps/api/app";
import { openUrl } from "@tauri-apps/plugin-opener";
import SettingSection from "../../components/SettingSection";

interface UpdateInfo {
  current: string;
  latest: string;
  has_update: boolean;
  release_url: string;
  notes: string;
  published_at: string;
}

type CheckState =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "up-to-date" }
  | { kind: "update"; info: UpdateInfo }
  | { kind: "error"; message: string };

export default function AboutPanel() {
  const { t } = useTranslation();
  const [version, setVersion] = useState("");
  const [state, setState] = useState<CheckState>({ kind: "idle" });

  useEffect(() => {
    getVersion().then(setVersion).catch(() => setVersion(""));
  }, []);

  const check = async () => {
    setState({ kind: "checking" });
    try {
      const info = await invoke<UpdateInfo>("check_for_updates");
      if (info.has_update) {
        setState({ kind: "update", info });
      } else {
        setState({ kind: "up-to-date" });
      }
    } catch (e) {
      setState({ kind: "error", message: String(e) });
    }
  };

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
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em" }}>Lens</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3 }}>
            {t("settings.about.description")}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 5 }}>
            {t("settings.about.version")} {version}
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid var(--border)",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 12, color: "var(--text-secondary)", minWidth: 0, flex: 1 }}>
          <UpdateStateLabel state={state} t={t} />
        </div>
        {state.kind === "update" ? (
          <button
            onClick={() => openUrl(state.info.release_url)}
            style={{
              fontSize: 12,
              padding: "5px 12px",
              borderRadius: 6,
              border: "none",
              background: "var(--accent)",
              color: "white",
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            {t("settings.about.download")}
          </button>
        ) : (
          <button
            onClick={check}
            disabled={state.kind === "checking"}
            style={{
              fontSize: 12,
              padding: "5px 12px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text-primary)",
              fontFamily: "inherit",
              cursor: state.kind === "checking" ? "default" : "pointer",
              opacity: state.kind === "checking" ? 0.6 : 1,
            }}
          >
            {t("settings.about.checkForUpdates")}
          </button>
        )}
      </div>
    </SettingSection>
  );
}

function UpdateStateLabel({
  state,
  t,
}: {
  state: CheckState;
  t: (k: string) => string;
}) {
  switch (state.kind) {
    case "idle":
      return null;
    case "checking":
      return <span>{t("settings.about.checking")}</span>;
    case "up-to-date":
      return (
        <span style={{ color: "var(--green, #34C759)" }}>
          {t("settings.about.upToDate")}
        </span>
      );
    case "update":
      return (
        <span style={{ color: "var(--accent)" }}>
          {t("settings.about.updateAvailable")} v{state.info.latest}
        </span>
      );
    case "error":
      return (
        <span style={{ color: "var(--red, #FF3B30)" }}>
          {t("settings.about.checkFailed")}
        </span>
      );
  }
}

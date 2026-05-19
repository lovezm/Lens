import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import SettingSection from "../../components/SettingSection";
import PermissionRow from "../../components/settings/PermissionRow";

export default function PermissionsPanel() {
  const { t } = useTranslation();
  const [accessibility, setAccessibility] = useState(false);
  const [fda, setFda] = useState(false);

  const refresh = useCallback(() => {
    invoke<boolean>("check_accessibility_permission")
      .then(setAccessibility)
      .catch(() => setAccessibility(false));
    invoke<boolean>("check_full_disk_access")
      .then(setFda)
      .catch(() => setFda(false));
  }, []);

  useEffect(() => {
    refresh();
    const win = getCurrentWindow();
    const unlistenPromise = win.onFocusChanged(({ payload }) => {
      if (payload) refresh();
    });
    return () => {
      unlistenPromise.then((un) => un());
    };
  }, [refresh]);

  return (
    <SettingSection>
      <PermissionRow
        label={t("settings.permissions.accessibility")}
        description={t("settings.permissions.accessibilityDesc")}
        granted={accessibility}
        onOpenSettings={() => invoke("open_accessibility_settings")}
      />
      <PermissionRow
        label={t("settings.permissions.fullDiskAccess")}
        description={t("settings.permissions.fullDiskAccessDesc")}
        granted={fda}
        onOpenSettings={() => invoke("open_full_disk_access_settings")}
        extraAction={{
          label: t("settings.permissions.reveal"),
          onClick: () => invoke("reveal_executable_in_finder"),
        }}
        last
      />
    </SettingSection>
  );
}

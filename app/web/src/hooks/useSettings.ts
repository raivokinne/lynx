import { useState, useEffect, useCallback } from "react";
import type { EditorSettings } from "../types/types";
import { settingsAPI } from "../api/settings";

const defaultSettings: EditorSettings = {
  themeDark: "hc-black",
  themeLight: "vs",
  customThemes: [],
  fontSize: 14,
  minimap: { enabled: true },
  lineNumbers: "on",
  wordWrap: "on",
  tabSize: 2,
  fontFamily: 'Consolas, "Courier New", monospace',
  readOnly: false,
};

export const useSettings = (userId?: string) => {
  const [editorSettings, setEditorSettings] =
    useState<EditorSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  const loadSettings = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await settingsAPI.getSettings();

      if (result.success && result.settings) {
        setEditorSettings(result.settings);
        setHasUnsavedChanges(false);
      } else {
        setError(result.error || "Failed to load settings");
        setEditorSettings(defaultSettings);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load settings",
      );
      setEditorSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadSettings();
    } else {
      setEditorSettings(defaultSettings);
    }
  }, [userId, loadSettings]);

  const updateSetting = useCallback(
    (key: keyof EditorSettings | "minimap", value: any) => {
      setEditorSettings((prev) => {
        const newSettings = { ...prev };

        if (key === "minimap") {
          newSettings.minimap = { enabled: value };
        } else {
          (newSettings as any)[key] = value;
        }

        console.log("Settings updated:", key, value, newSettings);
        return newSettings;
      });
      setHasUnsavedChanges(true);
    },
    [],
  );

  const updateAllSettings = useCallback((newSettings: EditorSettings) => {
    console.log("All settings updated:", newSettings);
    setEditorSettings(newSettings);
    setHasUnsavedChanges(true);
  }, []);

  const saveSettings = useCallback(async (): Promise<boolean> => {
    if (!userId) {
      localStorage.setItem("editor_settings", JSON.stringify(editorSettings));
      setHasUnsavedChanges(false);
      return true;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await settingsAPI.saveSettings(editorSettings);

      if (result.success) {
        setHasUnsavedChanges(false);
        return true;
      } else {
        setError(result.error || "Failed to save settings");
        return false;
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setError(
        error instanceof Error ? error.message : "Failed to save settings",
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId, editorSettings]);

  const resetSettings = useCallback(async (): Promise<boolean> => {
    if (!userId) {
      setEditorSettings(defaultSettings);
      localStorage.removeItem("editor_settings");
      setHasUnsavedChanges(false);
      return true;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await settingsAPI.resetSettings();

      if (result.success) {
        setEditorSettings(defaultSettings);
        setHasUnsavedChanges(false);
        return true;
      } else {
        setError(result.error || "Failed to reset settings");
        return false;
      }
    } catch (error) {
      console.error("Error resetting settings:", error);
      setError(
        error instanceof Error ? error.message : "Failed to reset settings",
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!hasUnsavedChanges || !userId) return;

    const timeoutId = setTimeout(() => {
      saveSettings();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [editorSettings, hasUnsavedChanges, userId, saveSettings]);

  useEffect(() => {
    if (!userId) {
      const savedSettings = localStorage.getItem("editor_settings");
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setEditorSettings({ ...defaultSettings, ...parsed });
        } catch (error) {
          console.error("Error parsing saved settings:", error);
        }
      } else {
        // Add a demo theme for testing
        const demoTheme = {
          id: "demo-dark-theme",
          name: "Demo Dark Theme",
          css: `
.monaco-editor {
    background-color: #0d1117 !important;
    border: 2px solid #30363d !important;
    border-radius: 8px !important;
}

.monaco-editor .margin {
    background-color: #161b22 !important;
}`,
          colors: {
            background: "#0d1117",
            foreground: "#c9d1d9",
            selection: "#264f78",
            lineHighlight: "#21262d",
            cursor: "#58a6ff",
          },
          tokenColors: {
            comment: { foreground: "#8b949e", fontStyle: "italic" },
            string: { foreground: "#7ee787" },
            keyword: { foreground: "#ff7b72", fontStyle: "bold" },
            variable: { foreground: "#ffa657" },
            number: { foreground: "#79c0ff" },
            operator: { foreground: "#c9d1d9" },
          },
          createdAt: new Date().toISOString(),
        };

        setEditorSettings({
          ...defaultSettings,
          customThemes: [demoTheme],
        });
      }
    }
  }, [userId]);

  const clearError = () => setError(null);

  const errorSettings = error;

  return {
    editorSettings,
    updateSetting,
    updateAllSettings,
    saveSettings,
    resetSettings,
    loading,
    errorSettings,
    clearError,
    hasUnsavedChanges,
    refreshSettings: loadSettings,
  };
};

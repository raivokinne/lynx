import { useState, useEffect, useCallback } from "react";
import type { EditorSettings } from "../types/types";
import { settingsAPI } from "../api/settings";
import type { CustomTheme } from "../types/types";

const LOCAL_STORAGE_SETTINGS_KEY = "editor_settings";

const defaultSettings: EditorSettings = {
  theme: "vs-dark", // Set default theme
  themeDark: "vs-dark",
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

  // Helper functions for localStorage
  const loadFromLocalStorage = (): EditorSettings => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to ensure all properties exist
        return { ...defaultSettings, ...parsed };
      }
    } catch (error) {
      console.error("Error loading settings from localStorage:", error);
    }
    return defaultSettings;
  };

  const saveToLocalStorage = (settings: EditorSettings) => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_SETTINGS_KEY,
        JSON.stringify(settings),
      );
    } catch (error) {
      console.error("Error saving settings to localStorage:", error);
    }
  };

  const createDemoTheme = () => ({
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
      function: { foreground: "#DCDCAA" },
      type: { foreground: "#4EC9B0" },
    },
    createdAt: new Date().toISOString(),
  });

  // Replace the registerCustomTheme function in useSettings.ts with this:

  const registerCustomTheme = useCallback((theme: CustomTheme) => {
    if (!(window as any).monaco) {
      console.warn("Monaco not available for theme registration");
      return;
    }

    try {
      const monacoTheme = {
        base: "vs-dark" as const,
        inherit: true,
        rules: Object.entries(theme.tokenColors || {})
          .map(([tokenType, style]: [string, any]) => {
            const rule: any = {
              token: tokenType,
            };

            // Only add foreground if it's a valid color
            if (style?.foreground && style.foreground.trim()) {
              rule.foreground = style.foreground.replace("#", "");
            }

            // Only add background if it's a valid color
            if (style?.background && style.background.trim()) {
              rule.background = style.background.replace("#", "");
            }

            // Only add fontStyle if it's not empty
            if (style?.fontStyle && style.fontStyle.trim()) {
              rule.fontStyle = style.fontStyle;
            }

            return rule;
          })
          // Filter out rules that only have a token property
          .filter((rule) => Object.keys(rule).length > 1),
        colors: {
          "editor.background": theme.colors?.background || "#1e1e1e",
          "editor.foreground": theme.colors?.foreground || "#d4d4d4",
          "editor.selectionBackground": theme.colors?.selection || "#264f78",
          "editor.lineHighlightBackground":
            theme.colors?.lineHighlight || "#2d2d30",
          "editorCursor.foreground": theme.colors?.cursor || "#ffffff",
          "editorWhitespace.foreground": theme.colors?.whitespace || "#404040",
          "editorLineNumber.foreground": "#858585",
          "editorLineNumber.activeForeground": "#c6c6c6",
          "editor.lineHighlightBorder": "#00000000",
          "editorGutter.background": theme.colors?.background || "#1e1e1e",
        },
      };

      // Define the theme with Monaco
      (window as any).monaco.editor.defineTheme(theme.id, monacoTheme);

      // Apply custom CSS if provided
      if (theme.css && theme.css.trim()) {
        const existingStyle = document.getElementById(`theme-${theme.id}`);
        if (existingStyle) {
          existingStyle.remove();
        }
        const style = document.createElement("style");
        style.id = `theme-${theme.id}`;
        style.textContent = theme.css;
        document.head.appendChild(style);
      }

      console.log("Custom theme registered:", theme.id);
    } catch (error) {
      console.error("Failed to register custom theme:", error);
      throw error; // Re-throw so calling code can handle it
    }
  }, []);

  const loadSettings = useCallback(async () => {
    if (!userId) {
      // Load from localStorage for anonymous users
      const localSettings = loadFromLocalStorage();

      // Add demo theme if no custom themes exist
      if (
        localSettings.customThemes &&
        localSettings.customThemes.length === 0
      ) {
        localSettings.customThemes = [createDemoTheme()];
      }

      setEditorSettings(localSettings);
      setHasUnsavedChanges(false);

      // Register custom themes with Monaco if available
      if ((window as any).monaco && localSettings.customThemes) {
        localSettings.customThemes.forEach(registerCustomTheme);
      }

      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await settingsAPI.getSettings();

      if (result.success && result.settings) {
        setEditorSettings(result.settings);
        setHasUnsavedChanges(false);

        // Register custom themes with Monaco if available
        if ((window as any).monaco && result.settings.customThemes) {
          result.settings.customThemes.forEach(registerCustomTheme);
        }
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
  }, [userId, registerCustomTheme]);

  useEffect(() => {
    loadSettings();
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

        // Register custom themes if they were updated
        if (key === "customThemes" && (window as any).monaco) {
          value.forEach(registerCustomTheme);
        }

        // Apply theme if it was changed
        if (key === "theme" && (window as any).monaco) {
          try {
            (window as any).monaco.editor.setTheme(value);
          } catch (error) {
            console.error("Failed to apply theme:", error);
          }
        }

        // Immediately save to localStorage for anonymous users
        if (!userId) {
          saveToLocalStorage(newSettings);
        }

        return newSettings;
      });

      // Only set unsaved changes for authenticated users (since we auto-save locally)
      if (userId) {
        setHasUnsavedChanges(true);
      }
    },
    [userId, registerCustomTheme],
  );

  const saveSettings = useCallback(async (): Promise<boolean> => {
    if (!userId) {
      // For anonymous users, settings are already saved via updateSetting/updateAllSettings
      saveToLocalStorage(editorSettings);
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

  const updateAllSettings = useCallback(
    (newSettings: EditorSettings) => {
      setEditorSettings(newSettings);

      // Register custom themes
      if ((window as any).monaco && newSettings.customThemes) {
        newSettings.customThemes.forEach(registerCustomTheme);
      }

      // Apply current theme
      if ((window as any).monaco && newSettings.theme) {
        try {
          (window as any).monaco.editor.setTheme(newSettings.theme);
        } catch (error) {
          console.error("Failed to apply theme:", error);
        }
      }

      if (!userId) {
        saveToLocalStorage(newSettings);
      } else {
        setHasUnsavedChanges(true);
        saveSettings();
      }
    },
    [userId, saveSettings, registerCustomTheme],
  );

  const resetSettings = useCallback(async (): Promise<boolean> => {
    if (!userId) {
      // Reset to defaults for anonymous users
      const resetSettings = {
        ...defaultSettings,
        customThemes: [createDemoTheme()], // Keep demo theme
      };

      setEditorSettings(resetSettings);
      saveToLocalStorage(resetSettings);
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

  const clearLocalStorage = useCallback(() => {
    if (!userId) {
      try {
        localStorage.removeItem(LOCAL_STORAGE_SETTINGS_KEY);
        setEditorSettings({
          ...defaultSettings,
          customThemes: [createDemoTheme()],
        });
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error("Error clearing localStorage:", error);
      }
    }
  }, [userId]);

  const exportSettings = useCallback(() => {
    const dataStr = JSON.stringify(editorSettings, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "editor-settings.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [editorSettings]);

  const importSettings = useCallback(
    (settingsData: EditorSettings) => {
      try {
        // Validate and merge with defaults
        const validatedSettings = { ...defaultSettings, ...settingsData };
        updateAllSettings(validatedSettings);
        return true;
      } catch (error) {
        console.error("Error importing settings:", error);
        setError("Failed to import settings");
        return false;
      }
    },
    [updateAllSettings],
  );

  // Auto-save for authenticated users only (anonymous users save immediately)
  useEffect(() => {
    if (!hasUnsavedChanges || !userId) return;

    const timeoutId = setTimeout(() => {
      saveSettings();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [editorSettings, hasUnsavedChanges, userId, saveSettings]);

  const clearError = () => setError(null);

  return {
    editorSettings,
    updateSetting,
    updateAllSettings,
    saveSettings,
    resetSettings,
    clearLocalStorage,
    exportSettings,
    importSettings,
    loading,
    error: error,
    clearError,
    hasUnsavedChanges,
    refreshSettings: loadSettings,
    isUsingLocalStorage: !userId,
    registerCustomTheme,
  };
};

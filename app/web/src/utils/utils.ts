import { defaultSettings } from "../types/constants";
import type { EditorSettings } from "../types/types";

export const normalizeEditorSettings = (raw: any): EditorSettings => {
  if (!raw || typeof raw !== "object") {
    return { ...defaultSettings };
  }

  return {
    themeDark:
      typeof raw.themeDark === "string"
        ? raw.themeDark
        : defaultSettings.themeDark,
    themeLight:
      typeof raw.themeLight === "string"
        ? raw.themeLight
        : defaultSettings.themeLight,
    customThemes: Array.isArray(raw.customThemes)
      ? raw.customThemes
      : defaultSettings.customThemes,
    theme:
      typeof raw.activeCustomTheme === "string"
        ? raw.activeCustomTheme
        : defaultSettings.theme,
    fontSize:
      typeof raw.fontSize === "number" && Number.isFinite(raw.fontSize)
        ? raw.fontSize
        : defaultSettings.fontSize,
    minimap: {
      enabled: Boolean(
        raw.minimap?.enabled ?? raw.minimap ?? defaultSettings.minimap!.enabled,
      ),
    },
    lineNumbers:
      typeof raw.lineNumbers === "string"
        ? raw.lineNumbers
        : defaultSettings.lineNumbers,
    wordWrap:
      typeof raw.wordWrap === "string"
        ? raw.wordWrap
        : defaultSettings.wordWrap,
    tabSize:
      typeof raw.tabSize === "number" && Number.isFinite(raw.tabSize)
        ? raw.tabSize
        : defaultSettings.tabSize,
    fontFamily:
      typeof raw.fontFamily === "string"
        ? raw.fontFamily
        : defaultSettings.fontFamily,
    readOnly: Boolean(raw.readOnly ?? defaultSettings.readOnly),
  };
};

export const getAuthToken = () => localStorage.getItem("token");

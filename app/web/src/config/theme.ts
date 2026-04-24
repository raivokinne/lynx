import type { EditorSettings } from "../types/types";

export const colors = {
  dark: {
    bg: {
      primary: "bg-neutral-900",
      secondary: "bg-neutral-800",
      tertiary: "bg-black",
    },
    text: {
      primary: "text-neutral-200",
      secondary: "text-neutral-400",
      tertiary: "text-neutral-500",
    },
    border: {
      primary: "border-neutral-700",
      secondary: "border-neutral-800",
    },
  },
  light: {
    bg: {
      primary: "bg-neutral-100",
      secondary: "bg-neutral-200",
      tertiary: "bg-white",
    },
    text: {
      primary: "text-neutral-700",
      secondary: "text-neutral-600",
      tertiary: "text-neutral-500",
    },
    border: {
      primary: "border-neutral-300",
      secondary: "border-neutral-200",
    },
  },
} as const;

export const defaultEditorSettings: EditorSettings = {
  theme: "vs-dark",
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

export const fontFamilies = [
  { value: 'Consolas, "Courier New", monospace', label: "Consolas" },
  { value: '"Fira Code", monospace', label: "Fira Code" },
  { value: '"JetBrains Mono", monospace', label: "JetBrains Mono" },
] as const;

export const lineNumberOptions = [
  { value: "on", label: "show" },
  { value: "off", label: "hide" },
  { value: "relative", label: "relative" },
] as const;

export const wordWrapOptions = [
  { value: "on", label: "on" },
  { value: "off", label: "off" },
] as const;

export const tabSizeRange = { min: 1, max: 8 };
export const fontSizeRange = { min: 8, max: 36 };

export const getThemeClass = (
  isDarkMode: boolean,
  mode: "primary" | "secondary" | "tertiary" = "primary",
) => {
  return isDarkMode
    ? colors.dark.bg[mode]
    : colors.light.bg[mode];
};

export const getTextClass = (
  isDarkMode: boolean,
  mode: "primary" | "secondary" | "tertiary" = "primary",
) => {
  return isDarkMode
    ? colors.dark.text[mode]
    : colors.light.text[mode];
};

export const getBorderClass = (
  isDarkMode: boolean,
  mode: "primary" | "secondary" = "primary",
) => {
  return isDarkMode
    ? colors.dark.border[mode]
    : colors.light.border[mode];
};

export const getActiveEditorTheme = (
  editorSettings: EditorSettings,
  isDarkMode: boolean,
) => {
  if (editorSettings.theme) {
    return editorSettings.theme;
  }
  return isDarkMode
    ? editorSettings.themeDark || "vs-dark"
    : editorSettings.themeLight || "vs";
};
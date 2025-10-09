import type { EditorSettings } from "./types";

export const defaultSettings: EditorSettings = {
    themeDark: "hc-black",
    themeLight: "vs",
    customThemes: [],
    fontSize: 14,
    minimap: { enabled: true },
    lineNumbers: "on",
    wordWrap: "on",
    tabSize: 2,
    fontFamily: "JetBrains Mono, Fira Code, Monaco, Consolas, monospace",
    readOnly: false,
};

export const API_BASE = "http://localhost:3001/api";

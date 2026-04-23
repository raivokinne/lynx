import React, { useState, useEffect } from "react";
import { Palette, Save, X, RotateCcw } from "lucide-react";
import type { CustomTheme } from "../types/types";
import { showToast } from "../utils/toast";

interface ThemeEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTheme: (theme: CustomTheme) => void;
  currentThemes: CustomTheme[];
  isDarkMode?: boolean;
  editingTheme?: CustomTheme | null;
}

export const ThemeEditor: React.FC<ThemeEditorProps> = ({
  isOpen,
  onClose,
  onSaveTheme,
  currentThemes,
  isDarkMode = true,
  editingTheme = null,
}) => {
  const generateThemeTemplate = (): CustomTheme => {
    return {
      id: `custom-theme-${Date.now()}`,
      name: "My Custom Theme",
      css: `
/* Custom CSS for your theme */
.monaco-editor {
    /* Editor background */
    background-color: #1e1e1e !important;
}

.monaco-editor .margin {
    /* Line number background */
    background-color: #252526 !important;
}

.monaco-editor .scroll-decoration {
    /* Scrollbar track */
    background-color: #2d2d30 !important;
}

/* Line numbers styling */
.monaco-editor .line-numbers {
    color: #858585 !important;
}

/* Current line highlight */
.monaco-editor .current-line {
    background-color: #2d2d30 !important;
}`.trim(),
      colors: {
        background: "#1e1e1e",
        foreground: "#d4d4d4",
        selection: "#264f78",
        lineHighlight: "#2d2d30",
        cursor: "#ffffff",
        whitespace: "#404040",
      },
      tokenColors: {
        comment: { foreground: "#6A9955", fontStyle: "italic" },
        string: { foreground: "#CE9178" },
        keyword: { foreground: "#C586C0" },
        variable: { foreground: "#9CDCFE" },
        number: { foreground: "#B5CEA8" },
        operator: { foreground: "#D4D4D4" },
        function: { foreground: "#DCDCAA" },
        type: { foreground: "#4EC9B0" },
      },
      createdAt: new Date().toISOString(),
    };
  };

  const [currentTheme, setCurrentTheme] = useState<CustomTheme>(() => {
    if (editingTheme) {
      return { ...editingTheme };
    }
    return generateThemeTemplate();
  });

  useEffect(() => {
    if (isOpen) {
      if (editingTheme) {
        setCurrentTheme({ ...editingTheme });
      } else {
        setCurrentTheme(generateThemeTemplate());
      }
    }
  }, [isOpen, editingTheme]);

  useEffect(() => {
    if (isOpen && (window as any).monaco) {
      registerThemeForPreview();
    }
  }, [currentTheme, isOpen]);

  const registerThemeForPreview = () => {
    if (!(window as any).monaco) return;

    try {
      const monacoTheme = {
        base: "vs-dark" as const,
        inherit: true,
        rules: Object.entries(currentTheme.tokenColors || {})
          .map(([tokenType, style]: [string, any]) => {
            const rule: any = {
              token: tokenType,
            };

            if (style?.foreground && style.foreground.trim()) {
              rule.foreground = style.foreground.replace("#", "");
            }

            if (style?.background && style.background.trim()) {
              rule.background = style.background.replace("#", "");
            }

            if (style?.fontStyle && style.fontStyle.trim()) {
              rule.fontStyle = style.fontStyle;
            }

            return rule;
          })
          .filter((rule) => Object.keys(rule).length > 1),
        colors: {
          "editor.background": currentTheme.colors?.background || "#1e1e1e",
          "editor.foreground": currentTheme.colors?.foreground || "#d4d4d4",
          "editor.selectionBackground":
            currentTheme.colors?.selection || "#264f78",
          "editor.lineHighlightBackground":
            currentTheme.colors?.lineHighlight || "#2d2d30",
          "editorCursor.foreground": currentTheme.colors?.cursor || "#ffffff",
          "editorWhitespace.foreground":
            currentTheme.colors?.whitespace || "#404040",
          "editorLineNumber.foreground": "#858585",
          "editorLineNumber.activeForeground": "#c6c6c6",
          "editor.lineHighlightBorder": "#00000000",
          "editorGutter.background":
            currentTheme.colors?.background || "#1e1e1e",
        },
      };

      (window as any).monaco.editor.defineTheme(
        `preview-${currentTheme.id}`,
        monacoTheme,
      );

      if (currentTheme.css) {
        const existingStyle = document.getElementById(
          `preview-theme-${currentTheme.id}`,
        );
        if (existingStyle) {
          existingStyle.remove();
        }
        const style = document.createElement("style");
        style.id = `preview-theme-${currentTheme.id}`;
        style.textContent = currentTheme.css;
        document.head.appendChild(style);
      }
    } catch {
      showToast.error("Failed to register preview theme");
    }
  };

  const handleColorChange = (colorKey: string, value: string) => {
    setCurrentTheme((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value,
      },
    }));
  };

  const handleTokenColorChange = (
    tokenType: string,
    property: string,
    value: string,
  ) => {
    setCurrentTheme((prev) => ({
      ...prev,
      tokenColors: {
        ...prev.tokenColors,
        [tokenType]: {
          ...prev.tokenColors[tokenType],
          [property]: value,
        },
      },
    }));
  };
  const handleSave = () => {
    if (!currentTheme.name.trim()) {
      showToast.error("Please provide a theme name");
      return;
    }

    const existingTheme = currentThemes.find(
      (t) => t.name === currentTheme.name && t.id !== currentTheme.id,
    );

    if (existingTheme) {
      showToast.error("A theme with this name already exists. Please choose a different name.");
      return;
    }

    const finalTheme = {
      ...currentTheme,
      id: editingTheme ? editingTheme.id : `custom-theme-${Date.now()}`,
      createdAt: editingTheme
        ? editingTheme.createdAt
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveTheme(finalTheme);
    showToast.success(editingTheme ? "Theme updated" : "Theme created");
    onClose();
  };

  const resetTheme = () => {
    if (confirm("Are you sure you want to reset all changes?")) {
      if (editingTheme) {
        setCurrentTheme({ ...editingTheme });
      } else {
        setCurrentTheme(generateThemeTemplate());
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div
        className={`w-11/12 h-5/6 max-w-4xl flex flex-col ${isDarkMode ? "bg-neutral-900 border-neutral-700" : "bg-neutral-100 border-neutral-300"} border`}
      >
        <div
          className={`flex items-center justify-between px-3 py-2 border-b ${isDarkMode ? "border-neutral-700" : "border-neutral-300"}`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`p-0.5 ${isDarkMode ? "bg-black" : "bg-neutral-200"}`}
            >
              <Palette
                className={`w-3 h-3 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}
              />
            </div>
            <h2
              className={`text-xs font-mono ${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}
            >
              {editingTheme ? "edit theme" : "create theme"}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={resetTheme}
              className={`flex items-center gap-1 px-2 py-0.5 text-xs font-mono transition-colors ${isDarkMode ? "bg-red-900/50 text-red-500 hover:bg-red-900/70" : "bg-red-100 text-red-600 hover:bg-red-200"}`}
            >
              <RotateCcw className="w-3 h-3" />
              reset
            </button>
            <button
              onClick={onClose}
              className={`p-0.5 transition-colors ${isDarkMode ? "hover:bg-neutral-800" : "hover:bg-neutral-200"}`}
            >
              <X
                className={`w-3 h-3 ${isDarkMode ? "text-neutral-500" : "text-neutral-500"}`}
              />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3
                  className={`text-xs font-mono ${isDarkMode ? "text-neutral-500" : "text-neutral-600"}`}
                >
                  theme name
                </h3>
                <input
                  type="text"
                  placeholder="theme name"
                  value={currentTheme.name}
                  onChange={(e) =>
                    setCurrentTheme((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className={`w-full p-1.5 text-xs font-mono border transition-colors ${
                    isDarkMode
                      ? "bg-black border-neutral-700 text-neutral-300 focus:border-neutral-500"
                      : "bg-white border-neutral-300 focus:border-neutral-400"
                  }`}
                />
              </div>

              <div className="space-y-3">
                <h3
                  className={`text-xs font-mono ${isDarkMode ? "text-neutral-500" : "text-neutral-600"}`}
                >
                  editor colors
                </h3>
                {Object.entries(currentTheme.colors).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <label
                      className={`w-20 text-xs font-mono lowercase ${isDarkMode ? "text-neutral-500" : "text-neutral-600"}`}
                    >
                      {key.replace(/([A-Z])/g, " $1")}:
                    </label>
                    <input
                      type="color"
                      value={value || "#000000"}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className={`w-6 h-5 border cursor-pointer ${
                        isDarkMode ? "border-neutral-700" : "border-neutral-300"
                      }`}
                    />
                    <input
                      type="text"
                      value={value || ""}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className={`flex-1 p-1 text-xs font-mono border transition-colors ${
                        isDarkMode
                          ? "bg-black border-neutral-700 text-neutral-400 focus:border-neutral-500"
                          : "bg-white border-neutral-300 focus:border-neutral-400"
                      }`}
                      placeholder="#hex"
                    />
                  </div>
                ))}
              </div>

              <div className="col-span-2 space-y-3">
                <h3
                  className={`text-xs font-mono ${isDarkMode ? "text-neutral-500" : "text-neutral-600"}`}
                >
                  syntax highlighting
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(currentTheme.tokenColors).map(
                    ([tokenType, style]) => (
                      <div
                        key={tokenType}
                        className={`p-2 border text-xs font-mono ${
                          isDarkMode
                            ? "border-neutral-700 bg-black"
                            : "border-neutral-300 bg-white"
                        }`}
                      >
                        <h4
                          className={`text-xs font-mono mb-2 lowercase ${isDarkMode ? "text-neutral-500" : "text-neutral-600"}`}
                        >
                          {tokenType}
                        </h4>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <label className="w-10 text-xs text-neutral-600">
                              color:
                            </label>
                            <input
                              type="color"
                              value={style.foreground || "#000000"}
                              onChange={(e) =>
                                handleTokenColorChange(
                                  tokenType,
                                  "foreground",
                                  e.target.value,
                                )
                              }
                              className={`w-5 h-4 border cursor-pointer ${
                                isDarkMode
                                  ? "border-neutral-700"
                                  : "border-neutral-300"
                              }`}
                            />
                            <input
                              type="text"
                              value={style.foreground || ""}
                              onChange={(e) =>
                                handleTokenColorChange(
                                  tokenType,
                                  "foreground",
                                  e.target.value,
                                )
                              }
                              className={`flex-1 p-0.5 text-xs font-mono border transition-colors ${
                                isDarkMode
                                  ? "bg-neutral-900 border-neutral-700 text-neutral-400 focus:border-neutral-500"
                                  : "bg-white border-neutral-300 focus:border-neutral-400"
                              }`}
                              placeholder="#hex"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <label className="w-10 text-xs text-neutral-600">
                              style:
                            </label>
                            <select
                              value={style.fontStyle || ""}
                              onChange={(e) =>
                                handleTokenColorChange(
                                  tokenType,
                                  "fontStyle",
                                  e.target.value,
                                )
                              }
                              className={`flex-1 p-0.5 text-xs font-mono border transition-colors ${
                                isDarkMode
                                  ? "bg-neutral-900 border-neutral-700 text-neutral-400 focus:border-neutral-500"
                                  : "bg-white border-neutral-300 focus:border-neutral-400"
                              }`}
                            >
                              <option value="">normal</option>
                              <option value="bold">bold</option>
                              <option value="italic">italic</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`flex items-center justify-end gap-2 px-3 py-2 border-t ${
            isDarkMode ? "border-neutral-700" : "border-neutral-300"
          }`}
        >
          <button
            onClick={onClose}
            className={`px-3 py-1 text-xs font-mono border transition-colors ${
              isDarkMode
                ? "border-neutral-700 hover:bg-neutral-800 text-neutral-400"
                : "border-neutral-300 hover:bg-neutral-200 text-neutral-600"
            }`}
          >
            cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-3 py-1 bg-neutral-700 text-neutral-200 text-xs font-mono hover:bg-neutral-600 transition-colors"
          >
            <Save className="w-3 h-3" />
            {editingTheme ? "update" : "save"}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { Palette, Save, X, RotateCcw } from "lucide-react";
import type { CustomTheme } from "../types/types";

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
  isDarkMode = false,
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

      // Define the theme
      (window as any).monaco.editor.defineTheme(
        `preview-${currentTheme.id}`,
        monacoTheme,
      );

      // Apply custom CSS
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

      console.log("Preview theme registered:", `preview-${currentTheme.id}`);
    } catch (error) {
      console.error("Failed to register preview theme:", error);
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
    // Validate theme before saving
    if (!currentTheme.name.trim()) {
      alert("Please provide a theme name");
      return;
    }

    // Check for duplicate names (excluding current theme if editing)
    const existingTheme = currentThemes.find(
      (t) => t.name === currentTheme.name && t.id !== currentTheme.id,
    );

    if (existingTheme) {
      alert(
        "A theme with this name already exists. Please choose a different name.",
      );
      return;
    }

    // Ensure proper ID and timestamps
    const finalTheme = {
      ...currentTheme,
      id: editingTheme ? editingTheme.id : `custom-theme-${Date.now()}`,
      createdAt: editingTheme
        ? editingTheme.createdAt
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveTheme(finalTheme);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`${isDarkMode ? "bg-black text-white" : "bg-white text-black"} rounded-lg w-11/12 h-5/6 max-w-6xl flex flex-col border border-gray-600`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
        >
          <div className="flex items-center gap-2">
            <Palette className="w-6 h-6" />
            <h2 className="text-xl font-semibold">
              {editingTheme ? "Edit Theme" : "Create Theme"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetTheme}
              className={`px-3 py-1 flex items-center gap-2 bg-red-500 hover:bg-red-600 rounded transition-colors`}
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={onClose}
              className={`p-1 ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"} rounded transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Theme Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Theme Information</h3>
                <input
                  type="text"
                  placeholder="Theme Name"
                  value={currentTheme.name}
                  onChange={(e) =>
                    setCurrentTheme((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className={`w-full p-2 border rounded transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                      : "bg-white border-gray-300 focus:border-blue-500"
                  }`}
                />
              </div>

              {/* Colors */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Editor Colors</h3>
                {Object.entries(currentTheme.colors).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <label className="w-24 text-sm capitalize">
                      {key.replace(/([A-Z])/g, " $1")}:
                    </label>
                    <input
                      type="color"
                      value={value || "#000000"}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className={`w-12 h-8 rounded border cursor-pointer ${
                        isDarkMode ? "border-gray-600" : "border-gray-300"
                      }`}
                    />
                    <input
                      type="text"
                      value={value || ""}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className={`flex-1 p-1 border rounded text-sm transition-colors ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                          : "bg-white border-gray-300 focus:border-blue-500"
                      }`}
                      placeholder="#hex color"
                    />
                  </div>
                ))}
              </div>

              {/* Token Colors */}
              <div className="col-span-2 space-y-4">
                <h3 className="text-lg font-medium">Syntax Highlighting</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(currentTheme.tokenColors).map(
                    ([tokenType, style]) => (
                      <div
                        key={tokenType}
                        className={`p-3 border rounded transition-colors ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-700"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        <h4 className="font-medium capitalize mb-2">
                          {tokenType}
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="w-20 text-sm">Color:</label>
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
                              className={`w-8 h-6 rounded border cursor-pointer ${
                                isDarkMode
                                  ? "border-gray-600"
                                  : "border-gray-300"
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
                              className={`flex-1 p-1 border rounded text-sm transition-colors ${
                                isDarkMode
                                  ? "bg-gray-600 border-gray-500 text-white focus:border-blue-400"
                                  : "bg-white border-gray-300 focus:border-blue-500"
                              }`}
                              placeholder="#hex color"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="w-20 text-sm">Style:</label>
                            <select
                              value={style.fontStyle || ""}
                              onChange={(e) =>
                                handleTokenColorChange(
                                  tokenType,
                                  "fontStyle",
                                  e.target.value,
                                )
                              }
                              className={`flex-1 p-1 border rounded text-sm transition-colors ${
                                isDarkMode
                                  ? "bg-gray-600 border-gray-500 text-white focus:border-blue-400"
                                  : "bg-white border-gray-300 focus:border-blue-500"
                              }`}
                            >
                              <option value="">Normal</option>
                              <option value="bold">Bold</option>
                              <option value="italic">Italic</option>
                              <option value="bold italic">Bold Italic</option>
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

        {/* Footer */}
        <div
          className={`flex items-center justify-end gap-2 p-4 border-t ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-2 border rounded transition-colors ${
              isDarkMode
                ? "border-gray-600 hover:bg-gray-700"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <Save className="w-4 h-4" />
            {editingTheme ? "Update Theme" : "Save Theme"}
          </button>
        </div>
      </div>
    </div>
  );
};

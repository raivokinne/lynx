import React, { useState } from "react";
import { X, Save, RotateCcw, Download, Upload } from "lucide-react";
import { ThemeManagement } from "./ThemeManagement";
import type { EditorSettings } from "../types/types";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  editorSettings: EditorSettings;
  onSettingsChange: (settings: EditorSettings) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  registerCustomTheme?: (theme: any) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  isOpen,
  onClose,
  editorSettings,
  onSettingsChange,
  isDarkMode,
  onToggleDarkMode,
  registerCustomTheme,
}) => {
  const [activeTab, setActiveTab] = useState<"general" | "themes">("general");

  if (!isOpen) return null;

  const handleSettingsChange = (key: keyof EditorSettings, value: any) => {
    onSettingsChange({
      ...editorSettings,
      [key]: value,
    });
  };

  const handleExportSettings = () => {
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
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        onSettingsChange(importedSettings);
        alert("Settings imported successfully!");
      } catch (error) {
        alert("Failed to import settings: Invalid file format");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const resetToDefaults = () => {
    if (confirm("Are you sure you want to reset all settings to defaults?")) {
      const defaultSettings: EditorSettings = {
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
      onSettingsChange(defaultSettings);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"} rounded-lg w-11/12 h-5/6 max-w-4xl flex flex-col`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
        >
          <h2 className="text-xl font-semibold">Settings</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={resetToDefaults}
              className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={onClose}
              className={`p-1 ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"} rounded`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div
          className={`flex border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
        >
          <button
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2 transition-colors ${
              activeTab === "general"
                ? "border-b-2 border-blue-500 text-blue-600"
                : isDarkMode
                  ? "text-gray-300 hover:text-gray-100"
                  : "text-gray-600 hover:text-gray-800"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab("themes")}
            className={`px-4 py-2 transition-colors ${
              activeTab === "themes"
                ? "border-b-2 border-blue-500 text-blue-600"
                : isDarkMode
                  ? "text-gray-300 hover:text-gray-100"
                  : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Themes
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === "general" && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* App Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">App Settings</h3>
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isDarkMode}
                        onChange={onToggleDarkMode}
                        className="w-4 h-4"
                      />
                      Dark Mode
                    </label>
                  </div>
                </div>

                {/* Editor Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Editor Settings</h3>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Font Size
                    </label>
                    <input
                      type="number"
                      min="8"
                      max="36"
                      value={editorSettings.fontSize || 14}
                      onChange={(e) =>
                        handleSettingsChange(
                          "fontSize",
                          parseInt(e.target.value),
                        )
                      }
                      className={`w-full p-2 border rounded ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Font Family
                    </label>
                    <select
                      value={
                        editorSettings.fontFamily ||
                        'Consolas, "Courier New", monospace'
                      }
                      onChange={(e) =>
                        handleSettingsChange("fontFamily", e.target.value)
                      }
                      className={`w-full p-2 border rounded ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      <option value='Consolas, "Courier New", monospace'>
                        Consolas
                      </option>
                      <option value='"Fira Code", monospace'>Fira Code</option>
                      <option value='"Source Code Pro", monospace'>
                        Source Code Pro
                      </option>
                      <option value='"JetBrains Mono", monospace'>
                        JetBrains Mono
                      </option>
                      <option value='"Monaco", monospace'>Monaco</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tab Size
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={editorSettings.tabSize || 2}
                      onChange={(e) =>
                        handleSettingsChange(
                          "tabSize",
                          parseInt(e.target.value),
                        )
                      }
                      className={`w-full p-2 border rounded ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editorSettings.minimap?.enabled ?? true}
                        onChange={(e) =>
                          handleSettingsChange("minimap", {
                            enabled: e.target.checked,
                          })
                        }
                        className="w-4 h-4"
                      />
                      Show Minimap
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Line Numbers
                    </label>
                    <select
                      value={editorSettings.lineNumbers || "on"}
                      onChange={(e) =>
                        handleSettingsChange("lineNumbers", e.target.value)
                      }
                      className={`w-full p-2 border rounded ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      <option value="on">On</option>
                      <option value="off">Off</option>
                      <option value="relative">Relative</option>
                      <option value="interval">Interval</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Word Wrap
                    </label>
                    <select
                      value={editorSettings.wordWrap || "on"}
                      onChange={(e) =>
                        handleSettingsChange("wordWrap", e.target.value)
                      }
                      className={`w-full p-2 border rounded ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      <option value="on">On</option>
                      <option value="off">Off</option>
                      <option value="wordWrapColumn">Word Wrap Column</option>
                      <option value="bounded">Bounded</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editorSettings.readOnly ?? false}
                        onChange={(e) =>
                          handleSettingsChange("readOnly", e.target.checked)
                        }
                        className="w-4 h-4"
                      />
                      Read Only
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "themes" && (
            <div className="p-6">
              <ThemeManagement
                editorSettings={editorSettings}
                onSettingsChange={onSettingsChange}
                isDarkMode={isDarkMode}
                registerCustomTheme={registerCustomTheme || (() => {})}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import {
  X,
  RotateCcw,
  Download,
  Upload,
  Monitor,
  Sun,
  Moon,
  Type,
  Code,
  Eye,
  Settings as SettingsIcon,
  Palette,
  Search,
  Info,
  CheckCircle,
} from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"general" | "editor" | "themes">(
    "general",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [savedNotification, setSavedNotification] = useState(false);

  if (!isOpen) return null;

  const handleSettingsChange = (key: keyof EditorSettings, value: any) => {
    onSettingsChange({
      ...editorSettings,
      [key]: value,
    });

    // Show saved notification
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2000);
  };

  const resetToDefaults = () => {
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
    setShowResetConfirm(false);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2000);
  };

  const exportSettings = () => {
    const settingsData = {
      editorSettings,
      isDarkMode,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(settingsData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "editor-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.editorSettings) {
          onSettingsChange(data.editorSettings);
          if (
            typeof data.isDarkMode === "boolean" &&
            data.isDarkMode !== isDarkMode
          ) {
            onToggleDarkMode();
          }
          setSavedNotification(true);
          setTimeout(() => setSavedNotification(false), 2000);
        }
      } catch (error) {
        alert("Invalid settings file");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const tabs = [
    { id: "general", label: "General", icon: SettingsIcon },
    { id: "editor", label: "Editor", icon: Code },
    { id: "themes", label: "Themes", icon: Palette },
  ];

  const filteredTabs = tabs.filter(
    (tab) =>
      searchQuery === "" ||
      tab.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div
        className={`${
          isDarkMode
            ? "bg-black text-white border-gray-700"
            : "bg-white text-gray-900 border-gray-200"
        } rounded-xl w-full max-w-5xl h-[85vh] flex flex-col border shadow-2xl`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}
            >
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Settings</h2>
              <p
                className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Customize your editor experience
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Saved Notification */}
            {savedNotification && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-lg text-sm animate-fade-in">
                <CheckCircle className="w-4 h-4" />
                Saved
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={exportSettings}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-300 hover:text-white"
                    : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                }`}
                title="Export Settings"
              >
                <Download className="w-4 h-4" />
              </button>

              <label
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-300 hover:text-white"
                    : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                }`}
                title="Import Settings"
              >
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept=".json"
                  onChange={importSettings}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => setShowResetConfirm(true)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "hover:bg-red-900 text-red-400 hover:text-red-300"
                    : "hover:bg-red-50 text-red-600 hover:text-red-700"
                }`}
                title="Reset to Defaults"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-300 hover:text-white"
                    : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div
            className={`w-64 border-r ${isDarkMode ? "border-gray-700 bg-black" : "border-gray-200 bg-gray-50"} flex-shrink-0`}
          >
            {/* Search */}
            <div className="p-4">
              <div className="relative">
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Search settings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm border transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-400"
                  }`}
                />
              </div>
            </div>

            {/* Navigation */}
            <nav className="px-4 pb-4">
              <ul className="space-y-1">
                {filteredTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? isDarkMode
                              ? "bg-blue-600 text-white"
                              : "bg-blue-500 text-white"
                            : isDarkMode
                              ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                              : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "general" && (
              <div className="p-6 space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Monitor className="w-5 h-5" />
                    Appearance
                  </h3>

                  <div
                    className={`p-4 rounded-lg border ${
                      isDarkMode
                        ? "border-gray-700 bg-gray-800"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">
                          Theme Mode
                        </label>
                        <p
                          className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          Choose between light and dark interface
                        </p>
                      </div>

                      <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-200 dark:bg-gray-700">
                        <button
                          onClick={() => !isDarkMode && onToggleDarkMode()}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                            !isDarkMode
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-400 hover:text-gray-300"
                          }`}
                        >
                          <Sun className="w-4 h-4" />
                          Light
                        </button>
                        <button
                          onClick={() => isDarkMode && onToggleDarkMode()}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                            isDarkMode
                              ? "bg-gray-800 text-white shadow-sm"
                              : "text-gray-600 hover:text-gray-700"
                          }`}
                        >
                          <Moon className="w-4 h-4" />
                          Dark
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    About
                  </h3>

                  <div
                    className={`p-4 rounded-lg border ${
                      isDarkMode
                        ? "border-gray-700 bg-gray-800"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Version</span>
                        <span
                          className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          1.0.0
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          Last Updated
                        </span>
                        <span
                          className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          {new Date().toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "editor" && (
              <div className="p-6 space-y-8">
                {/* Typography Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Type className="w-5 h-5" />
                    Typography
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className={`p-4 rounded-lg border ${
                        isDarkMode
                          ? "border-gray-700 bg-gray-800"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <label className="block text-sm font-medium mb-2">
                        Font Size
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="8"
                          max="36"
                          value={editorSettings.fontSize || 14}
                          onChange={(e) =>
                            handleSettingsChange(
                              "fontSize",
                              parseInt(e.target.value),
                            )
                          }
                          className="flex-1"
                        />
                        <span
                          className={`text-sm font-mono px-2 py-1 rounded ${
                            isDarkMode ? "bg-gray-700" : "bg-gray-200"
                          }`}
                        >
                          {editorSettings.fontSize || 14}px
                        </span>
                      </div>
                    </div>

                    <div
                      className={`p-4 rounded-lg border ${
                        isDarkMode
                          ? "border-gray-700 bg-gray-800"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <label className="block text-sm font-medium mb-2">
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
                        className={`w-full p-2 border rounded-lg ${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        <option value='Consolas, "Courier New", monospace'>
                          Consolas
                        </option>
                        <option value='"Fira Code", monospace'>
                          Fira Code
                        </option>
                        <option value='"Source Code Pro", monospace'>
                          Source Code Pro
                        </option>
                        <option value='"JetBrains Mono", monospace'>
                          JetBrains Mono
                        </option>
                        <option value='"Monaco", monospace'>Monaco</option>
                      </select>
                    </div>

                    <div
                      className={`p-4 rounded-lg border ${
                        isDarkMode
                          ? "border-gray-700 bg-gray-800"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <label className="block text-sm font-medium mb-2">
                        Tab Size
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="1"
                          max="8"
                          value={editorSettings.tabSize || 2}
                          onChange={(e) =>
                            handleSettingsChange(
                              "tabSize",
                              parseInt(e.target.value),
                            )
                          }
                          className="flex-1"
                        />
                        <span
                          className={`text-sm font-mono px-2 py-1 rounded ${
                            isDarkMode ? "bg-gray-700" : "bg-gray-200"
                          }`}
                        >
                          {editorSettings.tabSize || 2}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Display Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Display
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className={`p-4 rounded-lg border ${
                        isDarkMode
                          ? "border-gray-700 bg-gray-800"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <label className="block text-sm font-medium mb-2">
                        Line Numbers
                      </label>
                      <select
                        value={editorSettings.lineNumbers || "on"}
                        onChange={(e) =>
                          handleSettingsChange("lineNumbers", e.target.value)
                        }
                        className={`w-full p-2 border rounded-lg ${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        <option value="on">Show</option>
                        <option value="off">Hide</option>
                        <option value="relative">Relative</option>
                        <option value="interval">Interval</option>
                      </select>
                    </div>

                    <div
                      className={`p-4 rounded-lg border ${
                        isDarkMode
                          ? "border-gray-700 bg-gray-800"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <label className="block text-sm font-medium mb-2">
                        Word Wrap
                      </label>
                      <select
                        value={editorSettings.wordWrap || "on"}
                        onChange={(e) =>
                          handleSettingsChange("wordWrap", e.target.value)
                        }
                        className={`w-full p-2 border rounded-lg ${
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

                    <div
                      className={`p-4 rounded-lg border ${
                        isDarkMode
                          ? "border-gray-700 bg-gray-800"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium">Minimap</label>
                          <p
                            className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            Show code overview
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editorSettings.minimap?.enabled ?? true}
                            onChange={(e) =>
                              handleSettingsChange("minimap", {
                                enabled: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    <div
                      className={`p-4 rounded-lg border ${
                        isDarkMode
                          ? "border-gray-700 bg-gray-800"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium">
                            Read Only
                          </label>
                          <p
                            className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            Prevent editing
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editorSettings.readOnly ?? false}
                            onChange={(e) =>
                              handleSettingsChange("readOnly", e.target.checked)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
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

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-60">
          <div
            className={`${
              isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            } rounded-lg p-6 max-w-md mx-4 shadow-xl`}
          >
            <h3 className="text-lg font-semibold mb-3">Reset Settings</h3>
            <p
              className={`mb-6 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Are you sure you want to reset all settings to their default
              values? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={resetToDefaults}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

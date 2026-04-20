import React, { useState, useEffect } from "react";
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
  isDarkMode: isDarkModeProp,
  onToggleDarkMode,
  registerCustomTheme,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(isDarkModeProp);

  useEffect(() => {
    setIsDarkMode(isDarkModeProp);
  }, [isDarkModeProp]);

  const [activeTab, setActiveTab] = useState<"general" | "editor" | "themes">(
    "general",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [savedNotification, setSavedNotification] = useState(false);

  if (!isOpen) return null;

  const handleSettingsChange = (key: keyof EditorSettings, value: unknown) => {
    onSettingsChange({
      ...editorSettings,
      [key]: value,
    });

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
      } catch {
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
      tab.label.toLowerCase().includes(searchQuery.toLocaleLowerCase()),
  );

  return (
    <div
      className={`fixed inset-0 ${isDarkMode ? "bg-black/80" : "bg-white/80"} flex items-center justify-center z-50 p-4`}
    >
      <div
        className={`w-full max-w-4xl h-[80vh] flex flex-col ${isDarkMode ? "bg-neutral-900 border-neutral-700" : "bg-neutral-100 border-neutral-300"} border`}
      >
        <div
          className={`flex items-center justify-between px-4 py-2 ${isDarkMode ? "border-neutral-700" : "border-neutral-300"} border-b`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`p-1 ${isDarkMode ? "bg-black" : "bg-neutral-200"}`}
            >
              <SettingsIcon
                className={`w-4 h-4 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}
              />
            </div>
            <div>
              <h2
                className={`text-sm font-mono ${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}
              >
                settings
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {savedNotification && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-green-900 text-green-400 text-xs font-mono">
                <CheckCircle className="w-3 h-3" />
                saved
              </div>
            )}

            <button
              onClick={exportSettings}
              className={`p-1 transition-colors ${isDarkMode ? "hover:bg-neutral-800 text-neutral-500 hover:text-neutral-400" : "hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600"}`}
              title="Export Settings"
            >
              <Download className="w-4 h-4" />
            </button>

            <label
              className={`p-1 transition-colors cursor-pointer ${isDarkMode ? "hover:bg-neutral-800 text-neutral-500 hover:text-neutral-400" : "hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600"}`}
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
              className={`p-1 transition-colors ${isDarkMode ? "hover:bg-red-900/50 text-red-600 hover:text-red-400" : "hover:bg-red-100 text-red-500 hover:text-red-600"}`}
              title="Reset to Defaults"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className={`p-1 transition-colors ${isDarkMode ? "hover:bg-neutral-800 text-neutral-500 hover:text-neutral-400" : "hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600"}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div
            className={`w-48 border-r shrink-0 ${isDarkMode ? "border-neutral-700 bg-black" : "border-neutral-300 bg-neutral-200"}`}
          >
            <div className="p-3">
              <div className="relative">
                <Search
                  className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 ${isDarkMode ? "text-neutral-600" : "text-neutral-500"}`}
                />
                <input
                  type="text"
                  placeholder="search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-7 pr-2 py-1 text-xs font-mono border ${isDarkMode ? "border-neutral-700 bg-neutral-900 text-neutral-400 placeholder:text-neutral-600 focus:border-neutral-500" : "border-neutral-300 bg-white text-neutral-700 placeholder:text-neutral-400 focus:border-neutral-500"}`}
                />
              </div>
            </div>

            <nav className="px-2 pb-3">
              <ul className="space-y-px">
                {filteredTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() =>
                          setActiveTab(
                            tab.id as "general" | "editor" | "themes",
                          )
                        }
                        className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs font-mono text-left transition-colors ${
                          activeTab === tab.id
                            ? "bg-neutral-800 text-neutral-200"
                            : "text-neutral-500 hover:bg-neutral-800 hover:text-neutral-400"
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        {tab.label.toLowerCase()}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          <div
            className={`flex-1 overflow-y-auto ${isDarkMode ? "bg-neutral-900" : "bg-neutral-100"}`}
          >
            {activeTab === "general" && (
              <div className="p-4 space-y-4">
                <div>
                  <h3
                    className={`text-xs font-mono mb-3 flex items-center gap-2 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}
                  >
                    <Monitor className="w-3 h-3" />
                    appearance
                  </h3>

                  <div
                    className={`p-3 border ${isDarkMode ? "border-neutral-700 bg-black" : "border-neutral-300 bg-white"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <label
                          className={`text-xs font-mono ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}
                        >
                          theme mode
                        </label>
                      </div>

                      <div
                        className={`flex items-center gap-px ${isDarkMode ? "bg-neutral-800" : "bg-neutral-200"}`}
                      >
                        <button
                          onClick={() => !isDarkMode && onToggleDarkMode()}
                          className={`flex items-center gap-1 px-2 py-1 text-xs font-mono transition-colors ${
                            !isDarkMode
                              ? "bg-neutral-200 text-neutral-800"
                              : "text-neutral-500 hover:text-neutral-300"
                          }`}
                        >
                          <Sun className="w-3 h-3" />
                          light
                        </button>
                        <button
                          onClick={() => isDarkMode && onToggleDarkMode()}
                          className={`flex items-center gap-1 px-2 py-1 text-xs font-mono transition-colors ${
                            isDarkMode
                              ? "bg-neutral-700 text-neutral-200"
                              : "text-neutral-500 hover:text-neutral-300"
                          }`}
                        >
                          <Moon className="w-3 h-3" />
                          dark
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3
                    className={`text-xs font-mono mb-3 flex items-center gap-2 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}
                  >
                    <Info className="w-3 h-3" />
                    about
                  </h3>

                  <div
                    className={`p-3 border ${isDarkMode ? "border-neutral-700 bg-black" : "border-neutral-300 bg-white"}`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span
                          className={`text-xs font-mono ${isDarkMode ? "text-neutral-500" : "text-neutral-500"}`}
                        >
                          version
                        </span>
                        <span
                          className={`text-xs font-mono ${isDarkMode ? "text-neutral-400" : "text-neutral-700"}`}
                        >
                          1.0.0
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "editor" && (
              <div className="p-4 space-y-4">
                <div>
                  <h3
                    className={`text-xs font-mono mb-3 flex items-center gap-2 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}
                  >
                    <Type className="w-3 h-3" />
                    typography
                  </h3>

                  <div className="grid grid-cols-1 gap-3">
                    <div
                      className={`p-3 border ${isDarkMode ? "border-neutral-700 bg-black" : "border-neutral-300 bg-white"}`}
                    >
                      <label
                        className={`block text-xs font-mono mb-2 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}
                      >
                        font size
                      </label>
                      <div className="flex items-center gap-2">
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
                          className={`text-xs font-mono px-2 py-0.5 ${isDarkMode ? "bg-neutral-800 text-neutral-400" : "bg-neutral-200 text-neutral-600"}`}
                        >
                          {editorSettings.fontSize || 14}px
                        </span>
                      </div>
                    </div>

                    <div
                      className={`p-3 border ${isDarkMode ? "border-neutral-700 bg-black" : "border-neutral-300 bg-white"}`}
                    >
                      <label
                        className={`block text-xs font-mono mb-2 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}
                      >
                        font family
                      </label>
                      <select
                        value={
                          editorSettings.fontFamily ||
                          'Consolas, "Courier New", monospace'
                        }
                        onChange={(e) =>
                          handleSettingsChange("fontFamily", e.target.value)
                        }
                        className={`w-full p-2 text-xs font-mono border ${isDarkMode ? "border-neutral-700 bg-neutral-900 text-neutral-400 focus:border-neutral-500" : "border-neutral-300 bg-white text-neutral-700 focus:border-neutral-500"}`}
                      >
                        <option value='Consolas, "Courier New", monospace'>
                          Consolas
                        </option>
                        <option value='"Fira Code", monospace'>
                          Fira Code
                        </option>
                        <option value='"JetBrains Mono", monospace'>
                          JetBrains Mono
                        </option>
                      </select>
                    </div>

                    <div
                      className={`p-3 border ${isDarkMode ? "border-neutral-700 bg-black" : "border-neutral-300 bg-white"}`}
                    >
                      <label
                        className={`block text-xs font-mono mb-2 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}
                      >
                        tab size
                      </label>
                      <div className="flex items-center gap-2">
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
                          className={`text-xs font-mono px-2 py-0.5 ${isDarkMode ? "bg-neutral-800 text-neutral-400" : "bg-neutral-200 text-neutral-600"}`}
                        >
                          {editorSettings.tabSize || 2}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3
                    className={`text-xs font-mono mb-3 flex items-center gap-2 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}
                  >
                    <Eye className="w-3 h-3" />
                    display
                  </h3>

                  <div className="grid grid-cols-1 gap-3">
                    <div
                      className={`p-3 border ${isDarkMode ? "border-neutral-700 bg-black" : "border-neutral-300 bg-white"}`}
                    >
                      <label
                        className={`block text-xs font-mono mb-2 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}
                      >
                        line numbers
                      </label>
                      <select
                        value={editorSettings.lineNumbers || "on"}
                        onChange={(e) =>
                          handleSettingsChange("lineNumbers", e.target.value)
                        }
                        className={`w-full p-2 text-xs font-mono border ${isDarkMode ? "border-neutral-700 bg-neutral-900 text-neutral-400 focus:border-neutral-500" : "border-neutral-300 bg-white text-neutral-700 focus:border-neutral-500"}`}
                      >
                        <option value="on">show</option>
                        <option value="off">hide</option>
                        <option value="relative">relative</option>
                      </select>
                    </div>

                    <div
                      className={`p-3 border ${isDarkMode ? "border-neutral-700 bg-black" : "border-neutral-300 bg-white"}`}
                    >
                      <label
                        className={`block text-xs font-mono mb-2 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}
                      >
                        word wrap
                      </label>
                      <select
                        value={editorSettings.wordWrap || "on"}
                        onChange={(e) =>
                          handleSettingsChange("wordWrap", e.target.value)
                        }
                        className={`w-full p-2 text-xs font-mono border ${isDarkMode ? "border-neutral-700 bg-neutral-900 text-neutral-400 focus:border-neutral-500" : "border-neutral-300 bg-white text-neutral-700 focus:border-neutral-500"}`}
                      >
                        <option value="on">on</option>
                        <option value="off">off</option>
                      </select>
                    </div>

                    <div
                      className={`p-3 border ${isDarkMode ? "border-neutral-700 bg-black" : "border-neutral-300 bg-white"}`}
                    >
                      <div className="flex items-center justify-between">
                        <label
                          className={`text-xs font-mono ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}
                        >
                          minimap
                        </label>
                        <input
                          type="checkbox"
                          checked={editorSettings.minimap?.enabled ?? true}
                          onChange={(e) =>
                            handleSettingsChange("minimap", {
                              enabled: e.target.checked,
                            })
                          }
                          className="w-3 h-3"
                        />
                      </div>
                    </div>

                    <div
                      className={`p-3 border ${isDarkMode ? "border-neutral-700 bg-black" : "border-neutral-300 bg-white"}`}
                    >
                      <div className="flex items-center justify-between">
                        <label
                          className={`text-xs font-mono ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}
                        >
                          read only
                        </label>
                        <input
                          type="checkbox"
                          checked={editorSettings.readOnly ?? false}
                          onChange={(e) =>
                            handleSettingsChange("readOnly", e.target.checked)
                          }
                          className="w-3 h-3"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "themes" && (
              <div className="p-4">
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

      {showResetConfirm && (
        <div
          className={`fixed inset-0 ${isDarkMode ? "bg-black/80" : "bg-white/80"} flex items-center justify-center z-60`}
        >
          <div
            className={`p-4 max-w-xs border ${isDarkMode ? "bg-neutral-900 text-neutral-300 border-neutral-700" : "bg-neutral-100 text-neutral-700 border-neutral-300"}`}
          >
            <h3
              className={`text-sm font-mono mb-2 ${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}
            >
              reset settings
            </h3>
            <p
              className={`mb-4 text-xs font-mono ${isDarkMode ? "text-neutral-500" : "text-neutral-500"}`}
            >
              reset all to defaults?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className={`px-2 py-1 text-xs font-mono transition-colors ${isDarkMode ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-400" : "bg-neutral-200 hover:bg-neutral-300 text-neutral-600"}`}
              >
                cancel
              </button>
              <button
                onClick={resetToDefaults}
                className={`px-2 py-1 text-xs font-mono transition-colors ${isDarkMode ? "bg-red-900 hover:bg-red-800 text-red-400" : "bg-red-200 hover:bg-red-300 text-red-600"}`}
              >
                reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  X,
  Palette,
  Type,
  Grid,
  Wrench,
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
}

export const Settings: React.FC<SettingsProps> = ({
  isOpen,
  onClose,
  editorSettings,
  onSettingsChange,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [activeTab, setActiveTab] = useState<"general" | "themes" | "editor">(
    "general",
  );

  if (!isOpen) return null;

  const handleSettingChange = (key: keyof EditorSettings, value: any) => {
    onSettingsChange({
      ...editorSettings,
      [key]: value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"} rounded-lg w-11/12 h-5/6 max-w-5xl flex flex-col`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
        >
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1 ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"} rounded`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div
            className={`w-64 border-r ${isDarkMode ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"} p-4`}
          >
            <nav className="space-y-2">
              {[
                { id: "general", label: "General", icon: Wrench },
                { id: "themes", label: "Themes", icon: Palette },
                { id: "editor", label: "Editor", icon: Type },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? isDarkMode
                        ? "bg-blue-900 text-blue-300"
                        : "bg-blue-100 text-blue-700"
                      : isDarkMode
                        ? "text-gray-300 hover:bg-gray-800"
                        : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "general" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">General Settings</h3>

                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Dark Mode</label>
                    <p
                      className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"} mt-1`}
                    >
                      Switch between light and dark interface
                    </p>
                  </div>
                  <button
                    onClick={onToggleDarkMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isDarkMode ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isDarkMode ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Read Only Mode */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">
                      Read Only Mode
                    </label>
                    <p
                      className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"} mt-1`}
                    >
                      Prevent editing of code
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleSettingChange("readOnly", !editorSettings.readOnly)
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      editorSettings.readOnly
                        ? "bg-blue-600"
                        : isDarkMode
                          ? "bg-gray-600"
                          : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        editorSettings.readOnly
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {activeTab === "themes" && (
              <ThemeManagement
                editorSettings={editorSettings}
                onSettingsChange={onSettingsChange}
                isDarkMode={isDarkMode}
              />
            )}

            {activeTab === "editor" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Editor Settings</h3>

                {/* Font Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Font Size
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="30"
                      value={editorSettings.fontSize}
                      onChange={(e) =>
                        handleSettingChange(
                          "fontSize",
                          parseInt(e.target.value),
                        )
                      }
                      className={`w-full p-2 border rounded ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Font Family
                    </label>
                    <select
                      value={editorSettings.fontFamily}
                      onChange={(e) =>
                        handleSettingChange("fontFamily", e.target.value)
                      }
                      className={`w-full p-2 border rounded ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                    >
                      <option value="'Cascadia Code', 'Fira Code', Consolas, monospace">
                        Cascadia Code
                      </option>
                      <option value="'Fira Code', Consolas, monospace">
                        Fira Code
                      </option>
                      <option value="Consolas, monospace">Consolas</option>
                      <option value="'JetBrains Mono', monospace">
                        JetBrains Mono
                      </option>
                      <option value="'Source Code Pro', monospace">
                        Source Code Pro
                      </option>
                      <option value="monospace">System Monospace</option>
                    </select>
                  </div>
                </div>

                {/* Tab Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tab Size
                    </label>
                    <select
                      value={editorSettings.tabSize}
                      onChange={(e) =>
                        handleSettingChange("tabSize", parseInt(e.target.value))
                      }
                      className={`w-full p-2 border rounded ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                    >
                      <option value={2}>2 spaces</option>
                      <option value={4}>4 spaces</option>
                      <option value={8}>8 spaces</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Word Wrap
                    </label>
                    <select
                      value={editorSettings.wordWrap}
                      onChange={(e) =>
                        handleSettingChange("wordWrap", e.target.value)
                      }
                      className={`w-full p-2 border rounded ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                    >
                      <option value="off">Off</option>
                      <option value="on">On</option>
                      <option value="wordWrapColumn">At Column</option>
                      <option value="bounded">Bounded</option>
                    </select>
                  </div>
                </div>

                {/* Display Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium">Display Options</h4>

                  {/* Line Numbers */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Line Numbers
                    </label>
                    <select
                      value={editorSettings.lineNumbers}
                      onChange={(e) =>
                        handleSettingChange("lineNumbers", e.target.value)
                      }
                      className={`w-full p-2 border rounded ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                    >
                      <option value="on">On</option>
                      <option value="off">Off</option>
                      <option value="relative">Relative</option>
                      <option value="interval">Interval</option>
                    </select>
                  </div>

                  {/* Minimap */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Minimap</label>
                      <p
                        className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"} mt-1`}
                      >
                        Show code overview on the right side
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleSettingChange("minimap", {
                          enabled: !editorSettings.minimap.enabled,
                        })
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        editorSettings.minimap.enabled
                          ? "bg-blue-600"
                          : isDarkMode
                            ? "bg-gray-600"
                            : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          editorSettings.minimap.enabled
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Reset to Defaults */}
                <div
                  className={`pt-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
                >
                  <button
                    onClick={() => {
                      onSettingsChange({
                        ...editorSettings,
                        fontSize: 14,
                        fontFamily:
                          "'Cascadia Code', 'Fira Code', Consolas, monospace",
                        tabSize: 2,
                        wordWrap: "on",
                        lineNumbers: "on",
                        minimap: { enabled: true },
                      });
                    }}
                    className={`px-4 py-2 text-white rounded ${isDarkMode ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-500 hover:bg-gray-600"}`}
                  >
                    Reset to Defaults
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-end gap-2 p-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

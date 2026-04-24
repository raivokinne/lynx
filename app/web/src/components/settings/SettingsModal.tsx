import { useState } from "react";
import {
  X,
  RotateCcw,
  Download,
  Upload,
  Settings as SettingsIcon,
} from "lucide-react";
import { useSettings } from "../../hooks/useSettings";
import { useTheme } from "../../contexts/ThemeContext";
import { Modal, ConfirmDialog } from "../ui/Modal";
import { Button } from "../ui/Form";
import { GeneralTab } from "./GeneralTab";
import { EditorTab } from "./EditorTab";
import { ThemesTab } from "./ThemesTab";
import type { EditorSettings } from "../../types/types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const tabs = [
  { id: "general", label: "General" },
  { id: "editor", label: "Editor" },
  { id: "themes", label: "Themes" },
] as const;

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { editorSettings, updateAllSettings } = useSettings();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSettingsChange = (settings: EditorSettings) => {
    updateAllSettings(settings);
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
    updateAllSettings(defaultSettings);
    setShowResetConfirm(false);
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
          handleSettingsChange(data.editorSettings);
        }
      } catch {
        alert("Invalid settings file");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const filteredTabs = tabs.filter(
    (tab) =>
      searchQuery === "" ||
      tab.label.toLowerCase().includes(searchQuery.toLocaleLowerCase()),
  );

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isDarkMode={isDarkMode} size="xl">
      <div
        className={`flex flex-col h-[80vh] ${
          isDarkMode ? "bg-neutral-900 border-neutral-700" : "bg-neutral-100 border-neutral-300"
        } border`}
      >
        <div
          className={`flex items-center justify-between px-4 py-2 border-b ${
            isDarkMode ? "border-neutral-700" : "border-neutral-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className={`p-1 ${isDarkMode ? "bg-black" : "bg-neutral-200"}`}>
              <SettingsIcon
                className={`w-4 h-4 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}
              />
            </div>
            <h2
              className={`text-sm font-mono ${
                isDarkMode ? "text-neutral-300" : "text-neutral-700"
              }`}
            >
              settings
            </h2>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              isDarkMode={isDarkMode}
              onClick={exportSettings}
              title="Export Settings"
            >
              <Download className="w-4 h-4" />
            </Button>
            <label
              className={`p-1 transition-colors cursor-pointer ${
                isDarkMode
                  ? "hover:bg-neutral-800 text-neutral-500 hover:text-neutral-400"
                  : "hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600"
              }`}
            >
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept=".json"
                onChange={importSettings}
                className="hidden"
              />
            </label>
            <Button
              variant="ghost"
              size="sm"
              isDarkMode={isDarkMode}
              onClick={() => setShowResetConfirm(true)}
              title="Reset to Defaults"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              isDarkMode={isDarkMode}
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div
            className={`w-48 border-r shrink-0 ${
              isDarkMode
                ? "border-neutral-700 bg-black"
                : "border-neutral-300 bg-neutral-200"
            }`}
          >
            <div className="p-3">
              <input
                type="text"
                placeholder="search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-2 py-1 text-xs font-mono border ${
                  isDarkMode
                    ? "border-neutral-700 bg-neutral-900 text-neutral-400 placeholder:text-neutral-600 focus:border-neutral-500"
                    : "border-neutral-300 bg-white text-neutral-700 placeholder:text-neutral-400 focus:border-neutral-500"
                }`}
              />
            </div>
            <nav className="px-2 pb-3">
              <ul className="space-y-px">
                {filteredTabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id as (typeof tabs)[number]["id"])}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs font-mono text-left transition-colors ${
                        activeTab === tab.id
                          ? isDarkMode
                            ? "bg-neutral-800 text-neutral-200"
                            : "bg-neutral-300 text-neutral-700"
                          : isDarkMode
                            ? "text-neutral-500 hover:bg-neutral-800 hover:text-neutral-400"
                            : "text-neutral-500 hover:bg-neutral-300 hover:text-neutral-600"
                      }`}
                    >
                      {tab.label.toLowerCase()}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div
            className={`flex-1 overflow-y-auto ${
              isDarkMode ? "bg-neutral-900" : "bg-neutral-100"
            }`}
          >
            {activeTab === "general" && (
              <GeneralTab isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
            )}
            {activeTab === "editor" && (
              <EditorTab
                isDarkMode={isDarkMode}
                editorSettings={editorSettings}
                onSettingsChange={handleSettingsChange}
              />
            )}
            {activeTab === "themes" && (
              <ThemesTab
                isDarkMode={isDarkMode}
                editorSettings={editorSettings}
                onSettingsChange={handleSettingsChange}
              />
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={resetToDefaults}
        title="reset settings"
        message="reset all to defaults?"
        confirmLabel="reset"
        isDarkMode={isDarkMode}
        variant="danger"
      />
    </Modal>
  );
};
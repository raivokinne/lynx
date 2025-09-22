import React, { useState } from "react";
import {
  X,
  Save,
  RotateCcw,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { EditorSettings } from "../types/types";

interface SettingsModalProps {
  isDarkMode: boolean;
  editorSettings: EditorSettings;
  onUpdateSetting: (key: keyof EditorSettings | "minimap", value: any) => void;
  onSaveSettings: () => Promise<boolean>;
  onResetSettings: () => Promise<boolean>;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
  hasUnsavedChanges?: boolean;
  onClearError?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isDarkMode,
  editorSettings,
  onUpdateSetting,
  onSaveSettings,
  onResetSettings,
  onClose,
  loading = false,
  error = null,
  hasUnsavedChanges = false,
  onClearError,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    const success = await onSaveSettings();

    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }

    setIsSaving(false);
  };

  const handleReset = async () => {
    setIsResetting(true);
    setSaveSuccess(false);

    const success = await onResetSettings();

    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }

    setIsResetting(false);
  };

  const handleClose = () => {
    if (onClearError) onClearError();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div
        className={`max-w-lg w-full mx-4 p-6 rounded-xl ${isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"} border max-h-[80vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3
              className={`${isDarkMode ? "text-white" : "text-black"} font-semibold`}
            >
              Redaktora iestatījumi
            </h3>
            {hasUnsavedChanges && (
              <span
                className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? "bg-yellow-900 text-yellow-200" : "bg-yellow-100 text-yellow-800"}`}
              >
                Nesaglabātas izmaiņas
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            className={`p-1 rounded ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
            disabled={loading}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div
            className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${isDarkMode ? "bg-red-900/50 border-red-800 text-red-200" : "bg-red-50 border-red-200 text-red-800"} border`}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
            {onClearError && (
              <button
                onClick={onClearError}
                className={`ml-auto p-1 rounded ${isDarkMode ? "hover:bg-red-800" : "hover:bg-red-100"}`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Success message */}
        {saveSuccess && (
          <div
            className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${isDarkMode ? "bg-green-900/50 border-green-800 text-green-200" : "bg-green-50 border-green-200 text-green-800"} border`}
          >
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">Iestatījumi saglabāti veiksmīgi!</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-3">
            <label
              className={`block text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Tumšā tēma
            </label>
            <select
              value={editorSettings.themeDark || "hc-black"}
              onChange={(e) => onUpdateSetting("themeDark", e.target.value)}
              disabled={loading}
              className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } disabled:opacity-50`}
            >
              <option value="hc-black">High Contrast Black</option>
              <option value="vs-dark">VS Dark</option>
              <option value="monokai">Monokai</option>
            </select>
          </div>

          <div className="space-y-3">
            <label
              className={`block text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Gaišā tēma
            </label>
            <select
              value={editorSettings.themeLight || "vs"}
              onChange={(e) => onUpdateSetting("themeLight", e.target.value)}
              disabled={loading}
              className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } disabled:opacity-50`}
            >
              <option value="vs">VS Light</option>
              <option value="hc-light">High Contrast Light</option>
            </select>
          </div>

          <div className="space-y-3">
            <label
              className={`block text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Fonta izmērs: {editorSettings.fontSize}
            </label>
            <input
              type="range"
              min={10}
              max={36}
              value={editorSettings.fontSize || 14}
              onChange={(e) =>
                onUpdateSetting("fontSize", Number(e.target.value))
              }
              disabled={loading}
              className="w-full disabled:opacity-50"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>10px</span>
              <span>36px</span>
            </div>
          </div>

          <div className="space-y-3">
            <label
              className={`block text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Mini karte
            </label>
            <select
              value={editorSettings.minimap?.enabled ? "on" : "off"}
              onChange={(e) =>
                onUpdateSetting("minimap", e.target.value === "on")
              }
              disabled={loading}
              className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } disabled:opacity-50`}
            >
              <option value="on">Ieslēgta</option>
              <option value="off">Izslēgta</option>
            </select>
          </div>

          <div className="space-y-3">
            <label
              className={`block text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Rindu numuri
            </label>
            <select
              value={editorSettings.lineNumbers || "on"}
              onChange={(e) => onUpdateSetting("lineNumbers", e.target.value)}
              disabled={loading}
              className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } disabled:opacity-50`}
            >
              <option value="on">Ieslēgti</option>
              <option value="off">Izslēgti</option>
              <option value="relative">Relatīvi</option>
            </select>
          </div>

          <div className="space-y-3">
            <label
              className={`block text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Teksta pārnešana
            </label>
            <select
              value={editorSettings.wordWrap || "on"}
              onChange={(e) => onUpdateSetting("wordWrap", e.target.value)}
              disabled={loading}
              className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } disabled:opacity-50`}
            >
              <option value="on">Ieslēgta</option>
              <option value="off">Izslēgta</option>
            </select>
          </div>

          <div className="space-y-3">
            <label
              className={`block text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Tab izmērs
            </label>
            <select
              value={editorSettings.tabSize?.toString() || "2"}
              onChange={(e) =>
                onUpdateSetting("tabSize", Number(e.target.value))
              }
              disabled={loading}
              className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } disabled:opacity-50`}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="6">6</option>
              <option value="8">8</option>
            </select>
          </div>

          <div className="space-y-3">
            <label
              className={`block text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Fonta saime
            </label>
            <input
              type="text"
              value={
                editorSettings.fontFamily ||
                'Consolas, "Courier New", monospace'
              }
              onChange={(e) => onUpdateSetting("fontFamily", e.target.value)}
              disabled={loading}
              className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } disabled:opacity-50`}
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              id="readonly-checkbox"
              type="checkbox"
              checked={!!editorSettings.readOnly}
              onChange={(e) => onUpdateSetting("readOnly", e.target.checked)}
              disabled={loading}
              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
            />
            <label
              htmlFor="readonly-checkbox"
              className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Tikai lasāms
            </label>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleReset}
            disabled={loading || isSaving || isResetting}
            className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 ${
              isDarkMode
                ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isResetting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            Atiestatīt
          </button>

          <button
            onClick={handleSave}
            disabled={loading || isSaving || isResetting}
            className="flex-1 p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Saglabāt
          </button>
        </div>
      </div>
    </div>
  );
};

import { Type, Eye } from "lucide-react";
import { showToast } from "../../utils/toast";
import {
  fontFamilies,
  lineNumberOptions,
  wordWrapOptions,
  fontSizeRange,
  tabSizeRange,
} from "../../config/theme";
import type { EditorSettings } from "../../types/types";

interface EditorTabProps {
  isDarkMode: boolean;
  editorSettings: EditorSettings;
  onSettingsChange: (settings: EditorSettings) => void;
}

export const EditorTab = ({
  isDarkMode,
  editorSettings,
  onSettingsChange,
}: EditorTabProps) => {
  const handleChange = (key: keyof EditorSettings, value: unknown) => {
    onSettingsChange({ ...editorSettings, [key]: value });
    showToast.success("Settings saved");
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3
          className={`text-xs font-mono mb-3 flex items-center gap-2 ${
            isDarkMode ? "text-neutral-400" : "text-neutral-600"
          }`}
        >
          <Type className="w-3 h-3" />
          typography
        </h3>

        <div className="grid grid-cols-1 gap-3">
          <div
            className={`p-3 border ${
              isDarkMode ? "border-neutral-700 bg-black" : "border-neutral-300 bg-white"
            }`}
          >
            <label
              className={`block text-xs font-mono mb-2 ${
                isDarkMode ? "text-neutral-400" : "text-neutral-600"
              }`}
            >
              font size
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={fontSizeRange.min}
                max={fontSizeRange.max}
                value={editorSettings.fontSize || 14}
                onChange={(e) => handleChange("fontSize", parseInt(e.target.value))}
                className={`flex-1 ${
                  isDarkMode ? "accent-neutral-400" : "accent-neutral-600"
                }`}
              />
              <span
                className={`text-xs font-mono px-2 py-0.5 ${
                  isDarkMode ? "bg-neutral-800 text-neutral-400" : "bg-neutral-200 text-neutral-600"
                }`}
              >
                {editorSettings.fontSize || 14}px
              </span>
            </div>
          </div>

          <div
            className={`p-3 border ${
              isDarkMode ? "border-neutral-700 bg-black" : "border-neutral-300 bg-white"
            }`}
          >
            <label
              className={`block text-xs font-mono mb-2 ${
                isDarkMode ? "text-neutral-400" : "text-neutral-600"
              }`}
            >
              font family
            </label>
            <select
              value={editorSettings.fontFamily || 'Consolas, "Courier New", monospace'}
              onChange={(e) => handleChange("fontFamily", e.target.value)}
              className={`w-full p-2 text-xs font-mono border ${
                isDarkMode
                  ? "border-neutral-700 bg-neutral-900 text-neutral-400 focus:border-neutral-500"
                  : "border-neutral-300 bg-white text-neutral-700 focus:border-neutral-500"
              }`}
            >
              {fontFamilies.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          <div
            className={`p-3 border ${
              isDarkMode ? "border-neutral-700 bg-black" : "border-neutral-300 bg-white"
            }`}
          >
            <label
              className={`block text-xs font-mono mb-2 ${
                isDarkMode ? "text-neutral-400" : "text-neutral-600"
              }`}
            >
              tab size
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={tabSizeRange.min}
                max={tabSizeRange.max}
                value={editorSettings.tabSize || 2}
                onChange={(e) => handleChange("tabSize", parseInt(e.target.value))}
                className={`flex-1 ${
                  isDarkMode ? "accent-neutral-400" : "accent-neutral-600"
                }`}
              />
              <span
                className={`text-xs font-mono px-2 py-0.5 ${
                  isDarkMode ? "bg-neutral-800 text-neutral-400" : "bg-neutral-200 text-neutral-600"
                }`}
              >
                {editorSettings.tabSize || 2}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3
          className={`text-xs font-mono mb-3 flex items-center gap-2 ${
            isDarkMode ? "text-neutral-400" : "text-neutral-600"
          }`}
        >
          <Eye className="w-3 h-3" />
          display
        </h3>

        <div className="grid grid-cols-1 gap-3">
          <div
            className={`p-3 border ${
              isDarkMode ? "border-neutral-700 bg-black" : "border-neutral-300 bg-white"
            }`}
          >
            <label
              className={`block text-xs font-mono mb-2 ${
                isDarkMode ? "text-neutral-400" : "text-neutral-600"
              }`}
            >
              line numbers
            </label>
            <select
              value={editorSettings.lineNumbers || "on"}
              onChange={(e) => handleChange("lineNumbers", e.target.value)}
              className={`w-full p-2 text-xs font-mono border ${
                isDarkMode
                  ? "border-neutral-700 bg-neutral-900 text-neutral-400 focus:border-neutral-500"
                  : "border-neutral-300 bg-white text-neutral-700 focus:border-neutral-500"
              }`}
            >
              {lineNumberOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div
            className={`p-3 border ${
              isDarkMode ? "border-neutral-700 bg-black" : "border-neutral-300 bg-white"
            }`}
          >
            <label
              className={`block text-xs font-mono mb-2 ${
                isDarkMode ? "text-neutral-400" : "text-neutral-600"
              }`}
            >
              word wrap
            </label>
            <select
              value={editorSettings.wordWrap || "on"}
              onChange={(e) => handleChange("wordWrap", e.target.value)}
              className={`w-full p-2 text-xs font-mono border ${
                isDarkMode
                  ? "border-neutral-700 bg-neutral-900 text-neutral-400 focus:border-neutral-500"
                  : "border-neutral-300 bg-white text-neutral-700 focus:border-neutral-500"
              }`}
            >
              {wordWrapOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div
            className={`p-3 border ${
              isDarkMode ? "border-neutral-700 bg-black" : "border-neutral-300 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <label
                className={`text-xs font-mono ${
                  isDarkMode ? "text-neutral-400" : "text-neutral-600"
                }`}
              >
                minimap
              </label>
              <input
                type="checkbox"
                checked={editorSettings.minimap?.enabled ?? true}
                onChange={(e) =>
                  handleChange("minimap", { enabled: e.target.checked })
                }
                className="w-3 h-3"
              />
            </div>
          </div>

          <div
            className={`p-3 border ${
              isDarkMode ? "border-neutral-700 bg-black" : "border-neutral-300 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <label
                className={`text-xs font-mono ${
                  isDarkMode ? "text-neutral-400" : "text-neutral-600"
                }`}
              >
                read only
              </label>
              <input
                type="checkbox"
                checked={editorSettings.readOnly ?? false}
                onChange={(e) => handleChange("readOnly", e.target.checked)}
                className="w-3 h-3"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
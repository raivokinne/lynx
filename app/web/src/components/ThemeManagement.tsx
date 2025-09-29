import React, { useState, useEffect } from "react";
import { Palette, Plus, Trash2, Edit, Download, Eye } from "lucide-react";
import { ThemeEditor } from "./ThemeEditor";
import type { EditorSettings, CustomTheme } from "../types/types";

interface ThemeManagementProps {
  editorSettings: EditorSettings;
  onSettingsChange: (settings: EditorSettings) => void;
  isDarkMode: boolean;
  registerCustomTheme: (theme: CustomTheme) => void;
}

export const ThemeManagement: React.FC<ThemeManagementProps> = ({
  editorSettings,
  onSettingsChange,
  isDarkMode,
  registerCustomTheme,
}) => {
  const [showThemeEditor, setShowThemeEditor] = useState(false);
  const [editingTheme, setEditingTheme] = useState<CustomTheme | null>(null);

  const builtInThemes = [
    { id: "vs", name: "Visual Studio Light", type: "built-in" },
    { id: "vs-dark", name: "Visual Studio Dark", type: "built-in" },
    { id: "hc-black", name: "High Contrast Dark", type: "built-in" },
  ];

  const customThemes = editorSettings.customThemes || [];

  const handleThemeSelect = (themeId: string) => {
    onSettingsChange({
      ...editorSettings,
      theme: themeId,
    });

    const customTheme = customThemes.find((t) => t.id === themeId);
    if (customTheme && (window as any).monaco) {
      registerCustomTheme(customTheme);
      setTimeout(() => {
        try {
          (window as any).monaco.editor.setTheme(themeId);
        } catch (error) {
          console.error("Failed to apply theme:", error);
        }
      }, 100);
    } else if ((window as any).monaco) {
      setTimeout(() => {
        try {
          (window as any).monaco.editor.setTheme(themeId);
        } catch (error) {
          console.error("Failed to apply theme:", error);
        }
      }, 100);
    }
  };

  const handleCreateTheme = () => {
    setEditingTheme(null);
    setShowThemeEditor(true);
  };

  const handleEditTheme = (theme: CustomTheme) => {
    setEditingTheme(theme);
    setShowThemeEditor(true);
  };

  const handleSaveTheme = (theme: CustomTheme) => {
    const existingThemes = customThemes || [];
    let updatedThemes;

    if (editingTheme) {
      updatedThemes = existingThemes.map((t) =>
        t.id === editingTheme.id ? theme : t,
      );
    } else {
      updatedThemes = [...existingThemes, theme];
    }

    onSettingsChange({
      ...editorSettings,
      customThemes: updatedThemes,
      theme:
        editingTheme && editingTheme.id === editorSettings.theme
          ? theme.id
          : editorSettings.theme,
    });

    if ((window as any).monaco) {
      registerCustomTheme(theme);
    }

    console.log("Theme saved:", theme.name);
  };

  const handleDeleteTheme = (themeId: string) => {
    if (confirm("Are you sure you want to delete this theme?")) {
      const updatedThemes = customThemes.filter((t) => t.id !== themeId);

      const existingStyle = document.getElementById(`theme-${themeId}`);
      if (existingStyle) {
        existingStyle.remove();
      }

      onSettingsChange({
        ...editorSettings,
        customThemes: updatedThemes,
        theme:
          editorSettings.theme === themeId ? "vs-dark" : editorSettings.theme,
      });
    }
  };

  const handleExportTheme = (theme: CustomTheme) => {
    const dataStr = JSON.stringify(theme, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${theme.name.replace(/[^a-zA-Z0-9]/g, "-")}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handlePreviewTheme = (theme: CustomTheme) => {
    if ((window as any).monaco) {
      registerCustomTheme(theme);
      setTimeout(() => {
        try {
          (window as any).monaco.editor.setTheme(theme.id);
        } catch (error) {
          console.error("Failed to preview theme:", error);
        }
      }, 100);
    }
  };

  useEffect(() => {
    if ((window as any).monaco && customThemes.length > 0) {
      customThemes.forEach((theme) => {
        registerCustomTheme(theme);
      });
    }
  }, [customThemes, registerCustomTheme]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Theme Management</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateTheme}
            className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Theme
          </button>
        </div>
      </div>

      {/* Current Theme Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Current Theme</label>
        <select
          value={editorSettings.theme || "vs-dark"}
          onChange={(e) => handleThemeSelect(e.target.value)}
          className={`w-full p-2 border rounded transition-colors ${
            isDarkMode
              ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
              : "bg-white border-gray-300 focus:border-blue-500"
          }`}
        >
          <optgroup label="Built-in Themes">
            {builtInThemes.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </optgroup>
          {customThemes.length > 0 && (
            <optgroup label="Custom Themes">
              {customThemes.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      {/* Themes List */}
      <div className="space-y-4">
        <h4 className="font-medium">Available Themes</h4>

        {/* Built-in Themes */}
        <div className="space-y-2">
          <h5
            className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
          >
            Built-in Themes
          </h5>
          <div className="grid grid-cols-1 gap-2">
            {builtInThemes.map((theme) => (
              <div
                key={theme.id}
                className={`flex items-center justify-between p-3 border rounded transition-colors ${
                  editorSettings.theme === theme.id
                    ? isDarkMode
                      ? "border-blue-500 bg-blue-900/20"
                      : "border-blue-500 bg-blue-50"
                    : isDarkMode
                      ? "border-gray-600 bg-gray-700"
                      : "border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5" />
                  <div>
                    <div className="font-medium">{theme.name}</div>
                    <div
                      className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Built-in theme
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {editorSettings.theme === theme.id && (
                    <span className="text-xs px-2 py-1 bg-blue-500 text-white rounded">
                      Active
                    </span>
                  )}
                  <button
                    onClick={() => handleThemeSelect(theme.id)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      editorSettings.theme === theme.id
                        ? "bg-gray-500 text-white cursor-default"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                    disabled={editorSettings.theme === theme.id}
                  >
                    {editorSettings.theme === theme.id ? "Selected" : "Select"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Themes */}
        {customThemes.length > 0 && (
          <div className="space-y-2">
            <h5
              className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Custom Themes ({customThemes.length})
            </h5>
            <div className="grid grid-cols-1 gap-2">
              {customThemes.map((theme) => (
                <div
                  key={theme.id}
                  className={`flex items-center justify-between p-3 border rounded transition-colors ${
                    editorSettings.theme === theme.id
                      ? isDarkMode
                        ? "border-blue-500 bg-blue-900/20"
                        : "border-blue-500 bg-blue-50"
                      : isDarkMode
                        ? "border-gray-600 bg-gray-700"
                        : "border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{theme.name}</div>
                      <div
                        className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Created {new Date(theme.createdAt).toLocaleDateString()}
                        {theme.updatedAt &&
                          theme.updatedAt !== theme.createdAt && (
                            <span>
                              {" "}
                              • Updated{" "}
                              {new Date(theme.updatedAt).toLocaleDateString()}
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {editorSettings.theme === theme.id && (
                      <span className="text-xs px-2 py-1 bg-blue-500 text-white rounded">
                        Active
                      </span>
                    )}
                    <button
                      onClick={() => handlePreviewTheme(theme)}
                      className={`p-1 rounded transition-colors ${
                        isDarkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                      }`}
                      title="Preview theme"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditTheme(theme)}
                      className={`p-1 rounded transition-colors ${
                        isDarkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                      }`}
                      title="Edit theme"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleExportTheme(theme)}
                      className={`p-1 rounded transition-colors ${
                        isDarkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                      }`}
                      title="Export theme"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTheme(theme.id)}
                      className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      title="Delete theme"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleThemeSelect(theme.id)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        editorSettings.theme === theme.id
                          ? "bg-gray-500 text-white cursor-default"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                      disabled={editorSettings.theme === theme.id}
                    >
                      {editorSettings.theme === theme.id
                        ? "Selected"
                        : "Select"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {customThemes.length === 0 && (
          <div
            className={`text-center py-8 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            <Palette className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No custom themes yet</p>
            <p className="text-xs mt-1">
              Create your first custom theme to get started
            </p>
          </div>
        )}
      </div>

      {/* Theme Editor Modal */}
      {showThemeEditor && (
        <ThemeEditor
          isOpen={showThemeEditor}
          onClose={() => {
            setShowThemeEditor(false);
            setEditingTheme(null);
          }}
          onSaveTheme={handleSaveTheme}
          currentThemes={customThemes}
          isDarkMode={isDarkMode}
          editingTheme={editingTheme}
        />
      )}
    </div>
  );
};

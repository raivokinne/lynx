import React from 'react';
import { Play, Save, FolderOpen, Download, Trash2, Settings } from "lucide-react";

interface SidebarProps {
  isDarkMode: boolean;
  isRunning: boolean;
  canRun: boolean;
  onRunCode: () => void;
  onSave: () => void;
  onLoad: () => void;
  onDownload: () => void;
  onClear: () => void;
  onSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isDarkMode,
  isRunning,
  canRun,
  onRunCode,
  onSave,
  onLoad,
  onDownload,
  onClear,
  onSettings
}) => (
  <div className={`${isDarkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-200'} w-12 border-r flex flex-col items-center py-4 space-y-3`}>
    <button
      onClick={onRunCode}
      disabled={!canRun || isRunning}
      className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} disabled:opacity-50`}
      title="Palaist kodu"
    >
      {isRunning ? (
        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      ) : (
        <Play size={16} />
      )}
    </button>

    <button
      onClick={onSave}
      className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
      title="Saglabāt kodu"
    >
      <Save size={16} />
    </button>

    <button
      onClick={onLoad}
      className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
      title="Ielādēt kodu"
    >
      <FolderOpen size={16} />
    </button>

    <button
      onClick={onDownload}
      className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
      title="Lejupielādēt kodu"
    >
      <Download size={16} />
    </button>

    <button
      onClick={onClear}
      className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
      title="Notīrīt kodu"
    >
      <Trash2 size={16} />
    </button>

    <div className="flex-1" />

    <button
      onClick={onSettings}
      className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
      title="Redaktora iestatījumi"
    >
      <Settings size={16} />
    </button>
  </div>
);

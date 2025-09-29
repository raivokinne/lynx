import React from "react";
import {
  Play,
  Download,
  Trash2,
  Settings,
  BookOpen,
  GitMerge,
} from "lucide-react";

interface SidebarProps {
  isDarkMode: boolean;
  isRunning: boolean;
  canRun: boolean;
  onRunCode: () => void;
  onSave: () => void;
  onSettings: () => void;
  onDocs: () => void;
  onGit: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isDarkMode,
  isRunning,
  canRun,
  onRunCode,
  onSettings,
  onDocs,
  onGit,
}) => (
  <div
    className={`${isDarkMode ? "bg-black border-gray-700" : "bg-white border-gray-200"} w-12 border-r flex flex-col items-center py-4 space-y-3`}
  >
    <button
      onClick={onRunCode}
      disabled={!canRun || isRunning}
      className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"} disabled:opacity-50`}
      title="Palaist kodu"
    >
      {isRunning ? (
        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      ) : (
        <Play size={24} />
      )}
    </button>

    <div className="flex-1" />

    <button
      onClick={onSettings}
      className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
      title="Redaktora iestatījumi"
    >
      <Settings size={24} />
    </button>

    <button
      onClick={onGit}
      className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
      title="Redaktora iestatījumi"
    >
      <GitMerge size={24} />
    </button>

    <button
      onClick={onDocs}
      className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
      title="Redaktora iestatījumi"
    >
      <BookOpen size={24} />
    </button>
  </div>
);

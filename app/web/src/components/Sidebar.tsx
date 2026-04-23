import React from "react";
import { Settings } from "lucide-react";

// Sidebar with run button and settings access
interface SidebarProps {
  isDarkMode: boolean;
  isRunning: boolean;
  canRun: boolean;
  onRunCode: () => void;
  onSave: () => void;
  onSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isDarkMode,
  isRunning,
  canRun,
  onRunCode,
  onSettings,
}) => (
  <div
    className={`${isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-neutral-200 border-neutral-300"} w-10 border-r flex flex-col items-center py-2 space-y-1`}
  >
    <button
      onClick={onRunCode}
      disabled={!canRun || isRunning}
      className={`p-1.5 transition-colors font-mono text-xs ${isDarkMode ? "hover:bg-neutral-800 text-neutral-400" : "hover:bg-neutral-300 text-neutral-600"} disabled:opacity-30`}
      title="Run code"
    >
      {isRunning ? (
        <div className="animate-spin h-5 w-5 border border-current border-t-transparent" />
      ) : canRun ? (
        <span
          className={
            isDarkMode ? "text-amber-400 text-2xl" : "text-amber-600 text-2xl"
          }
        >
          ▶
        </span>
      ) : (
        <span className="opacity-30">▶</span>
      )}
    </button>

    <div className="flex-1" />

    <button
      onClick={onSettings}
      className={`p-1.5 transition-colors ${isDarkMode ? "hover:bg-neutral-800 text-neutral-500" : "hover:bg-neutral-300 text-neutral-500"}`}
      title="Settings"
    >
      <Settings size={16} />
    </button>
  </div>
);

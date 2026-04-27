import React, { useState, useEffect } from "react";
import { Settings, Play, Clock } from "lucide-react";

interface SidebarProps {
  isDarkMode: boolean;
  isRunning: boolean;
  canRun: boolean;
  isOnCooldown: boolean;
  cooldownEnd: number | null;
  executionsRemaining: number;
  onRunCode: () => void;
  onSave: () => void;
  onSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isDarkMode,
  isRunning,
  canRun,
  isOnCooldown,
  cooldownEnd,
  executionsRemaining,
  onRunCode,
  onSettings,
}) => {
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!cooldownEnd || cooldownEnd <= Date.now()) {
      setCountdown(0);
      return;
    }
    setCountdown(Math.ceil((cooldownEnd - Date.now()) / 1000));
    const interval = setInterval(() => {
      const remaining = Math.ceil((cooldownEnd - Date.now()) / 1000);
      setCountdown(remaining > 0 ? remaining : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownEnd]);

  return (
    <div
      className={`${isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-neutral-200 border-neutral-300"} w-10 border-r flex flex-col items-center py-2 space-y-1`}
    >
      <button
        onClick={onRunCode}
        disabled={!canRun || isRunning || isOnCooldown}
        className={`p-1.5 transition-colors font-mono text-xs relative ${
          isDarkMode
            ? "hover:bg-neutral-800 text-neutral-400"
            : "hover:bg-neutral-300 text-neutral-600"
        } disabled:opacity-50`}
        title={
          isOnCooldown
            ? `Cooldown: ${countdown}s remaining (${executionsRemaining} runs left)`
            : canRun
              ? "Run code"
              : "Enter code to run"
        }
      >
        {isRunning ? (
          <div className="animate-spin h-5 w-5 border border-current border-t-transparent" />
        ) : canRun && !isOnCooldown ? (
          <Play
            className={isDarkMode ? "text-amber-400" : "text-amber-600"}
            size={20}
            fill="currentColor"
          />
        ) : isOnCooldown ? (
          <div className="flex flex-col items-center gap-0.5">
            <Clock className="text-orange-500" size={14} />
            <span className="text-[10px] font-bold text-orange-500">
              {countdown}
            </span>
          </div>
        ) : (
          <Play className="opacity-30" size={20} />
        )}
      </button>

      {!isOnCooldown && executionsRemaining < 5 && (
        <div
          className={`text-[20px] font-mono ${
            isDarkMode ? "text-neutral-500" : "text-neutral-400"
          }`}
          title={`${executionsRemaining} runs remaining`}
        >
          {executionsRemaining}
        </div>
      )}

      <div className="flex-1" />

      <button
        onClick={onSettings}
        className={`p-1.5 transition-colors ${
          isDarkMode
            ? "hover:bg-neutral-800 text-neutral-500"
            : "hover:bg-neutral-300 text-neutral-500"
        }`}
        title="Settings"
      >
        <Settings size={16} />
      </button>
    </div>
  );
};

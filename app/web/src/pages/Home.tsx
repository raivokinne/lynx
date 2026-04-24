import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useCodeManagement } from "../hooks/useCodeManagement";
import { useCodeExecution } from "../hooks/useCodeExecution";
import { useTheme } from "../contexts/ThemeContext";
import { useSettings } from "../hooks/useSettings";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { CodeEditor } from "../components/CodeEditor";
import { OutputPanel } from "../components/OutputPanel";
import { SettingsModal } from "../components/settings/SettingsModal";
import type { SavedCode } from "../types/types";

export const Home = () => {
  const { user, logout } = useAuth();
  const { editorSettings } = useSettings(user?.id);
  const {
    code,
    setCode,
    currentCodeTitle,
    savedCodes,
    saveCode,
    loadCode,
    deleteCode,
    updateCode,
  } = useCodeManagement(user?.id);
  const { output, error, isRunning, cooldownEnd, executeCode, clearOutput } = useCodeExecution();
  const { isDarkMode, toggleTheme } = useTheme();

  const [showSettings, setShowSettings] = useState(false);

  const isOnCooldown = cooldownEnd !== null && cooldownEnd > Date.now();

  const handleSaveCode = (title: string) => {
    saveCode(title);
    clearOutput();
  };

  const handleLoadCode = (savedCode: SavedCode) => {
    loadCode(savedCode);
    clearOutput();
  };

  const handleExecuteCode = () => {
    executeCode(code, !!user);
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-black text-gray-400" : "bg-gray-100 text-gray-700"
      } transition-colors duration-200`}
    >
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      <Header
        isDarkMode={isDarkMode}
        username={user?.username}
        onToggleTheme={toggleTheme}
        onLogout={logout}
      />

      <div className="flex h-[calc(100vh-3.5rem)]">
        <Sidebar
          isDarkMode={isDarkMode}
          isRunning={isRunning}
          canRun={code.trim().length > 0}
          isOnCooldown={isOnCooldown}
          onRunCode={handleExecuteCode}
          onSave={() => {}}
          onSettings={() => setShowSettings(true)}
        />

        <div className="flex-1 flex">
          <CodeEditor
            isDarkMode={isDarkMode}
            code={code}
            currentCodeTitle={currentCodeTitle}
            editorSettings={editorSettings}
            onChange={setCode}
            onSaveCode={handleSaveCode}
            onUpdate={updateCode}
            savedCodes={savedCodes}
            onLoad={handleLoadCode}
            deleteCode={deleteCode}
          />
          <OutputPanel isDarkMode={isDarkMode} output={output} error={error} />
        </div>
      </div>
    </div>
  );
};

export default Home;
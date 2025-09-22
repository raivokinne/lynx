import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCodeManagement } from "../hooks/useCodeManagement";
import { useCodeExecution } from "../hooks/useCodeExecution";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { CodeEditor } from "../components/CodeEditor";
import { OutputPanel } from "../components/OutputPanel";
import { SaveDialog } from "../components/SaveDialog";
import { SettingsModal } from "../components/SettingsModal";
import type { SavedCode } from "../types/types";
import { useSettings } from "../hooks/useSettings";

export const Home: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    editorSettings,
    updateSetting,
    resetSettings,
    saveSettings,
    loading,
    errorSettings,
    clearError,
    hasUnsavedChanges,
  } = useSettings();
  const {
    code,
    setCode,
    currentCodeTitle,
    savedCodes,
    saveCode,
    loadCode,
    deleteCode,
    clearCode,
    downloadCode,
  } = useCodeManagement(user?.id);
  const { output, error, isRunning, executeCode, clearOutput } =
    useCodeExecution();

  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const [showLoadDialog, setShowLoadDialog] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [saveTitle, setSaveTitle] = useState<string>("");

  const handleSaveCode = () => {
    saveCode(saveTitle);
    setSaveTitle("");
    setShowSaveDialog(false);
  };

  const handleLoadCode = (savedCode: SavedCode) => {
    loadCode(savedCode);
    setShowLoadDialog(false);
    clearOutput();
  };

  const handleClearCode = () => {
    clearCode();
    clearOutput();
  };

  const handleExecuteCode = () => {
    executeCode(code);
  };

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-black text-white" : "bg-white text-black"} transition-colors duration-200`}
    >
      {showSettings && (
        <SettingsModal
          isDarkMode={isDarkMode}
          editorSettings={editorSettings}
          onUpdateSetting={updateSetting}
          onResetSettings={resetSettings}
          onClose={() => setShowSettings(false)}
          onClearError={clearError}
          onSaveSettings={saveSettings}
          error={errorSettings}
          hasUnsavedChanges={hasUnsavedChanges}
          loading={loading}
        />
      )}

      {showSaveDialog && (
        <SaveDialog
          isDarkMode={isDarkMode}
          saveTitle={saveTitle}
          setSaveTitle={setSaveTitle}
          onSave={handleSaveCode}
          onClose={() => setShowSaveDialog(false)}
        />
      )}

      <Header
        isDarkMode={isDarkMode}
        username={user?.username}
        onToggleTheme={() => setIsDarkMode((prev) => !prev)}
        onLogout={logout}
      />

      <div className="flex h-[calc(100vh-3.5rem)]">
        <Sidebar
          isDarkMode={isDarkMode}
          isRunning={isRunning}
          canRun={code.trim().length > 0}
          onRunCode={handleExecuteCode}
          onSave={() => {
            setSaveTitle(currentCodeTitle);
            setShowSaveDialog(true);
          }}
          onLoad={() => setShowLoadDialog(true)}
          onDownload={downloadCode}
          onClear={handleClearCode}
          onSettings={() => setShowSettings(true)}
        />

        <div className="flex-1 flex">
          <CodeEditor
            isDarkMode={isDarkMode}
            code={code}
            currentCodeTitle={currentCodeTitle}
            editorSettings={editorSettings}
            onChange={setCode}
            onSaveCode={saveCode}
            savedCodes={savedCodes}
            onLoad={handleLoadCode}
          />

          <OutputPanel isDarkMode={isDarkMode} output={output} error={error} />
        </div>
      </div>
    </div>
  );
};

export default Home;

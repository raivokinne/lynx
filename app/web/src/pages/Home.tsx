import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useCodeManagement } from "../hooks/useCodeManagement";
import { useCodeExecution } from "../hooks/useCodeExecution";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { CodeEditor } from "../components/CodeEditor";
import { OutputPanel } from "../components/OutputPanel";
import { SaveDialog } from "../components/SaveDialog";
import { Settings } from "../components/Settings";
import type { SavedCode } from "../types/types";
import { useSettings } from "../hooks/useSettings";

// Main code editor page with execution and file management
export const Home: React.FC = () => {
	const { user, logout } = useAuth();
	const { editorSettings, updateAllSettings, registerCustomTheme } =
		useSettings(user?.id);
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
	const { output, error, isRunning, cooldownEnd, executeCode, clearOutput } =
		useCodeExecution();

	const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
		const local = localStorage.getItem("darkMode");
		if (local) {
			return local === "true";
		}
		return false;
	});
	const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
	const [showSettings, setShowSettings] = useState<boolean>(false);
	const [saveTitle, setSaveTitle] = useState<string>("");

	const isOnCooldown = cooldownEnd !== null && cooldownEnd > Date.now();

	useEffect(() => {
		localStorage.setItem("darkMode", isDarkMode.toString());
	}, [isDarkMode]);

	const handleSaveCode = () => {
		saveCode(saveTitle);
		setSaveTitle("");
		setShowSaveDialog(false);
	};

	const handleLoadCode = (savedCode: SavedCode) => {
		loadCode(savedCode);
		clearOutput();
	};

	const handleExecuteCode = () => {
		executeCode(code, !!user);
	};

	const handleToggleDarkMode = () => {
		setIsDarkMode((prev) => !prev);
	};

	return (
		<div
			className={`min-h-screen ${isDarkMode ? "bg-black text-gray-400" : "bg-gray-100 text-gray-700"} transition-colors duration-200`}
		>
			{showSettings && (
				<Settings
					isOpen={showSettings}
					onClose={() => setShowSettings(false)}
					editorSettings={editorSettings}
					onSettingsChange={updateAllSettings}
					isDarkMode={isDarkMode}
					onToggleDarkMode={handleToggleDarkMode}
					registerCustomTheme={registerCustomTheme}
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
				onToggleTheme={handleToggleDarkMode}
				onLogout={logout}
			/>
			<div className="flex h-[calc(100vh-3.5rem)]">
				<Sidebar
					isDarkMode={isDarkMode}
					isRunning={isRunning}
					canRun={code.trim().length > 0}
					isOnCooldown={isOnCooldown}
					onRunCode={handleExecuteCode}
					onSave={() => {
						setSaveTitle(currentCodeTitle);
						setShowSaveDialog(true);
					}}
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
import React, { useState, useEffect } from "react";
import { Palette, Plus, Trash2, Edit, Eye } from "lucide-react";
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
        { id: "theme-teal", name: "Teal Breeze", type: "built-in" },
        { id: "theme-amber", name: "Amber Sunset", type: "built-in" },
        { id: "theme-violet", name: "Violet Dream", type: "built-in" },
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

		// eslint-disable-next-line no-console
		console.debug("Theme saved:", theme.name);
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
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-xs font-mono text-neutral-400">theme management</h3>
				<button
					onClick={handleCreateTheme}
					className="flex items-center gap-1 px-2 py-1 bg-neutral-700 text-neutral-300 text-xs font-mono hover:bg-neutral-600 transition-colors"
				>
					<Plus className="w-3 h-3" />
					create
				</button>
			</div>

			<div className="space-y-2">
				<label className="block text-xs font-mono text-neutral-500">current</label>
				<select
					value={editorSettings.theme || "vs-dark"}
					onChange={(e) => handleThemeSelect(e.target.value)}
					className={`w-full p-2 text-xs font-mono border transition-colors ${isDarkMode
							? "bg-black border-neutral-700 text-neutral-400 focus:border-neutral-500"
							: "bg-white border-neutral-300 focus:border-neutral-400"
						}`}
				>
					<optgroup label="built-in">
						{builtInThemes.map((theme) => (
							<option key={theme.id} value={theme.id}>
								{theme.name}
							</option>
						))}
					</optgroup>
					{customThemes.length > 0 && (
						<optgroup label="custom">
							{customThemes.map((theme) => (
								<option key={theme.id} value={theme.id}>
									{theme.name}
								</option>
							))}
						</optgroup>
					)}
				</select>
			</div>

			<div className="space-y-3">
				<h4 className="text-xs font-mono text-neutral-500">available</h4>

				<div className="space-y-1">
					{builtInThemes.map((theme) => (
						<div
							key={theme.id}
							className={`flex items-center justify-between p-2 border text-xs font-mono ${editorSettings.theme === theme.id
									? isDarkMode
										? "border-neutral-500 bg-neutral-800"
										: "border-neutral-400 bg-neutral-200"
									: isDarkMode
										? "border-neutral-700 bg-black"
										: "border-neutral-300 bg-white"
								}`}
						>
							<div className="flex items-center gap-2">
								<Palette className="w-3 h-3" />
								<span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>{theme.name}</span>
							</div>
							<button
								onClick={() => handleThemeSelect(theme.id)}
								className={`px-2 py-0.5 text-xs font-mono transition-colors ${editorSettings.theme === theme.id
										? "text-neutral-500 cursor-default"
										: isDarkMode
											? "text-neutral-400 hover:text-neutral-300"
											: "text-neutral-600 hover:text-neutral-800"
									}`}
								disabled={editorSettings.theme === theme.id}
							>
								{editorSettings.theme === theme.id ? "[active]" : "[select]"}
							</button>
						</div>
					))}
				</div>

				{customThemes.length > 0 && (
					<div className="space-y-1">
						<h5 className="text-xs font-mono text-neutral-500">custom ({customThemes.length})</h5>
						{customThemes.map((theme) => (
							<div
								key={theme.id}
								className={`flex items-center justify-between p-2 border text-xs font-mono ${editorSettings.theme === theme.id
										? isDarkMode
											? "border-neutral-500 bg-neutral-800"
											: "border-neutral-400 bg-neutral-200"
										: isDarkMode
											? "border-neutral-700 bg-black"
											: "border-neutral-300 bg-white"
									}`}
							>
								<div className="flex items-center gap-2">
									<Palette className="w-3 h-3" />
									<span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>{theme.name}</span>
								</div>
								<div className="flex items-center gap-1">
									<button
										onClick={() => handlePreviewTheme(theme)}
										className={`p-0.5 ${isDarkMode ? "hover:bg-neutral-800 text-neutral-500" : "hover:bg-neutral-200 text-neutral-500"}`}
										title="preview"
									>
										<Eye className="w-3 h-3" />
									</button>
									<button
										onClick={() => handleEditTheme(theme)}
										className={`p-0.5 ${isDarkMode ? "hover:bg-neutral-800 text-neutral-500" : "hover:bg-neutral-200 text-neutral-500"}`}
										title="edit"
									>
										<Edit className="w-3 h-3" />
									</button>
									<button
										onClick={() => handleDeleteTheme(theme.id)}
										className="p-0.5 text-red-600 hover:bg-red-900/30"
										title="delete"
									>
										<Trash2 className="w-3 h-3" />
									</button>
								</div>
							</div>
						))}
					</div>
				)}

				{customThemes.length === 0 && (
					<div className={`text-center py-4 ${isDarkMode ? "text-neutral-600" : "text-neutral-400"}`}>
						<p className="text-xs font-mono">no custom themes</p>
					</div>
				)}
			</div>

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

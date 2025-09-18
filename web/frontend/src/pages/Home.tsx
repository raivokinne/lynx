import { AlertCircle, Download, Play, Trash2, LogOut, User, Terminal, Code, Save, FolderOpen, FileText, Settings, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from '../contexts/AuthContext';
import MonacoEditor from '../components/Editor';

interface SavedCode {
	id: string;
	title: string;
	code: string;
	createdAt: string;
	updatedAt: string;
}

type EditorSettings = {
	themeDark: string;
	themeLight: string;
	fontSize: number;
	minimap: { enabled: boolean };
	lineNumbers: string; // 'on' | 'off' | 'relative'
	wordWrap: string; // 'on' | 'off'
	tabSize: number;
	fontFamily: string;
	readOnly: boolean;
};

export const Home: React.FC = () => {
	const [code, setCode] = useState<string>('');
	const [output, setOutput] = useState<string>('');
	const [isRunning, setIsRunning] = useState<boolean>(false);
	const [error, setError] = useState<string>('');
	const [currentTime, setCurrentTime] = useState<string>('');
	const [isTerminalMode, setIsTerminalMode] = useState<boolean>(false);
	const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
	const [savedCodes, setSavedCodes] = useState<SavedCode[]>([]);
	const [showLoadDialog, setShowLoadDialog] = useState<boolean>(false);
	const [currentCodeTitle, setCurrentCodeTitle] = useState<string>('Untitled');
	const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
	const [saveTitle, setSaveTitle] = useState<string>('');
	const { user, logout } = useAuth();

	const API_BASE = 'http://localhost:3001/api';
	const getAuthToken = () => localStorage.getItem('token');

	// canonical defaults
	const defaultSettings: EditorSettings = {
		themeDark: 'hc-black',
		themeLight: 'vs',
		fontSize: 14,
		minimap: { enabled: true },
		lineNumbers: 'on',
		wordWrap: 'on',
		tabSize: 2,
		fontFamily: 'JetBrains Mono, Fira Code, Monaco, Consolas, monospace',
		readOnly: false
	};

	// Normalize incoming settings (from localStorage or older schema)
	const normalizeEditorSettings = (raw: any): EditorSettings => {
		console.log('Normalizing settings:', raw); // Debug log

		if (!raw || typeof raw !== 'object') {
			console.log('Using default settings');
			return { ...defaultSettings };
		}

		const res: EditorSettings = {
			themeDark: typeof raw.themeDark === 'string' ? raw.themeDark : defaultSettings.themeDark,
			themeLight: typeof raw.themeLight === 'string' ? raw.themeLight : defaultSettings.themeLight,
			fontSize: typeof raw.fontSize === 'number' && Number.isFinite(raw.fontSize) ? raw.fontSize : defaultSettings.fontSize,
			minimap: {
				enabled: Boolean(raw.minimap?.enabled ?? raw.minimap ?? defaultSettings.minimap.enabled)
			},
			lineNumbers: typeof raw.lineNumbers === 'string' ? raw.lineNumbers : defaultSettings.lineNumbers,
			wordWrap: typeof raw.wordWrap === 'string' ? raw.wordWrap : defaultSettings.wordWrap,
			tabSize: typeof raw.tabSize === 'number' && Number.isFinite(raw.tabSize) ? raw.tabSize : defaultSettings.tabSize,
			fontFamily: typeof raw.fontFamily === 'string' ? raw.fontFamily : defaultSettings.fontFamily,
			readOnly: Boolean(raw.readOnly ?? defaultSettings.readOnly)
		};

		console.log('Normalized settings:', res); // Debug log
		return res;
	};


	// editorSettings state (persisted) with normalization to avoid controlled/uncontrolled problems
	const [editorSettings, setEditorSettings] = useState<EditorSettings>(() => {
		try {
			const raw = localStorage.getItem('lynx_editor_settings');
			return raw ? normalizeEditorSettings(JSON.parse(raw)) : defaultSettings;
		} catch (e) {
			return defaultSettings;
		}
	});

	const [showSettings, setShowSettings] = useState(false);

	// persist settings on change (already normalized)
	useEffect(() => {
		try {
			localStorage.setItem('lynx_editor_settings', JSON.stringify(editorSettings));
		} catch (e) {
			console.error('Failed to persist editor settings', e);
		}
	}, [editorSettings]);

	// useEffect(() => {
	// 	const interval = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
	// 	return () => clearInterval(interval);
	// }, []);

	useEffect(() => {
		if (user?.id) {
			const savedCode = localStorage.getItem(`lynx_code_${user.id}`);
			const savedTitle = localStorage.getItem(`lynx_code_title_${user.id}`);
			if (savedCode) {
				setCode(savedCode);
				setCurrentCodeTitle(savedTitle || 'Untitled');
			}
			loadSavedCodes();
		}
	}, [user?.id]);

	// Auto-save current code
	useEffect(() => {
		if (user?.id && code) {
			localStorage.setItem(`lynx_code_${user.id}`, code);
			localStorage.setItem(`lynx_code_title_${user.id}`, currentCodeTitle);
		}
	}, [code, currentCodeTitle, user?.id]);

	// Load saved codes from localStorage
	const loadSavedCodes = () => {
		if (!user?.id) return;

		try {
			const saved = localStorage.getItem(`lynx_saved_codes_${user.id}`);
			if (saved) {
				setSavedCodes(JSON.parse(saved));
			}
		} catch (error) {
			console.error('Error loading saved codes:', error);
		}
	};

	// Save current code
	const saveCode = () => {
		if (!user?.id || !saveTitle.trim()) return;

		const newCode: SavedCode = {
			id: Date.now().toString(),
			title: saveTitle.trim(),
			code: code,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		const updatedCodes = [...savedCodes, newCode];
		setSavedCodes(updatedCodes);
		localStorage.setItem(`lynx_saved_codes_${user.id}`, JSON.stringify(updatedCodes));

		setCurrentCodeTitle(saveTitle.trim());
		setSaveTitle('');
		setShowSaveDialog(false);
	};

	// Load a saved code
	const loadCode = (savedCode: SavedCode) => {
		setCode(savedCode.code);
		setCurrentCodeTitle(savedCode.title);
		setShowLoadDialog(false);
		setOutput('');
		setError('');
	};

	// Delete a saved code
	const deleteCode = (codeId: string) => {
		if (!user?.id) return;

		const updatedCodes = savedCodes.filter(c => c.id !== codeId);
		setSavedCodes(updatedCodes);
		localStorage.setItem(`lynx_saved_codes_${user.id}`, JSON.stringify(updatedCodes));
	};

	// simple executeCode stub similar to original
	const executeCode = async () => {
		setIsRunning(true);
		setOutput('Kompilē kodu...\n');
		setError('');

		try {
			const response = await fetch(`${API_BASE}/compile`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ code })
			});
			const result = await response.json();
			if (result.success) setOutput(result.output || '[NO OUTPUT]');
			else setError(result.error || 'Unknown error');
		} catch (e: any) {
			setError(e.message || String(e));
		} finally { setIsRunning(false); }
	};

	const downloadCode = () => {
		const blob = new Blob([code], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${currentCodeTitle.replace(/[^a-zA-Z0-9]/g, '_')}.lynx`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	};

	const clearCode = () => {
		setCode('');
		setOutput('');
		setError('');
		setCurrentCodeTitle('Untitled');
	};

	const updateSetting = (key: keyof EditorSettings | 'minimap', value: any) => {
		console.log('Updating setting:', key, value); // Debug log

		setEditorSettings(prev => {
			let next: any = { ...prev };

			if (key === 'minimap') {
				if (typeof value === 'boolean') {
					next.minimap = { enabled: value };
				} else if (typeof value === 'string') {
					next.minimap = { enabled: value === 'on' };
				} else {
					next.minimap = { ...(prev.minimap || {}), ...(value || {}) };
				}
			} else {
				next[key] = value;
			}

			const normalized = normalizeEditorSettings(next);
			console.log('New settings after update:', normalized); // Debug log
			return normalized;
		});
	};

	// Reset settings to default (normalized)
	const resetSettings = () => {
		setEditorSettings(normalizeEditorSettings(defaultSettings));
	};

	// Save Dialog Component
	const SaveDialog = () => (
		<div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
			<div className={`max-w-md w-full mx-4 p-6 rounded-xl ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border`}>
				<div className="flex items-center justify-between mb-4">
					<h3 className={`${isDarkMode ? 'text-white' : 'text-black'} font-semibold`}>Saglabāt kodu</h3>
					<button onClick={() => setShowSaveDialog(false)} className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
						<X className="w-4 h-4" />
					</button>
				</div>

				<div className="space-y-4">
					<div>
						<label className={`block text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
							Nosaukums
						</label>
						<input
							type="text"
							value={saveTitle}
							onChange={(e) => setSaveTitle(e.target.value)}
							placeholder="Ievadi koda nosaukumu..."
							className={`w-full p-3 rounded-lg border ${isDarkMode
								? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
								: 'bg-white border-gray-300 text-black placeholder-gray-500'
								}`}
							autoFocus
						/>
					</div>

					<div className="flex gap-3">
						<button
							onClick={() => setShowSaveDialog(false)}
							className={`flex-1 p-3 rounded-lg border ${isDarkMode
								? 'border-gray-700 text-gray-300 hover:bg-gray-800'
								: 'border-gray-300 text-gray-700 hover:bg-gray-50'
								}`}
						>
							Atcelt
						</button>
						<button
							onClick={saveCode}
							disabled={!saveTitle.trim()}
							className={`flex-1 p-3 rounded-lg text-white ${saveTitle.trim()
								? 'bg-blue-600 hover:bg-blue-700'
								: 'bg-gray-400 cursor-not-allowed'
								}`}
						>
							Saglabāt
						</button>
					</div>
				</div>
			</div>
		</div>
	);

	// Load Dialog Component
	const LoadDialog = () => (
		<div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
			<div className={`max-w-2xl w-full mx-4 p-6 rounded-xl ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border max-h-[80vh]`}>
				<div className="flex items-center justify-between mb-4">
					<h3 className={`${isDarkMode ? 'text-white' : 'text-black'} font-semibold`}>Ielādēt kodu</h3>
					<button onClick={() => setShowLoadDialog(false)} className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
						<X className="w-4 h-4" />
					</button>
				</div>

				<div className="space-y-2 max-h-96 overflow-y-auto">
					{savedCodes.length === 0 ? (
						<div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
							Nav saglabātu kodu
						</div>
					) : (
						savedCodes.map((savedCode) => (
							<div key={savedCode.id} className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} flex items-center justify-between`}>
								<div className="flex-1">
									<div className={`font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
										{savedCode.title}
									</div>
									<div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
										Saglabāts: {new Date(savedCode.createdAt).toLocaleDateString('lv-LV')} {new Date(savedCode.createdAt).toLocaleTimeString('lv-LV')}
									</div>
									<div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
										{savedCode.code.length} simboli, {(savedCode.code.match(/\n/g) || []).length + 1} rindas
									</div>
								</div>
								<div className="flex gap-2">
									<button
										onClick={() => loadCode(savedCode)}
										className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
										title="Ielādēt"
									>
										<FolderOpen className="w-4 h-4" />
									</button>
									<button
										onClick={() => deleteCode(savedCode.id)}
										className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-900 text-red-300 hover:bg-red-800' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
										title="Dzēst"
									>
										<Trash2 className="w-4 h-4" />
									</button>
								</div>
							</div>
						))
					)}
				</div>

				<div className="mt-4 pt-4 border-t">
					<button
						onClick={() => setShowLoadDialog(false)}
						className={`w-full p-3 rounded-lg border ${isDarkMode
							? 'border-gray-700 text-gray-300 hover:bg-gray-800'
							: 'border-gray-300 text-gray-700 hover:bg-gray-50'
							}`}
					>
						Aizvērt
					</button>
				</div>
			</div>
		</div>
	);

	// Settings UI content
	const SettingsModal = () => {

		return (
			<div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
				<div className={`max-w-lg w-full mx-4 p-6 rounded-xl ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border max-h-[80vh] overflow-y-auto`}>
					<div className="flex items-center justify-between mb-4">
						<h3 className={`${isDarkMode ? 'text-white' : 'text-black'} font-semibold`}>Redaktora iestatījumi</h3>
						<button onClick={() => setShowSettings(false)} className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
							<X className="w-4 h-4" />
						</button>
					</div>

					<div className="space-y-4">
						<div className="space-y-3">
							<label className={`block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
								Tumšā tēma
							</label>
							<select
								value={editorSettings.themeDark || 'hc-black'}
								onChange={(e) => {
									console.log('Dark theme changing to:', e.target.value);
									updateSetting('themeDark', e.target.value);
								}}
								className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${isDarkMode
										? 'bg-gray-800 border-gray-600 text-white'
										: 'bg-white border-gray-300 text-gray-900'
									}`}
							>
								<option value="hc-black">High Contrast Black</option>
								<option value="vs-dark">VS Dark</option>
								<option value="monokai">Monokai</option>
							</select>
						</div>

						<div className="space-y-3">
							<label className={`block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
								Gaišā tēma
							</label>
							<select
								value={editorSettings.themeLight || 'vs'}
								onChange={(e) => {
									console.log('Light theme changing to:', e.target.value);
									updateSetting('themeLight', e.target.value);
								}}
								className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${isDarkMode
										? 'bg-gray-800 border-gray-600 text-white'
										: 'bg-white border-gray-300 text-gray-900'
									}`}
							>
								<option value="vs">VS Light</option>
								<option value="hc-light">High Contrast Light</option>
							</select>
						</div>

						<div className="space-y-3">
							<label className={`block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
								Fonta izmērs: {editorSettings.fontSize}
							</label>
							<input
								type="range"
								min={10}
								max={36}
								value={editorSettings.fontSize || 14}
								onChange={(e) => {
									const newSize = Number(e.target.value);
									console.log('Font size changing to:', newSize);
									updateSetting('fontSize', newSize);
								}}
								className={`w-full`}
							/>
							<div className="flex justify-between text-xs text-gray-500">
								<span>10px</span>
								<span>36px</span>
							</div>
						</div>

						<div className="space-y-3">
							<label className={`block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
								Mini karte
							</label>
							<select
								value={editorSettings.minimap?.enabled ? 'on' : 'off'}
								onChange={(e) => {
									console.log('Minimap changing to:', e.target.value);
									updateSetting('minimap', e.target.value === 'on');
								}}
								className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${isDarkMode
										? 'bg-gray-800 border-gray-600 text-white'
										: 'bg-white border-gray-300 text-gray-900'
									}`}
							>
								<option value="on">Ieslēgta</option>
								<option value="off">Izslēgta</option>
							</select>
						</div>

						<div className="space-y-3">
							<label className={`block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
								Rindu numuri
							</label>
							<select
								value={editorSettings.lineNumbers || 'on'}
								onChange={(e) => {
									console.log('Line numbers changing to:', e.target.value);
									updateSetting('lineNumbers', e.target.value);
								}}
								className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${isDarkMode
										? 'bg-gray-800 border-gray-600 text-white'
										: 'bg-white border-gray-300 text-gray-900'
									}`}
							>
								<option value="on">Ieslēgti</option>
								<option value="off">Izslēgti</option>
								<option value="relative">Relatīvi</option>
							</select>
						</div>

						<div className="space-y-3">
							<label className={`block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
								Teksta pārnešana
							</label>
							<select
								value={editorSettings.wordWrap || 'on'}
								onChange={(e) => {
									console.log('Word wrap changing to:', e.target.value);
									updateSetting('wordWrap', e.target.value);
								}}
								className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${isDarkMode
										? 'bg-gray-800 border-gray-600 text-white'
										: 'bg-white border-gray-300 text-gray-900'
									}`}
							>
								<option value="on">Ieslēgta</option>
								<option value="off">Izslēgta</option>
							</select>
						</div>

						<div className="space-y-3">
							<label className={`block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
								Tab izmērs
							</label>
							<select
								value={editorSettings.tabSize?.toString() || '2'}
								onChange={(e) => {
									const newTabSize = Number(e.target.value);
									console.log('Tab size changing to:', newTabSize);
									updateSetting('tabSize', newTabSize);
								}}
								className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${isDarkMode
										? 'bg-gray-800 border-gray-600 text-white'
										: 'bg-white border-gray-300 text-gray-900'
									}`}
							>
								<option value="1">1</option>
								<option value="2">2</option>
								<option value="3">3</option>
								<option value="4">4</option>
								<option value="6">6</option>
								<option value="8">8</option>
							</select>
						</div>

						<div className="space-y-3">
							<label className={`block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
								Fonta saime
							</label>
							<input
								type="text"
								value={editorSettings.fontFamily || defaultSettings.fontFamily}
								onChange={(e) => {
									console.log('Font family changing to:', e.target.value);
									updateSetting('fontFamily', e.target.value);
								}}
								className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${isDarkMode
										? 'bg-gray-800 border-gray-600 text-white'
										: 'bg-white border-gray-300 text-gray-900'
									}`}
							/>
						</div>

						<div className="flex items-center space-x-3">
							<input
								id="readonly-checkbox"
								type="checkbox"
								checked={!!editorSettings.readOnly}
								onChange={(e) => {
									console.log('Read only changing to:', e.target.checked);
									updateSetting('readOnly', e.target.checked);
								}}
								className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
							/>
							<label htmlFor="readonly-checkbox" className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
								Tikai lasāms
							</label>
						</div>
					</div>

					<div className="mt-6 flex gap-3">
						<button
							onClick={() => {
								console.log('Resetting settings to:', defaultSettings);
								setEditorSettings({ ...defaultSettings });
							}}
							className={`flex-1 p-3 rounded-lg border ${isDarkMode
								? 'border-gray-700 text-gray-300 hover:bg-gray-800'
								: 'border-gray-300 text-gray-700 hover:bg-gray-50'
								}`}
						>
							Atiestatīt
						</button>
						<button
							onClick={() => setShowSettings(false)}
							className="flex-1 p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
						>
							Saglabāt
						</button>
					</div>
				</div>
			</div>
		);
	};

	// Merge editorSettings into a shape the MonacoEditor expects in `options` prop
	const monacoOptions = {
		minimap: editorSettings.minimap ?? { enabled: true },
		fontSize: editorSettings.fontSize ?? 14,
		lineNumbers: editorSettings.lineNumbers ?? 'on',
		wordWrap: editorSettings.wordWrap ?? 'on',
		tabSize: editorSettings.tabSize ?? 2,
		fontFamily: editorSettings.fontFamily,
		readOnly: editorSettings.readOnly ?? false,
		renderLineHighlight: 'all',
		smoothScrolling: true,
		automaticLayout: true,
	};

	return (
		<div className={`min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'} transition-colors duration-200`}>
			{showSettings && <SettingsModal />}
			{showSaveDialog && <SaveDialog />}
			{showLoadDialog && <LoadDialog />}

			<header className={`${isDarkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-200'} border-b`}>
				<div className="max-w-full px-6 py-2 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-white' : 'bg-black'}`}>
							<Code className={`${isDarkMode ? 'text-black' : 'text-white'} w-5 h-5`} />
						</div>
						<h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>Lynx IDE</h1>
					</div>

					<div className="flex items-center gap-3">
						<div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{currentTime}</div>
						<button
							onClick={() => setIsDarkMode(prev => !prev)}
							className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
						>
							{isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
						</button>
						<div className={`flex items-center gap-2 px-3 py-1.5 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} rounded-lg`}>
							<User className="w-4 h-4" />
							<span className="text-sm">{user?.username}</span>
						</div>
						<button
							onClick={logout}
							className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50'}`}
						>
							<LogOut className="w-4 h-4" />
							<span className="text-sm">Iziet</span>
						</button>
					</div>
				</div>
			</header>

			<div className="flex h-[calc(100vh-3.5rem)]">
				<div className={`${isDarkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-200'} w-12 border-r flex flex-col items-center py-4 space-y-3`}>
					<button
						onClick={executeCode}
						disabled={isRunning || !code.trim()}
						className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} disabled:opacity-50`}
						title="Palaist kodu"
					>
						{isRunning ? <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" /> : <Play size={16} />}
					</button>
					<button
						onClick={() => { setSaveTitle(currentCodeTitle); setShowSaveDialog(true); }}
						className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
						title="Saglabāt kodu"
					>
						<Save size={16} />
					</button>
					<button
						onClick={() => setShowLoadDialog(true)}
						className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
						title="Ielādēt kodu"
					>
						<FolderOpen size={16} />
					</button>
					<button
						onClick={downloadCode}
						className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
						title="Lejupielādēt kodu"
					>
						<Download size={16} />
					</button>
					<button
						onClick={clearCode}
						className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
						title="Notīrīt kodu"
					>
						<Trash2 size={16} />
					</button>

					<div className="flex-1" />

					<button
						onClick={() => setShowSettings(true)}
						className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
						title="Redaktora iestatījumi"
					>
						<Settings size={16} />
					</button>
				</div>

				<div className="flex-1 flex">
					<div className="flex-1 flex flex-col">
						<div className={`${isDarkMode ? 'bg-black border-gray-700' : 'bg-gray-50 border-gray-200'} border-b px-4 py-2 flex items-center justify-between`}>
							<div className="flex items-center gap-2 text-sm">
								<Code className="w-4 h-4" />
								<span className="font-medium">{currentCodeTitle}.lynx</span>
							</div>
							<div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
								Rindas: {(code.match(/\n/g) || []).length + 1} | Simboli: {code.length}
							</div>
						</div>

						<div className="flex-1">
							<MonacoEditor
								value={code}
								onChange={(v) => setCode(v)}
								language={'lynx'}
								theme={isDarkMode ? editorSettings.themeDark : editorSettings.themeLight}
								readOnly={editorSettings.readOnly}
								height={'100%'}
								options={monacoOptions}
							/>
						</div>
					</div>

					<div className={`${isDarkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-200'} w-96 border-l flex flex-col`}>
						<div className={`border-b px-4 py-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2 text-sm">
									<Terminal className="w-4 h-4" />
									<span className="font-medium">Konsoles izvads</span>
								</div>
								<div className="flex items-center gap-2">
									<div className={`w-2 h-2 rounded-full ${output && !error ? 'bg-green-500' :
										error ? 'bg-red-500' :
											'bg-gray-400'
										}`}></div>
									<span className="text-xs">
										{output && !error ? 'Gatavs' : error ? 'Kļūda' : 'Gaida'}
									</span>
								</div>
							</div>
						</div>

						<div className="flex-1 p-4 overflow-auto">
							{!output && !error && (
								<div className="flex items-center justify-center h-full">
									<div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
										Gatavs kompilēt
									</div>
								</div>
							)}
							{error && (
								<div className="space-y-2">
									<div className="flex items-center gap-2 text-red-500 text-sm font-medium">
										<AlertCircle className="w-4 h-4" />
										Kļūda
									</div>
									<pre className={`text-sm font-mono whitespace-pre-wrap ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
										{error}
									</pre>
								</div>
							)}
							{output && (
								<div className="space-y-2">
									<div className="flex items-center gap-2 text-green-500 text-sm font-medium">
										<Terminal className="w-4 h-4" />
										Izvads
									</div>
									<pre className={`text-sm font-mono whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
										{output}
									</pre>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Home;


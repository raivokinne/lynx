import { AlertCircle, Download, Play, Trash2, LogOut, User, Terminal, Zap, Code, Shield, Sun, Moon, Save, FolderOpen, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from '../contexts/AuthContext';
import Editor from "react-simple-code-editor";

const highlight = (code: string) => {
    let highlighted = code;

    const colors = {
        comment: '#6b7280',
        string: '#059669',
        keyword: '#1f2937',
        number: '#0f172a',
        function: '#374151'
    };

    highlighted = highlighted.replace(
        /\/\/.*/g,
        `<span style="color: ${colors.comment}; font-style: italic;">$&</span>`
    );

    highlighted = highlighted.replace(
        /"(?:\\.|[^"\\])*"/g,
        `<span style="color: ${colors.string};">$&</span>`
    );

    highlighted = highlighted.replace(
        /\b(?:if|else|for|in|while|return|break|continue|const|let|fn|true|false)\b/g,
        `<span style="color: ${colors.keyword}; font-weight: bold;">$&</span>`
    );

    highlighted = highlighted.replace(
        /\b\d+(?:\.\d+)?\b/g,
        `<span style="color: ${colors.number};">$&</span>`
    );

    highlighted = highlighted.replace(
        /\b[a-zA-Z_]\w*(?=\s*\()/g,
        `<span style="color: ${colors.function}; font-weight: bold;">$&</span>`
    );

    return highlighted;
};

export default function Home() {
    const [code, setCode] = useState<string>('');
    const [output, setOutput] = useState<string>('');
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [currentTime, setCurrentTime] = useState<string>('');
    const [keySequence, setKeySequence] = useState<string>('');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [saveTitle, setSaveTitle] = useState<string>('');
    const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
    const [savedCodes, setSavedCodes] = useState<any[]>([]);
    const [showLoadDialog, setShowLoadDialog] = useState<boolean>(false);
    const [_, setCurrentCodeId] = useState<string | null>(null);
    const [currentCodeTitle, setCurrentCodeTitle] = useState<string>('Untitled');
    const [lastSaved, setLastSaved] = useState<string>('');
    const { user, logout } = useAuth();

    const KONAMI_CODE = 'lynx';
    const API_BASE = 'http://localhost:3001/api';

    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

    useEffect(() => {
        if (code) {
            localStorage.setItem(`lynx_code_${user?.id}`, code);
            localStorage.setItem(`lynx_code_title_${user?.id}`, currentCodeTitle);
        }
    }, [code, currentCodeTitle, user?.id]);

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

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let resetTimer: number | undefined;
        const handleKeyPress = (e: KeyboardEvent) => {
            const newSequence = (keySequence + e.key.toLowerCase()).slice(-20); // keep buffer small
            setKeySequence(newSequence);

            if (newSequence.includes(KONAMI_CODE)) {
                setIsTerminalMode(prev => !prev);
                setKeySequence('');
            }

            if (resetTimer) {
                window.clearTimeout(resetTimer);
            }
            resetTimer = window.setTimeout(() => {
                setKeySequence('');
            }, 3000);
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            if (resetTimer) window.clearTimeout(resetTimer);
        };
    }, [keySequence]);

    const executeCode = async () => {
        setIsRunning(true);

        const loadingMessages = 'Kompilē kodu...\nAnalizē sintaksi...\nIzpilda...\n';

        setOutput(loadingMessages);
        setError('');

        try {
            const response = await fetch(`${API_BASE}/compile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                setOutput(`>>> COMPILATION SUCCESSFUL\n>>> OUTPUT:\n${result.output || '[NO OUTPUT - PROCESS COMPLETED]'}\n>>> END TRANSMISSION`);
                setError('');
            } else {
                setError(`>>> COMPILATION FAILED\n>>> ERROR LOG:\n${result.error || 'Unknown compilation error'}\n>>> END ERROR REPORT`);
                setOutput('');
            }
        } catch (e: any) {
            const errorMessage = `Kompilācijas kļūda:\n${e.message}`;
            setError(errorMessage);
            setOutput('');
        } finally {
            setIsRunning(false);
        }
    };

    const saveCode = async () => {
        if (!saveTitle.trim()) {
            alert('Lūdzu norādiet nosaukumu');
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(`${API_BASE}/code/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({
                    title: saveTitle,
                    code
                }),
            });

            const result = await response.json();

            if (result.success) {
                setCurrentCodeId(result.id);
                setCurrentCodeTitle(saveTitle);
                setLastSaved(new Date().toLocaleTimeString());
                setShowSaveDialog(false);
                setSaveTitle('');
                loadSavedCodes();

                alert('Kods saglabāts veiksmīgi!');
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (e: any) {
            const errorMsg = `Saglabāšanas kļūda: ${e.message}`;
            alert(errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    const loadSavedCodes = async () => {
        try {
            const response = await fetch(`${API_BASE}/code/list`, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            });

            const result = await response.json();
            if (result.success) {
                setSavedCodes(result.codes || []);
            } else {
                setSavedCodes([]);
            }
        } catch (err) {
            console.error('Error loading saved codes:', err);
            setSavedCodes([]);
        }
    };

    const loadCode = async (codeId: string) => {
        try {
            const response = await fetch(`${API_BASE}/code/${codeId}`, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            });

            const result = await response.json();
            if (result.success) {
                setCode(result.code.code);
                setCurrentCodeTitle(result.code.title);
                setCurrentCodeId(result.code.id);
                setShowLoadDialog(false);
                setOutput('');
                setError('');
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (e: any) {
            alert(`Kļūda ielādējot kodu: ${e.message}`);
        }
    };

    const clearCode = () => {
        setCode('');
        setOutput('');
        setError('');
        setCurrentCodeId(null);
        setCurrentCodeTitle('Untitled');
        localStorage.removeItem(`lynx_code_${user?.id}`);
        localStorage.removeItem(`lynx_code_title_${user?.id}`);
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

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {showSaveDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white border border-gray-300 rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-gray-900 font-semibold mb-4">Saglabāt kodu</h3>
                        <input
                            type="text"
                            value={saveTitle}
                            onChange={(e) => setSaveTitle(e.target.value)}
                            placeholder="Ievadiet nosaukumu"
                            className="w-full border border-gray-300 rounded p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={saveCode}
                                disabled={isSaving}
                                className="flex-1 bg-gray-900 text-white p-2 rounded hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isSaving ? 'Saglabā...' : 'Saglabāt'}
                            </button>
                            <button
                                onClick={() => setShowSaveDialog(false)}
                                className="flex-1 border border-gray-300 text-gray-700 p-2 rounded hover:bg-gray-50"
                            >
                                Atcelt
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Load Dialog */}
            {showLoadDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white border border-gray-300 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96">
                        <h3 className="text-gray-900 font-semibold mb-4">Saglabātie kodi</h3>
                        <div className="max-h-64 overflow-y-auto mb-4">
                            {savedCodes.length === 0 ? (
                                <div className="text-gray-500 text-center py-8">Nav saglabātu kodu</div>
                            ) : (
                                savedCodes.map((savedCode) => (
                                    <div
                                        key={savedCode.id}
                                        onClick={() => loadCode(savedCode.id)}
                                        className="border border-gray-200 rounded p-4 mb-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <FileText className="w-4 h-4 text-gray-600" />
                                            <div className="font-medium">{savedCode.title}</div>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Izveidots: {new Date(savedCode.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLoadDialog(false)}
                                className="flex-1 border border-gray-300 text-gray-700 p-2 rounded hover:bg-gray-50"
                            >
                                Aizvērt
                            </button>
                            <button
                                onClick={() => {
                                    loadSavedCodes();
                                }}
                                className="flex-1 border border-gray-300 text-gray-700 p-2 rounded hover:bg-gray-50"
                            >
                                Atsvaidzināt
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                                <Code className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Lynx IDE</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-500">
                                {currentTime}
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border">
                                <User className="w-4 h-4 text-gray-600" />
                                <span className="text-sm text-gray-700">{user?.username}</span>
                            </div>
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Izrakstīties
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6">
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between p-4 bg-gray-50">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={executeCode}
                                disabled={isRunning || !code.trim()}
                                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium disabled:cursor-not-allowed transition-colors"
                            >
                                {isRunning ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        Izpilda...
                                    </>
                                ) : (
                                    <>
                                        <Play size={16} />
                                        Palaist kodu
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setSaveTitle(currentCodeTitle);
                                    setShowSaveDialog(true);
                                }}
                                disabled={!code.trim()}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                <Save size={16} />
                                Saglabāt
                            </button>
                            <button
                                onClick={() => {
                                    loadSavedCodes();
                                    setShowLoadDialog(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <FolderOpen size={16} />
                                Ielādēt
                            </button>
                            <button
                                onClick={downloadCode}
                                disabled={!code.trim()}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                <Download size={16} />
                                Lejupielādēt
                            </button>
                            <button
                                onClick={clearCode}
                                disabled={!code.trim() && !output && !error}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                <Trash2 size={16} />
                                Notīrīt
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Editor */}
                        <div className="border-r border-gray-200">
                            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Code className="w-4 h-4 text-gray-600" />
                                    <span className="text-gray-700 font-medium">{currentCodeTitle}.lynx</span>
                                    <span className="ml-auto text-gray-500">Rinda: {(code.match(/\n/g) || []).length + 1}</span>
                                </div>
                            </div>
                            <div className="h-[600px] lg:h-[65vh] relative bg-white">
                                <Editor
                                    value={code}
                                    onValueChange={setCode}
                                    highlight={(code) => highlight(code)}
                                    padding={20}
                                    className="w-full h-full font-mono text-sm bg-white text-gray-900 leading-relaxed resize-none border-none outline-none"
                                    textareaClassName="outline-none resize-none bg-white text-gray-900 caret-gray-900 selection:bg-gray-200"
                                    style={{
                                        fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
                                        fontSize: 14,
                                        lineHeight: 1.6,
                                        backgroundColor: 'white',
                                        color: '#111827',
                                        minHeight: '100%'
                                    }}
                                    placeholder="// Ievadiet savu Lynx kodu šeit..."
                                />
                            </div>
                        </div>

                        {/* Output */}
                        <div className="bg-white">
                            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Terminal className="w-4 h-4 text-gray-600" />
                                        <span className="text-gray-700 font-medium">Konsoles izvads</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${
                                            output && !error ? 'bg-green-500' :
                                            error ? 'bg-red-500' :
                                            'bg-gray-400'
                                        }`}></div>
                                        <span className="text-xs text-gray-500">
                                            {output && !error ? 'Gatavs' :
                                             error ? 'Kļūda' :
                                             'Gaida'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-[600px] lg:h-[65vh] p-6 overflow-auto bg-gray-50">
                                {!output && !error && (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <div className="bg-white border border-gray-200 rounded-lg p-8">
                                            <Terminal className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <div className="text-gray-900 font-medium mb-2">Gatavs kompilēt</div>
                                            <div className="text-gray-500 text-sm">
                                                Ieraksti kodu un nospied "Palaist kodu", lai redzētu izvadu
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <AlertCircle className="w-5 h-5 text-red-500" />
                                            <span className="text-red-800 font-semibold">Kļūda</span>
                                        </div>
                                        <pre className="text-red-700 text-sm bg-white border border-red-200 rounded p-3 overflow-x-auto">
{error}
                                        </pre>
                                    </div>
                                )}
                                {output && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Zap className="w-5 h-5 text-green-600" />
                                            <span className="text-green-800 font-semibold">Izvads</span>
                                        </div>
                                        <pre className="text-green-800 text-sm bg-white border border-green-200 rounded p-3 overflow-x-auto">
{output}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


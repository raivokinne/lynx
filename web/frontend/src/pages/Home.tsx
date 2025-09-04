import { AlertCircle, Download, Play, Trash2, LogOut, User, Terminal, Zap } from "lucide-react";
import { useState } from "react";
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState('');
    const { user, logout } = useAuth();

    const executeCode = async () => {
        setIsRunning(true);
        setOutput('Running...\n');
        setError('');

        try {
            const response = await fetch('http://localhost:3001/api/compile', {
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
                setOutput(result.output || 'Program executed successfully (no output)');
            } else {
                setError(result.error || 'Compilation failed');
                setOutput('');
            }
        } catch (error: any) {
            console.error('Error:', error);
            setError(`Connection error: ${error.message}. Make sure your backend server is running.`);
            setOutput('');
        } finally {
            setIsRunning(false);
        }
    };

    const clearCode = () => {
        setCode('');
        setOutput('');
        setError('');
    };

    const downloadCode = () => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'code.lynx';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
            {/* Header */}
            <header className="bg-white/5 backdrop-blur-xl border-b border-white/20">
                <div className="w-full mx-auto px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    Lynx Koda Kompilators
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                                <div className="w-8 h-8 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg flex items-center justify-center border border-white/20">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-white">{user?.username}</span>
                                    <span className="text-xs text-gray-400">Developer</span>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="group flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 border border-gray-600 hover:border-white/40"
                            >
                                <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                <span className="hidden sm:inline">Izrakstīties</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="w-full mx-auto p-6 lg:p-8">
                <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between p-6 border-b border-white/20 bg-gradient-to-r from-white/10 to-white/5">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={executeCode}
                                disabled={isRunning || !code.trim()}
                                className="group relative flex items-center gap-3 bg-gradient-to-r from-white to-gray-200 hover:from-gray-100 hover:to-white disabled:from-gray-600 disabled:to-gray-700 text-black hover:text-black disabled:text-gray-400 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:scale-100 disabled:cursor-not-allowed overflow-hidden border border-white/30 disabled:border-gray-600"
                            >
                                {isRunning ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                                ) : (
                                    <Play size={20} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                                )}
                                <span className="relative z-10">{isRunning ? 'Izpildās…' : 'Kompilēt un Palaist'}</span>
                                {!isRunning && (
                                    <div className="absolute inset-0 rounded-2xl bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                )}
                            </button>
                            {isRunning && (
                                <div className="flex items-center gap-3 text-gray-300 animate-pulse">
                                    <Zap className="w-5 h-5" />
                                    <span className="text-sm font-medium">Kods tiek apstrādāts…</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={downloadCode}
                                disabled={!code.trim()}
                                className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-gray-300 hover:text-white disabled:text-gray-600 px-4 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed border border-white/20 hover:border-white/40"
                                title="Download Code"
                            >
                                <Download size={18} className="transition-transform duration-200 group-hover:-translate-y-0.5" />
                                <span className="hidden sm:inline font-medium">Lejupielādēt</span>
                            </button>
                            <button
                                onClick={clearCode}
                                disabled={!code.trim() && !output && !error}
                                className="group flex items-center gap-2 bg-gray-800/50 hover:bg-gray-700/50 disabled:bg-white/5 text-gray-300 hover:text-white disabled:text-gray-600 px-4 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed border border-gray-600 hover:border-gray-400"
                                title="Clear All"
                            >
                                <Trash2 size={18} className="transition-transform duration-200 group-hover:rotate-12" />
                                <span className="hidden sm:inline font-medium">Izdzēst</span>
                            </button>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mx-6 mt-6 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600 rounded-2xl p-5 backdrop-blur-sm">
                            <div className="flex items-start gap-4">
                                <div className="bg-gray-700/50 p-2 rounded-xl border border-gray-600">
                                    <AlertCircle className="text-gray-300 flex-shrink-0" size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-gray-200 font-semibold text-base mb-2">Kompilācijas kļūda</h4>
                                    <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap bg-gray-800/30 p-4 rounded-xl border border-gray-600 overflow-x-auto">
                                        {error}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[70vh]">
                        <div className="border-r border-white/20 bg-gradient-to-br from-gray-900/50 to-black/50">
                            <div className="relative">
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="w-full h-[600px] lg:h-[70vh] p-6 font-mono text-xl resize-none border-none outline-none bg-transparent text-white leading-relaxed placeholder:text-gray-500 selection:bg-white/30"
                                    spellCheck="false"
                                />
                            </div>
                        </div>

                        {/* Output Panel */}
                        <div className="bg-gradient-to-br from-black/80 to-gray-900/60">
                            <div className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 px-6 py-4 border-b border-white/20 backdrop-blur-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${output && !error ? 'bg-white shadow-lg shadow-white/50' :
                                                error ? 'bg-gray-400 shadow-lg shadow-gray-400/50' :
                                                    'bg-gray-600'
                                                }`}></div>
                                            <h3 className="font-semibold text-gray-200">Konsoles izvade</h3>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {output && !error && (
                                            <div className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                <span>Izdevās</span>
                                            </div>
                                        )}
                                        {error && (
                                            <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                                <span>Kļūda</span>
                                            </div>
                                        )}
                                        {!output && !error && (
                                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                                                <span>Gaida...</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="h-[600px] lg:h-[70vh] p-6 overflow-auto">
                                {!output && !error && (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <div className="bg-gray-800/30 p-6 rounded-2xl border border-gray-700 mb-4">
                                            <Terminal className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <h3 className="text-gray-300 font-medium mb-2">Izvade parādīsies šeit</h3>
                                            <p className="text-gray-500 text-sm">Palaidiet savu kodu, lai redzētu rezultātu</p>
                                        </div>
                                    </div>
                                )}
                                {(output || error) && (
                                    <div className="space-y-3">
                                        {error && (
                                            <div className="bg-gray-800/30 border border-gray-600 rounded-xl p-4 backdrop-blur-sm">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <AlertCircle className="w-5 h-5 text-gray-400" />
                                                    <span className="text-gray-300 font-medium">Kompilācijas kļūda</span>
                                                </div>
                                                <pre className="text-gray-200 text-sm font-mono whitespace-pre-wrap overflow-x-auto bg-gray-900/30 p-4 rounded-lg border border-gray-700">
                                                    {error}
                                                </pre>
                                            </div>
                                        )}
                                        {output && (
                                            <div className="bg-white/10 border border-white/30 rounded-xl p-4 backdrop-blur-sm">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Zap className="w-5 h-5 text-gray-300" />
                                                    <span className="text-gray-200 font-medium">Programmas izvade</span>
                                                </div>
                                                <pre className="text-white text-sm font-mono whitespace-pre-wrap overflow-x-auto bg-white/5 p-4 rounded-lg border border-white/20">
                                                    {output}
                                                </pre>
                                            </div>
                                        )}
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

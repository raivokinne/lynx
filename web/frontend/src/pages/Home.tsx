import { AlertCircle, Download, Play, Trash2, LogOut, User, Terminal, Zap, Code, Shield, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from '../contexts/AuthContext';
import Editor from "react-simple-code-editor";

const highlight = (code: string, isTerminalMode: boolean) => {
    let highlighted = code;

    const colors = isTerminalMode ? {
        comment: '#4ade80',
        string: '#22c55e',
        keyword: '#10b981',
        number: '#34d399',
        function: '#6ee7b7'
    } : {
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
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [isTerminalMode, setIsTerminalMode] = useState(false);
    const [keySequence, setKeySequence] = useState('');
    const { user, logout } = useAuth();

    const KONAMI_CODE = 'lynx';

    useEffect(() => {
        // Atjaunina laiku katru sekundi
        const interval = setInterval(() => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            const newSequence = keySequence + e.key.toLowerCase();
            setKeySequence(newSequence);

            if (newSequence.includes(KONAMI_CODE)) {
                setIsTerminalMode(!isTerminalMode);
                setKeySequence('');
            }

            // Atiestata secību pēc 3 sekundēm
            setTimeout(() => {
                setKeySequence('');
            }, 3000);
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [keySequence, isTerminalMode]);

    const executeCode = async () => {
        setIsRunning(true);

        const loadingMessages = isTerminalMode
            ? '>>> SĀK KOMPILĀCIJAS SEKVENCES...\n>>> ANALIZĒ KODA STRUKTŪRU...\n>>> IZPILDA...\n'
            : 'Kompilē kodu...\nAnalizē sintaksi...\nIzpilda...\n';

        setOutput(loadingMessages);
        setError('');

        // Simulē kompilācijas aizkavi
        await new Promise(resolve => setTimeout(resolve, 1500));

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
                setOutput(`>>> COMPILATION SUCCESSFUL\n>>> OUTPUT:\n${result.output || '[NO OUTPUT - PROCESS COMPLETED]'}\n>>> END TRANSMISSION`);
            } else {
                setError(`>>> COMPILATION FAILED\n>>> ERROR LOG:\n${result.error || 'Unknown compilation error'}\n>>> END ERROR REPORT`);
                setOutput('');
            }
        } catch (error: any) {
            const errorMessage = isTerminalMode
                ? `>>> SAVIENOJUMA KĻŪDA\n>>> DETALIZĀCIJA: ${error.message}\n>>> KĻŪDU ZIŅOJUMA BEIGAS`
                : `Kompilācijas kļūda:\n${error.message}`;
            setError(errorMessage);
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
        a.download = isTerminalMode ? 'lynx_payload.lynx' : 'kods.lynx';
        a.click();
        URL.revokeObjectURL(url);
    };

    if (isTerminalMode) {
        return (
            <div className="min-h-screen bg-black text-green-400 font-mono">
                {/* ASCII Art Header */}
                <div className="border-b border-green-500 bg-black">
                    <div className="text-center py-2 text-green-500 text-xs">
                        ╔══════════════════════════════════════════════════════════════════════════════════════╗
                    </div>
                </div>

                {/* Header */}
                <header className="bg-black border-b border-green-500">
                    <div className="w-full mx-auto px-6">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center gap-4">
                                <Shield className="w-6 h-6 text-green-400" />
                                <div>
                                    <h1 className="text-lg font-bold text-green-400 tracking-wider">
                                        [ LYNX KOMPILATORS v2.1.4 ]
                                    </h1>
                                    <div className="text-xs text-green-600">DROŠS IZSTRĀDES TERMINĀLIS</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 text-sm">
                                <div className="text-green-500">
                                    SISTĒMAS_LAIKS: {currentTime}
                                </div>
                                <div className="flex items-center gap-2 border border-green-500 px-3 py-1">
                                    <User className="w-4 h-4" />
                                    <span>LIETOTĀJS: {user?.username?.toUpperCase()}</span>
                                </div>
                                <button
                                    onClick={() => setIsTerminalMode(false)}
                                    className="flex items-center gap-2 px-3 py-1 border border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black transition-colors"
                                >
                                    <Sun className="w-4 h-4" />
                                    IZSLĒGT_TERMINĀLI
                                </button>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-2 px-3 py-1 border border-red-500 text-red-400 hover:bg-red-500 hover:text-black transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    IZRAKSTĪTIES
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Status Bar */}
                <div className="bg-black border-b border-green-500 px-6 py-2 text-xs">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-green-400">STATUSS: GATAVS</span>
                            <span className="text-green-600">|</span>
                            <span className="text-green-400">VALODA: LYNX</span>
                            <span className="text-green-600">|</span>
                            <span className="text-green-400">REŽĪMS: IZSTRĀDE</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-green-400">SISTĒMA ONLINE</span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="w-full mx-auto p-6">
                    <div className="border border-green-500 bg-black">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between p-4 border-b border-green-500 bg-black">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={executeCode}
                                    disabled={isRunning || !code.trim()}
                                    className="flex items-center gap-2 bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-black disabled:text-gray-400 px-4 py-2 font-bold tracking-wide disabled:cursor-not-allowed transition-colors"
                                >
                                    {isRunning ? (
                                        <>
                                            <Zap className="w-4 h-4 animate-pulse" />
                                            IZPILDA...
                                        </>
                                    ) : (
                                        <>
                                            <Play size={16} />
                                            KOMPILĒT & PALAIST
                                        </>
                                    )}
                                </button>
                                {isRunning && (
                                    <div className="flex items-center gap-2 text-green-400">
                                        <div className="flex gap-1">
                                            <div className="w-1 h-4 bg-green-400 animate-pulse"></div>
                                            <div className="w-1 h-4 bg-green-400 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                            <div className="w-1 h-4 bg-green-400 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                                        </div>
                                        <span className="text-sm">APSTRĀDE...</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={downloadCode}
                                    disabled={!code.trim()}
                                    className="flex items-center gap-2 border border-green-500 text-green-400 hover:bg-green-500 hover:text-black disabled:border-gray-600 disabled:text-gray-600 px-3 py-1 text-sm disabled:cursor-not-allowed transition-colors"
                                >
                                    <Download size={14} />
                                    LEJUPIELĀDĒT
                                </button>
                                <button
                                    onClick={clearCode}
                                    disabled={!code.trim() && !output && !error}
                                    className="flex items-center gap-2 border border-red-500 text-red-400 hover:bg-red-500 hover:text-black disabled:border-gray-600 disabled:text-gray-600 px-3 py-1 text-sm disabled:cursor-not-allowed transition-colors"
                                >
                                    <Trash2 size={14} />
                                    NOTĪRĪT
                                </button>
                            </div>
                        </div>

                        {/* Error Panel */}
                        {error && (
                            <div className="mx-4 mt-4 border border-red-500 bg-black p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="text-red-400 flex-shrink-0 mt-1" size={16} />
                                    <div className="flex-1">
                                        <h4 className="text-red-400 font-bold text-sm mb-2">[ ATRASTA KĻŪDA ]</h4>
                                        <pre className="text-red-300 text-sm font-mono whitespace-pre-wrap bg-black border border-red-500 p-3 overflow-x-auto">
{error}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[70vh]">
                            {/* Code Editor */}
                            <div className="border-r border-green-500 bg-black">
                                <div className="bg-black border-b border-green-500 px-4 py-2">
                                    <div className="flex items-center gap-2 text-xs">
                                        <Code className="w-4 h-4 text-green-400" />
                                        <span className="text-green-400">AVOTKODS.lynx</span>
                                        <span className="ml-auto text-green-600">RINDA: {(code.match(/\n/g) || []).length + 1}</span>
                                    </div>
                                </div>
                                <div className="h-[600px] lg:h-[65vh] relative">
                                    <Editor
                                        value={code}
                                        onValueChange={setCode}
                                        highlight={(code) => highlight(code, true)}
                                        padding={16}
                                        className="w-full h-full font-mono text-sm bg-black text-green-400 leading-relaxed resize-none border-none outline-none"
                                        textareaClassName="outline-none resize-none bg-black text-green-400 caret-green-400 selection:bg-green-900"
                                        style={{
                                            fontFamily: '"Courier New", monospace',
                                            fontSize: 14,
                                            lineHeight: 1.6,
                                            backgroundColor: 'black',
                                            color: '#4ade80',
                                            minHeight: '100%'
                                        }}
                                        placeholder="// IEVADIET LYNX KODU ŠEIT..."
                                    />
                                    <div className="absolute bottom-2 right-2 text-xs text-green-600">
                                        &gt;_
                                    </div>
                                </div>
                            </div>

                            {/* Output Panel */}
                            <div className="bg-black">
                                <div className="bg-black border-b border-green-500 px-4 py-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs">
                                            <Terminal className="w-4 h-4 text-green-400" />
                                            <span className="text-green-400">SISTĒMAS_IZVADS.log</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 ${
                                                output && !error ? 'bg-green-400 animate-pulse' :
                                                error ? 'bg-red-400 animate-pulse' :
                                                'bg-gray-600'
                                            }`}></div>
                                            <span className="text-xs text-green-600">
                                                {output && !error ? 'VEIKSMĪGI' :
                                                 error ? 'KĻŪDA' :
                                                 'GAIDA'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-[600px] lg:h-[65vh] p-4 overflow-auto bg-black">
                                    {!output && !error && (
                                        <div className="flex flex-col items-center justify-center h-full text-center">
                                            <div className="border border-green-500 p-6 bg-black">
                                                <Terminal className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                                <div className="text-green-400 mb-2">[ TERMINĀLIS GATAVS ]</div>
                                                <div className="text-green-600 text-sm">Gaida kompilācijas komandu...</div>
                                                <div className="mt-4 text-green-500 text-xs animate-pulse">
                                                    ████████████████████████
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {error && (
                                        <div className="border border-red-500 bg-black p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <AlertCircle className="w-5 h-5 text-red-400" />
                                                <span className="text-red-400 font-bold">[ SISTĒMAS KĻŪDA ]</span>
                                            </div>
                                            <pre className="text-red-300 text-sm font-mono whitespace-pre-wrap overflow-x-auto bg-black border border-red-500 p-3">
{error}
                                            </pre>
                                        </div>
                                    )}
                                    {output && (
                                        <div className="border border-green-500 bg-black p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Zap className="w-5 h-5 text-green-400" />
                                                <span className="text-green-400 font-bold">[ IZPILDES ŽURNĀLS ]</span>
                                            </div>
                                            <pre className="text-green-300 text-sm font-mono whitespace-pre-wrap overflow-x-auto bg-black border border-green-500 p-3">
{output}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-green-500 bg-black px-6 py-2">
                    <div className="text-center text-xs text-green-600">
                        ╚══════════════════════════════════════════════════════════════════════════════════════╝
                    </div>
                </div>
            </div>
        );
    }

    // Noklusētais tīrais melnbaltais dizains (latviskots)
    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
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

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-6">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={executeCode}
                                disabled={isRunning || !code.trim()}
                                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg font-medium disabled:cursor-not-allowed transition-colors"
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

                    {/* Error Panel */}
                    {error && (
                        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                                <div className="flex-1">
                                    <h4 className="text-red-800 font-semibold text-sm mb-2">Kompilācijas kļūda</h4>
                                    <pre className="text-red-700 text-sm bg-white border border-red-200 rounded p-3 overflow-x-auto">
{error}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Code Editor */}
                        <div className="border-r border-gray-200">
                            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Code className="w-4 h-4 text-gray-600" />
                                    <span className="text-gray-700 font-medium">main.lynx</span>
                                    <span className="ml-auto text-gray-500">Rinda: {(code.match(/\n/g) || []).length + 1}</span>
                                </div>
                            </div>
                            <div className="h-[600px] lg:h-[65vh] relative bg-white">
                                <Editor
                                    value={code}
                                    onValueChange={setCode}
                                    highlight={(code) => highlight(code, false)}
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

                        {/* Output Panel */}
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
                                        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
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

                {/* Easter egg hint */}
                <div className="mt-4 text-center">
                    <p className="text-xs text-gray-400">
                        Psst... pamēģini ierakstīt "lynx", lai atbloķētu ko īpašu 🐱
                    </p>
                </div>
            </div>
        </div>
    );
}


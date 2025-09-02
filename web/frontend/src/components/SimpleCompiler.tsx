import React, { useState } from 'react';
import { Play, Copy, Download, Trash2, AlertCircle } from 'lucide-react';

const SimpleCompiler = () => {
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState('');

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
        } catch (error) {
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
        a.download = 'code.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-white text-black p-4">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white border border-gray-300 shadow-md">
                    <div className="flex items-center justify-between p-4 border-b border-gray-300">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={executeCode}
                                disabled={isRunning}
                                className="flex items-center gap-2 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
                            >
                                <Play size={16} />
                                {isRunning ? 'Running...' : 'Compile & Run'}
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={downloadCode}
                                className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-3 py-2 rounded-lg transition-all duration-200"
                                title="Download Code"
                            >
                                <Download size={16} />
                            </button>
                            <button
                                onClick={clearCode}
                                className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-3 py-2 rounded-lg transition-all duration-200"
                                title="Clear All"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-gray-100 border-l-4 border-black p-4 mx-4 mt-4 rounded">
                            <div className="flex items-center">
                                <AlertCircle className="text-black mr-2" size={16} />
                                <p className="text-black text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 h-96">
                        <div className="border-r border-gray-300">
                            <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
                                <h3 className="font-semibold text-black">Code Editor</h3>
                            </div>
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full h-full p-4 font-mono text-sm resize-none border-none outline-none bg-white text-black"
                                placeholder="Write your code here..."
                                spellCheck="false"
                            />
                        </div>

                        <div>
                            <div className="bg-gray-200 px-4 py-2 border-b border-gray-300">
                                <h3 className="font-semibold text-black">Output</h3>
                            </div>
                            <div className="h-full bg-black text-white p-4 font-mono text-sm overflow-auto">
                                <pre className="whitespace-pre-wrap">
                                    {error ? (
                                        <span className="text-red-500">{error}</span>
                                    ) : (
                                        output || 'Click "Compile & Run" to see output...'
                                    )}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimpleCompiler;


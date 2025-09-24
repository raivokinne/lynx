import React from 'react';
import { Terminal, AlertCircle } from "lucide-react";

interface OutputPanelProps {
    isDarkMode: boolean;
    output: string;
    error: string;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
    isDarkMode,
    output,
    error
}) => (
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
);


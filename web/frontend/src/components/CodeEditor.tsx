import React from 'react';
import { Code } from "lucide-react";
import MonacoEditor from './MonacoEditor';
import type { EditorSettings } from '../types/types';

interface CodeEditorProps {
  isDarkMode: boolean;
  code: string;
  currentCodeTitle: string;
  editorSettings: EditorSettings;
  onChange: (value: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  isDarkMode,
  code,
  currentCodeTitle,
  editorSettings,
  onChange
}) => {
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
          onChange={onChange}
          language="lynx"
          theme={isDarkMode ? editorSettings.themeDark : editorSettings.themeLight}
          readOnly={editorSettings.readOnly}
          height="100%"
          options={monacoOptions}
        />
      </div>
    </div>
  );
};

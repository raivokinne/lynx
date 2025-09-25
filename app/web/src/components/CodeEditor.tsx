import React, { useState } from "react";
import { Code, Plus, X } from "lucide-react";
import MonacoEditor from "./MonacoEditor";
import type { EditorSettings, SavedCode } from "../types/types";
import { SaveDialog } from "./SaveDialog";

interface CodeEditorProps {
  isDarkMode: boolean;
  code: string;
  currentCodeTitle: string;
  editorSettings: EditorSettings;
  savedCodes: SavedCode[];
  onChange: (value: string) => void;
  onSaveCode: (title: string) => void;
  onLoad: (savedCode: SavedCode) => void;
  deleteCode: (codeId: string) => Promise<boolean>;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  isDarkMode,
  code,
  editorSettings,
  savedCodes,
  onChange,
  onSaveCode,
  onLoad,
  deleteCode,
}) => {
  const [saveTitle, setSaveTitle] = useState<string>("");
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);

  const monacoOptions = {
    minimap: editorSettings.minimap ?? { enabled: true },
    fontSize: editorSettings.fontSize ?? 14,
    lineNumbers: editorSettings.lineNumbers ?? "on",
    wordWrap: editorSettings.wordWrap ?? "on",
    tabSize: editorSettings.tabSize ?? 2,
    fontFamily: editorSettings.fontFamily,
    readOnly: editorSettings.readOnly ?? false,
    renderLineHighlight: "all",
    smoothScrolling: true,
    automaticLayout: true,
  };

  const handleSaveCode = () => {
    onSaveCode(saveTitle);
    setSaveTitle("");
    setShowSaveDialog(false);
    onChange(code);
  };

  const handleShow = () => {
    setShowSaveDialog(!showSaveDialog);
  };

  return (
    <>
      {showSaveDialog && (
        <SaveDialog
          isDarkMode={isDarkMode}
          saveTitle={saveTitle}
          setSaveTitle={setSaveTitle}
          onSave={handleSaveCode}
          onClose={() => setShowSaveDialog(false)}
        />
      )}
      <div className="flex-1 flex flex-col">
        <div
          className={`${isDarkMode ? "bg-black border-gray-700" : "bg-gray-50 border-gray-200"} border-b px-4 py-2 flex items-center justify-between`}
        >
          {savedCodes.map((code) => (
            <div
              key={code.id}
              className="flex justify-between items-center w-full p-1 px-4"
            >
              <button
                onClick={() => onLoad(code)}
                className="flex gap-2 items-center text-sm"
              >
                <Code className="w-4 h-4" />
                <span className="font-medium">{code.title}</span>
              </button>
              <button
                onClick={() => deleteCode(code.id)}
                className="flex gap-2 items-center text-sm"
              >
                <X className="w-4 h-4 bg-red-500 text-white rounded-sm" />
              </button>
            </div>
          ))}
          <button
            onClick={handleShow}
            className="flex gap-2 items-center text-sm hover:opacity-70"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1">
          <MonacoEditor
            value={code}
            onChange={onChange}
            language="lynx"
            theme={
              isDarkMode ? editorSettings.themeDark : editorSettings.themeLight
            }
            readOnly={editorSettings.readOnly}
            height="100%"
            options={monacoOptions}
            customThemes={editorSettings.customThemes || []}
          />
        </div>
      </div>
    </>
  );
};

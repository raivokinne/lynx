import React, { useState, useEffect } from "react";
import { Code, Plus, X } from "lucide-react";
import MonacoEditor from "./MonacoEditor";
import type { EditorSettings, SavedCode } from "../types/types";
import { SaveDialog } from "./SaveDialog";
import { useAuth } from "../hooks/useAuth";

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
  onUpdate: (codeId: string, title: string) => Promise<boolean>;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  isDarkMode,
  code,
  editorSettings,
  currentCodeTitle,
  savedCodes,
  onChange,
  onSaveCode,
  onLoad,
  deleteCode,
  onUpdate,
}) => {
  const [saveTitle, setSaveTitle] = useState<string>("");
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const { user } = useAuth();

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        const currentCode = savedCodes.find(
          (c) => c.title === currentCodeTitle,
        );
        if (currentCode?.id) {
          onUpdate(currentCode.id, currentCodeTitle);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [code, currentCodeTitle, savedCodes, onUpdate]);

  const getActiveTheme = () => {
    if (editorSettings.theme) {
      return editorSettings.theme;
    }

    return isDarkMode
      ? editorSettings.themeDark || "vs-dark"
      : editorSettings.themeLight || "vs";
  };

  const activeTheme = getActiveTheme();

  return (
    <>
      {showSaveDialog && user?.id && (
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
          <div className="flex items-center gap-2 overflow-x-auto">
            {savedCodes.map((code) => (
              <div
                key={code.id}
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md whitespace-nowrap"
              >
                <button
                  onClick={() => onLoad(code)}
                  className="flex gap-2 items-center text-sm hover:opacity-70"
                >
                  <Code className="w-4 h-4" />
                  <span className="font-medium">{code.title}</span>
                </button>
                <button
                  onClick={() => deleteCode(code.id)}
                  className="flex items-center text-sm hover:bg-red-500 hover:text-white rounded-sm p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          {user?.id && (
            <button
              onClick={handleShow}
              className="flex gap-2 items-center text-sm hover:opacity-70 px-2 py-1"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Save</span>
            </button>
          )}
        </div>
        <div className="flex-1">
          <MonacoEditor
            value={code}
            onChange={onChange}
            language="lynx"
            theme={activeTheme}
            readOnly={editorSettings.readOnly}
            height="100%"
            options={monacoOptions}
          />
        </div>
      </div>
    </>
  );
};

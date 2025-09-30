import React from "react";
import { X } from "lucide-react";

interface SaveDialogProps {
  isDarkMode: boolean;
  saveTitle: string;
  setSaveTitle: (title: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export const SaveDialog: React.FC<SaveDialogProps> = ({
  isDarkMode,
  saveTitle,
  setSaveTitle,
  onSave,
  onClose,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
    <div
      className={`max-w-md w-full mx-4 p-6 rounded-xl ${isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"} border`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className={`${isDarkMode ? "text-white" : "text-black"} font-semibold`}
        >
          Save Code
        </h3>
        <button
          onClick={onClose}
          className={`p-1 rounded ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label
            className={`block text-sm mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
          >
            Name
          </label>
          <input
            type="text"
            value={saveTitle}
            onChange={(e) => setSaveTitle(e.target.value)}
            placeholder="Name"
            className={`w-full p-3 rounded-lg border ${
              isDarkMode
                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-black placeholder-gray-500"
            }`}
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 p-3 rounded-lg border ${
              isDarkMode
                ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!saveTitle.trim()}
            className={`flex-1 p-3 rounded-lg text-white ${
              saveTitle.trim()
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
);

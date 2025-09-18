import React from 'react';
import { X, FolderOpen, Trash2 } from "lucide-react";
import type { SavedCode } from '../types/types';

interface LoadDialogProps {
  isDarkMode: boolean;
  savedCodes: SavedCode[];
  onLoad: (code: SavedCode) => void;
  onDelete: (codeId: string) => void;
  onClose: () => void;
}

export const LoadDialog: React.FC<LoadDialogProps> = ({
  isDarkMode,
  savedCodes,
  onLoad,
  onDelete,
  onClose
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
    <div className={`max-w-2xl w-full mx-4 p-6 rounded-xl ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border max-h-[80vh]`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`${isDarkMode ? 'text-white' : 'text-black'} font-semibold`}>Ielādēt kodu</h3>
        <button onClick={onClose} className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
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
                  onClick={() => onLoad(savedCode)}
                  className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  title="Ielādēt"
                >
                  <FolderOpen className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(savedCode.id)}
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
          onClick={onClose}
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

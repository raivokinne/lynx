import React from 'react';
import { X } from "lucide-react";
import { defaultSettings } from '../types/constants';
import type { EditorSettings } from '../types/types';

interface SettingsModalProps {
  isDarkMode: boolean;
  editorSettings: EditorSettings;
  onUpdateSetting: (key: keyof EditorSettings | 'minimap', value: any) => void;
  onResetSettings: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isDarkMode,
  editorSettings,
  onUpdateSetting,
  onResetSettings,
  onClose
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
    <div className={`max-w-lg w-full mx-4 p-6 rounded-xl ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border max-h-[80vh] overflow-y-auto`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`${isDarkMode ? 'text-white' : 'text-black'} font-semibold`}>Redaktora iestatījumi</h3>
        <button onClick={onClose} className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <label className={`block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Tumšā tēma
          </label>
          <select
            value={editorSettings.themeDark || 'hc-black'}
            onChange={(e) => onUpdateSetting('themeDark', e.target.value)}
            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${isDarkMode
              ? 'bg-gray-800 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
              }`}
          >
            <option value="hc-black">High Contrast Black</option>
            <option value="vs-dark">VS Dark</option>
            <option value="monokai">Monokai</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className={`block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Gaišā tēma
          </label>
          <select
            value={editorSettings.themeLight || 'vs'}
            onChange={(e) => onUpdateSetting('themeLight', e.target.value)}
            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${isDarkMode
              ? 'bg-gray-800 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
              }`}
          >
            <option value="vs">VS Light</option>
            <option value="hc-light">High Contrast Light</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className={`block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Fonta izmērs: {editorSettings.fontSize}
          </label>
          <input
            type="range"
            min={10}
            max={36}
            value={editorSettings.fontSize || 14}
            onChange={(e) => onUpdateSetting('fontSize', Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>10px</span>
            <span>36px</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className={`block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Mini karte
          </label>
          <select
            value={editorSettings.minimap?.enabled ? 'on' : 'off'}
            onChange={(e) => onUpdateSetting('minimap', e.target.value === 'on')}
            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${isDarkMode
              ? 'bg-gray-800 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
              }`}
          >
            <option value="on">Ieslēgta</option>
            <option value="off">Izslēgta</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className={`block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Rindu numuri
          </label>
          <select
            value={editorSettings.lineNumbers || 'on'}
            onChange={(e) => onUpdateSetting('lineNumbers', e.target.value)}
            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${isDarkMode
              ? 'bg-gray-800 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
              }`}
          >
            <option value="on">Ieslēgti</option>
            <option value="off">Izslēgti</option>
            <option value="relative">Relatīvi</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className={`block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Teksta pārnešana
          </label>
          <select
            value={editorSettings.wordWrap || 'on'}
            onChange={(e) => onUpdateSetting('wordWrap', e.target.value)}
            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${isDarkMode
              ? 'bg-gray-800 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
              }`}
          >
            <option value="on">Ieslēgta</option>
            <option value="off">Izslēgta</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className={`block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Tab izmērs
          </label>
          <select
            value={editorSettings.tabSize?.toString() || '2'}
            onChange={(e) => onUpdateSetting('tabSize', Number(e.target.value))}
            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${isDarkMode
              ? 'bg-gray-800 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
              }`}
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="6">6</option>
            <option value="8">8</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className={`block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Fonta saime
          </label>
          <input
            type="text"
            value={editorSettings.fontFamily || defaultSettings.fontFamily}
            onChange={(e) => onUpdateSetting('fontFamily', e.target.value)}
            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${isDarkMode
              ? 'bg-gray-800 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
              }`}
          />
        </div>

        <div className="flex items-center space-x-3">
          <input
            id="readonly-checkbox"
            type="checkbox"
            checked={!!editorSettings.readOnly}
            onChange={(e) => onUpdateSetting('readOnly', e.target.checked)}
            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label htmlFor="readonly-checkbox" className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Tikai lasāms
          </label>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={onResetSettings}
          className={`flex-1 p-3 rounded-lg border ${isDarkMode
            ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
        >
          Atiestatīt
        </button>
        <button
          onClick={onClose}
          className="flex-1 p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Saglabāt
        </button>
      </div>
    </div>
  </div>
);

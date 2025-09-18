import { useState, useEffect } from 'react';
import { normalizeEditorSettings } from '../utils/utils';
import { defaultSettings } from '../types/constants';
import type { EditorSettings } from '../types/types';

export const useEditorSettings = () => {
  const [editorSettings, setEditorSettings] = useState<EditorSettings>(() => {
    try {
      const raw = localStorage.getItem('lynx_editor_settings');
      return raw ? normalizeEditorSettings(JSON.parse(raw)) : defaultSettings;
    } catch (e) {
      return defaultSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('lynx_editor_settings', JSON.stringify(editorSettings));
    } catch (e) {
      console.error('Failed to persist editor settings', e);
    }
  }, [editorSettings]);

  const updateSetting = (key: keyof EditorSettings | 'minimap', value: any) => {
    setEditorSettings(prev => {
      let next: any = { ...prev };

      if (key === 'minimap') {
        if (typeof value === 'boolean') {
          next.minimap = { enabled: value };
        } else if (typeof value === 'string') {
          next.minimap = { enabled: value === 'on' };
        } else {
          next.minimap = { ...(prev.minimap || {}), ...(value || {}) };
        }
      } else {
        next[key] = value;
      }

      return normalizeEditorSettings(next);
    });
  };

  const resetSettings = () => {
    setEditorSettings(normalizeEditorSettings(defaultSettings));
  };

  return {
    editorSettings,
    updateSetting,
    resetSettings
  };
};

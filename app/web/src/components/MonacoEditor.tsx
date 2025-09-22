import React, { useRef, useEffect, useState, useCallback } from 'react';

declare global {
  interface Window {
    monaco: any;
    require: any;
  }
}

interface MonacoEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  language?: string;
  theme?: 'vs' | 'vs-dark' | 'hc-black' | string;
  height?: string;
  width?: string;
  readOnly?: boolean;
  options?: any;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value = '',
  onChange,
  language = 'lynx',
  theme = 'vs-dark',
  height = '400px',
  width = '100%',
  readOnly = false,
  options = {}
}) => {
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isEditorReady, setIsEditorReady] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const initializeEditor = useCallback(() => {
    if (!containerRef.current || editorRef.current || !window.monaco) return;

    try {
      if (!window.monaco.languages.getLanguages().find((l: any) => l.id === 'lynx')) {
        window.monaco.languages.register({ id: 'lynx' });
        window.monaco.languages.setMonarchTokensProvider('lynx', {
          tokenizer: {
            root: [
              [/\/\/.*$/, 'comment'],
              [/\"(?:\\.|[^\"\\])*\"/, 'string'],
              [/\b(?:if|else|for|in|while|return|break|continue|const|let|fn|true|false)\b/, 'keyword'],
              [/\b\d+(?:\.\d+)?\b/, 'number'],
              [/[a-zA-Z_]\w*(?=\s*\()/, 'function']
            ]
          }
        });
      }

      const initialOptions = {
        value,
        language,
        theme,
        readOnly,
        automaticLayout: true,
        selectOnLineNumbers: true,
        roundedSelection: false,
        cursorStyle: 'line',
        fontSize: 14,
        lineNumbers: 'on',
        glyphMargin: true,
        folding: true,
        tabIndex: 0,
        ...options
      };

      editorRef.current = window.monaco.editor.create(containerRef.current, initialOptions);

      editorRef.current.onDidChangeModelContent(() => {
        if (onChange && editorRef.current) onChange(editorRef.current.getValue());
      });

      setTimeout(() => editorRef.current?.focus(), 100);
      setIsEditorReady(true);
    } catch (err: any) {
      console.error('Error initializing Monaco Editor:', err);
      setError(err?.message || String(err));
    }
  }, [value, language, theme, readOnly, options, onChange]);

  useEffect(() => {
    if (window.monaco) {
      initializeEditor();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js';
    script.async = true;
    script.onload = () => {
      window.require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });
      window.require(['vs/editor/editor.main'], () => initializeEditor());
    };
    script.onerror = () => setError('Failed to load Monaco Editor');

    if (!document.querySelector('script[src*="monaco-editor"]')) {
      document.head.appendChild(script);
    }

    return () => {
      if (editorRef.current) {
        try {
          editorRef.current.dispose();
        } catch (e) {
          // ignore
        }
        editorRef.current = null;
      }
    };
  }, [initializeEditor]);

  useEffect(() => {
    if (editorRef.current && isEditorReady) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== value) {
        editorRef.current.setValue(value);
      }
    }
  }, [value, isEditorReady]);

  useEffect(() => {
    if (window.monaco && isEditorReady) {
      try {
        window.monaco.editor.setTheme(theme);
      } catch (e) {
        // ignore
      }
    }
  }, [theme, isEditorReady]);

  useEffect(() => {
    if (window.monaco && isEditorReady && editorRef.current) {
      try {
        const model = editorRef.current.getModel();
        if (model) {
          window.monaco.editor.setModelLanguage(model, language);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [language, isEditorReady]);

  useEffect(() => {
    if (editorRef.current && isEditorReady) {
      try {
        editorRef.current.updateOptions({ readOnly, ...options });
      } catch (e) {
        console.warn('Failed to update editor options', e);
      }
    }
  }, [options, readOnly, isEditorReady]);

  const handleContainerClick = useCallback(() => {
    if (editorRef.current && isEditorReady) {
      editorRef.current.focus();
    }
  }, [isEditorReady]);

  if (error) {
    return (
      <div style={{ height, width }} className="flex items-center justify-center bg-red-50 border border-red-200 rounded">
        <div className="text-center text-red-600">
          <div className="font-semibold">Editor Error</div>
          <div className="text-sm mt-1">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height, width }} className="relative border border-gray-300">
      {!isEditorReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
            <div className="text-sm text-gray-600">Loading editor...</div>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        style={{ height: '100%', width: '100%' }}
        className={`${!isEditorReady ? 'invisible' : 'visible'} cursor-text`}
      />
    </div>
  );
};

export default MonacoEditor;

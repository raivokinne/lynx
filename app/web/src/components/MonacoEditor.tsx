import React, { useRef, useEffect, useState, useCallback } from "react";

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
  theme?: "vs" | "vs-dark" | "hc-black" | string;
  height?: string;
  width?: string;
  readOnly?: boolean;
  options?: any;
  customThemes?: any[];
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value = "",
  onChange,
  language = "lynx",
  theme = "vs-dark",
  height = "400px",
  width = "100%",
  readOnly = false,
  options = {},
  customThemes = [],
}) => {
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isEditorReady, setIsEditorReady] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const registeredThemesRef = useRef<Set<string>>(new Set());
  const currentThemeRef = useRef<string>(theme);

  // Force theme application with retries
  const forceApplyTheme = useCallback((themeId: string, retries = 3) => {
    if (!window.monaco || !editorRef.current || retries <= 0) return;

    try {
      console.log(
        `Attempting to apply theme: ${themeId} (retries left: ${retries})`,
      );

      // Try to set the theme
      window.monaco.editor.setTheme(themeId);

      // Force update the editor's theme
      if (editorRef.current.updateOptions) {
        editorRef.current.updateOptions({ theme: themeId });
      }

      // Trigger a layout update
      setTimeout(() => {
        if (editorRef.current && editorRef.current.layout) {
          editorRef.current.layout();
        }
      }, 50);

      currentThemeRef.current = themeId;
      console.log(`Successfully applied theme: ${themeId}`);
    } catch (error) {
      console.error(`Failed to apply theme ${themeId}:`, error);

      // Retry after a short delay
      setTimeout(() => {
        forceApplyTheme(themeId, retries - 1);
      }, 100);
    }
  }, []);

  const registerCustomTheme = useCallback((customTheme: any) => {
    if (!window.monaco || !customTheme || !customTheme.id) return false;

    // Skip if already registered
    if (registeredThemesRef.current.has(customTheme.id)) {
      console.log(`Theme ${customTheme.id} already registered`);
      return true;
    }

    try {
      // Build Monaco theme configuration
      const monacoTheme = {
        base: "vs-dark" as const,
        inherit: true,
        rules: [
          // Default rules first
          {
            token: "",
            foreground:
              customTheme.colors?.foreground?.replace("#", "") || "d4d4d4",
          },
          // Custom token rules
          ...Object.entries(customTheme.tokenColors || {}).map(
            ([tokenType, style]: [string, any]) => ({
              token: tokenType,
              foreground: style?.foreground?.replace("#", "") || "",
              background: style?.background?.replace("#", "") || "",
              fontStyle: style?.fontStyle || "",
            }),
          ),
        ],
        colors: {
          // Core editor colors
          "editor.background": customTheme.colors?.background || "#1e1e1e",
          "editor.foreground": customTheme.colors?.foreground || "#d4d4d4",
          "editor.selectionBackground":
            customTheme.colors?.selection || "#264f78",
          "editor.lineHighlightBackground":
            customTheme.colors?.lineHighlight || "#2d2d30",
          "editorCursor.foreground": customTheme.colors?.cursor || "#ffffff",
          "editorWhitespace.foreground":
            customTheme.colors?.whitespace || "#404040",

          // Line numbers and gutter
          "editorLineNumber.foreground": "#858585",
          "editorLineNumber.activeForeground": "#c6c6c6",
          "editorGutter.background":
            customTheme.colors?.background || "#1e1e1e",

          // Additional editor elements
          "editor.lineHighlightBorder": "#00000000",
          "scrollbar.shadow": "#000000",
          "editorOverviewRuler.border": "#7f7f7f4d",
          "panel.background": customTheme.colors?.background || "#1e1e1e",
          "sideBar.background": customTheme.colors?.background || "#1e1e1e",

          // Spread any additional custom colors
          ...Object.entries(customTheme.colors || {}).reduce(
            (acc, [key, value]) => {
              const monacoColorMap: Record<string, string[]> = {
                background: [
                  "editor.background",
                  "panel.background",
                  "sideBar.background",
                ],
                foreground: ["editor.foreground"],
                selection: ["editor.selectionBackground"],
                lineHighlight: ["editor.lineHighlightBackground"],
                cursor: ["editorCursor.foreground"],
                whitespace: ["editorWhitespace.foreground"],
              };

              const monacoKeys = monacoColorMap[key] || [key];
              monacoKeys.forEach((monacoKey) => {
                acc[monacoKey] = value as string;
              });
              return acc;
            },
            {} as Record<string, string>,
          ),
        },
      };

      console.log("Defining Monaco theme:", customTheme.id, monacoTheme);
      window.monaco.editor.defineTheme(customTheme.id, monacoTheme);
      registeredThemesRef.current.add(customTheme.id);

      // Handle custom CSS with better injection
      if (customTheme.css) {
        const styleId = `monaco-custom-theme-${customTheme.id}`;
        let existingStyle = document.getElementById(styleId);

        if (existingStyle) {
          existingStyle.remove();
        }

        const style = document.createElement("style");
        style.id = styleId;
        style.type = "text/css";

        // Ensure CSS is scoped to Monaco editor
        const scopedCSS = customTheme.css.replace(
          /\.monaco-editor/g,
          `.monaco-editor.${customTheme.id}, .monaco-editor`,
        );

        style.textContent = scopedCSS;
        document.head.appendChild(style);
        console.log("Injected custom CSS for theme:", customTheme.id);
      }

      return true;
    } catch (themeError) {
      console.error(
        "Failed to register custom theme:",
        customTheme.id,
        themeError,
      );
      return false;
    }
  }, []);

  const initializeEditor = useCallback(() => {
    if (!containerRef.current || editorRef.current || !window.monaco) return;

    try {
      console.log("Initializing Monaco Editor...");

      // Register Lynx language
      if (
        !window.monaco.languages
          .getLanguages()
          .find((l: any) => l.id === "lynx")
      ) {
        window.monaco.languages.register({ id: "lynx" });
        window.monaco.languages.setMonarchTokensProvider("lynx", {
          tokenizer: {
            root: [
              [/\/\/.*$/, "comment"],
              [/\/\*[\s\S]*?\*\//, "comment"],
              [/\"(?:\\.|[^\"\\])*\"/, "string"],
              [/'(?:\\.|[^'\\])*'/, "string"],
              [
                /\b(?:if|else|for|in|while|return|break|continue|const|let|fn|function|true|false|null|undefined|class|extends|var|async|await|try|catch|finally|throw|new|this|super)\b/,
                "keyword",
              ],
              [/\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/, "number"],
              [/\b0[xX][0-9a-fA-F]+\b/, "number"],
              [/[a-zA-Z_$]\w*(?=\s*\()/, "function"],
              [/[a-zA-Z_$]\w*/, "variable"],
              [/[+\-*/=<>!&|^~%]+/, "operator"],
              [/[{}()\[\],.;]/, "delimiter"],
            ],
          },
        });
      }

      // Register all custom themes first
      console.log("Registering custom themes:", customThemes);
      customThemes.forEach((customTheme) => {
        registerCustomTheme(customTheme);
      });

      const editorOptions = {
        value,
        language,
        theme: "vs-dark", // Start with built-in theme
        readOnly,
        automaticLayout: true,
        selectOnLineNumbers: true,
        roundedSelection: false,
        cursorStyle: "line",
        fontSize: 14,
        lineNumbers: "on",
        glyphMargin: true,
        folding: true,
        tabIndex: 0,
        scrollBeyondLastLine: false,
        minimap: { enabled: true },
        wordWrap: "on",
        ...options,
      };

      console.log("Creating Monaco editor with options:", editorOptions);
      editorRef.current = window.monaco.editor.create(
        containerRef.current,
        editorOptions,
      );

      // Set up change listener
      editorRef.current.onDidChangeModelContent(() => {
        if (onChange && editorRef.current) {
          const currentValue = editorRef.current.getValue();
          onChange(currentValue);
        }
      });

      setIsEditorReady(true);
      console.log("Monaco editor initialized successfully");

      // Now apply the desired theme after editor is ready
      setTimeout(() => {
        if (theme !== "vs-dark") {
          forceApplyTheme(theme);
        }
      }, 100);
    } catch (err: any) {
      console.error("Error initializing Monaco Editor:", err);
      setError(err?.message || String(err));
    }
  }, [
    value,
    language,
    readOnly,
    options,
    onChange,
    customThemes,
    registerCustomTheme,
    forceApplyTheme,
    theme,
  ]);

  // Load Monaco Editor
  useEffect(() => {
    if (window.monaco) {
      initializeEditor();
      return;
    }

    const existingScript = document.querySelector(
      'script[src*="monaco-editor"]',
    );
    if (existingScript) {
      const checkMonaco = () => {
        if (window.monaco) {
          initializeEditor();
        } else {
          setTimeout(checkMonaco, 100);
        }
      };
      checkMonaco();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js";
    script.async = true;
    script.onload = () => {
      window.require.config({
        paths: {
          vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs",
        },
      });
      window.require(["vs/editor/editor.main"], () => {
        console.log("Monaco editor loaded successfully");
        initializeEditor();
      });
    };
    script.onerror = (error) => {
      console.error("Failed to load Monaco Editor script:", error);
      setError("Failed to load Monaco Editor");
    };

    document.head.appendChild(script);

    return () => {
      if (editorRef.current) {
        try {
          editorRef.current.dispose();
        } catch (e) {
          console.warn("Error disposing editor:", e);
        }
        editorRef.current = null;
      }
    };
  }, [initializeEditor]);

  // Handle theme changes
  useEffect(() => {
    if (!isEditorReady || currentThemeRef.current === theme) return;

    console.log("Theme change detected:", currentThemeRef.current, "->", theme);

    // If it's a custom theme, ensure it's registered first
    if (customThemes.length > 0) {
      const customTheme = customThemes.find((t) => t.id === theme);
      if (customTheme && !registeredThemesRef.current.has(customTheme.id)) {
        console.log(
          "Registering custom theme before applying:",
          customTheme.id,
        );
        registerCustomTheme(customTheme);
      }
    }

    // Apply the theme with retries
    setTimeout(() => forceApplyTheme(theme), 50);
  }, [
    theme,
    isEditorReady,
    customThemes,
    registerCustomTheme,
    forceApplyTheme,
  ]);

  // Re-register custom themes when they change
  useEffect(() => {
    if (!window.monaco || !isEditorReady) return;

    console.log("Custom themes updated, re-registering...");
    customThemes.forEach((customTheme) => {
      // Force re-registration by removing from cache
      registeredThemesRef.current.delete(customTheme.id);
      registerCustomTheme(customTheme);
    });

    // Re-apply current theme if it's a custom theme
    const currentCustomTheme = customThemes.find((t) => t.id === theme);
    if (currentCustomTheme) {
      setTimeout(() => forceApplyTheme(theme), 100);
    }
  }, [
    customThemes,
    isEditorReady,
    registerCustomTheme,
    theme,
    forceApplyTheme,
  ]);

  // Update editor value
  useEffect(() => {
    if (editorRef.current && isEditorReady) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== value) {
        const position = editorRef.current.getPosition();
        editorRef.current.setValue(value);
        if (position) {
          editorRef.current.setPosition(position);
        }
      }
    }
  }, [value, isEditorReady]);

  // Update language
  useEffect(() => {
    if (window.monaco && isEditorReady && editorRef.current) {
      try {
        const model = editorRef.current.getModel();
        if (model) {
          window.monaco.editor.setModelLanguage(model, language);
        }
      } catch (e) {
        console.warn("Failed to set language:", language, e);
      }
    }
  }, [language, isEditorReady]);

  // Update options
  useEffect(() => {
    if (editorRef.current && isEditorReady) {
      try {
        editorRef.current.updateOptions({
          readOnly,
          ...options,
        });
      } catch (e) {
        console.warn("Failed to update editor options:", e);
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
      <div
        style={{ height, width }}
        className="flex items-center justify-center bg-red-50 border border-red-200 rounded"
      >
        <div className="text-center text-red-600">
          <div className="font-semibold">Editor Error</div>
          <div className="text-sm mt-1">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ height, width }}
      className="relative border border-gray-300 rounded overflow-hidden"
    >
      {!isEditorReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
            <div className="text-sm text-gray-600">
              Loading Monaco Editor...
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Preparing custom themes...
            </div>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        style={{ height: "100%", width: "100%" }}
        className={`${!isEditorReady ? "invisible" : "visible"} cursor-text`}
      />
    </div>
  );
};

export default MonacoEditor;

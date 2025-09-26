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
}) => {
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isEditorReady, setIsEditorReady] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const registerLynxLanguage = useCallback(() => {
    if (
      !window.monaco ||
      window.monaco.languages.getLanguages().find((l: any) => l.id === "lynx")
    ) {
      return;
    }

    // Register the language
    window.monaco.languages.register({ id: "lynx" });

    // Enhanced syntax highlighting configuration
    window.monaco.languages.setMonarchTokensProvider("lynx", {
      // Define token types
      keywords: [
        "if",
        "else",
        "while",
        "for",
        "in",
        "break",
        "continue",
        "return",
        "fn",
        "let",
        "const",
        "true",
        "false",
        "null",
        "@",
        "error",
        "catch",
        "switch",
        "case",
        "default",
        "and",
        "or",
      ],

      typeKeywords: [
        "string",
        "number",
        "boolean",
        "function",
        "int",
        "float",
        "str",
      ],

      operators: [
        "=",
        ">",
        "<",
        "!",
        "~",
        "?",
        ":",
        "==",
        "<=",
        ">=",
        "!=",
        "++",
        "--",
        "+",
        "-",
        "*",
        "/",
        "&",
        "^",
        "%",
        "$",
      ],

      // Symbols for bracket matching
      symbols: /[=><!~?:&|+\-*\/\^%]+/,
      escapes:
        /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
      digits: /\d+(_+\d+)*/,
      octaldigits: /[0-7]+(_+[0-7]+)*/,
      binarydigits: /[0-1]+(_+[0-1]+)*/,
      hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,

      tokenizer: {
        root: [
          // Identifiers and keywords
          [
            /[a-zA-Z_$][\w$]*/,
            {
              cases: {
                "@typeKeywords": "type",
                "@keywords": "keyword",
                "@default": "identifier",
              },
            },
          ],

          // Function definitions
          [/fn\s+([a-zA-Z_$][\w$]*)/, ["keyword", "function"]],

          // Function calls
          [/[a-zA-Z_$][\w$]*(?=\s*\()/, "function"],

          // Class names (capitalized identifiers)
          [/[A-Z][\w$]*/, "type"],

          // Whitespace
          { include: "@whitespace" },

          // Numbers
          [/(@digits)[eE]([\-+]?(@digits))?[fFdD]?/, "number.float"],
          [/(@digits)\.(@digits)([eE][\-+]?(@digits))?[fFdD]?/, "number.float"],
          [/0[xX](@hexdigits)[Ll]?/, "number.hex"],
          [/0[oO]?(@octaldigits)[Ll]?/, "number.octal"],
          [/0[bB](@binarydigits)[Ll]?/, "number.binary"],
          [/(@digits)[fFdD]/, "number.float"],
          [/(@digits)[lL]?/, "number"],

          // Delimiter brackets
          [/[{}()\[\]]/, "@brackets"],
          [/[<>](?!@symbols)/, "@brackets"],
          [
            /@symbols/,
            {
              cases: {
                "@operators": "delimiter",
                "@default": "",
              },
            },
          ],

          // Strings
          [/"([^"\\]|\\.)*$/, "string.invalid"], // non-terminated string
          [/'([^'\\]|\\.)*$/, "string.invalid"], // non-terminated string
          [/"/, "string", "@string_double"],
          [/'/, "string", "@string_single"],
          [/`/, "string", "@string_backtick"],

          // Regular expressions
          [
            /\/(?=([^\/\\\[]|\\.|\[([^\]\\]|\\.)*\])+\/([gimsuy]*)(\s*)(\.|;|\/|,|\)|\]|\}|$))/,
            "regexp",
            "@regexp",
          ],

          // Delimiters and operators
          [/[;,.]/, "delimiter"],
        ],

        whitespace: [
          [/[ \t\r\n]+/, ""],
          [/\/\*\*(?!\/)/, "comment.doc", "@doccomment"],
          [/\/\*/, "comment", "@comment"],
          [/\/\/.*$/, "comment"],
        ],

        comment: [
          [/[^\/*]+/, "comment"],
          [/\*\//, "comment", "@pop"],
          [/[\/*]/, "comment"],
        ],

        doccomment: [
          [/[^\/*]+/, "comment.doc"],
          [/\*\//, "comment.doc", "@pop"],
          [/[\/*]/, "comment.doc"],
        ],

        string_double: [
          [/[^\\"]+/, "string"],
          [/@escapes/, "string.escape"],
          [/\\./, "string.escape.invalid"],
          [/"/, "string", "@pop"],
        ],

        string_single: [
          [/[^\\']+/, "string"],
          [/@escapes/, "string.escape"],
          [/\\./, "string.escape.invalid"],
          [/'/, "string", "@pop"],
        ],

        string_backtick: [
          [/\$\{/, { token: "delimiter.bracket", next: "@bracketCounting" }],
          [/[^\\`$]+/, "string"],
          [/@escapes/, "string.escape"],
          [/\\./, "string.escape.invalid"],
          [/`/, "string", "@pop"],
        ],

        bracketCounting: [
          [/\{/, "delimiter.bracket", "@bracketCounting"],
          [/\}/, "delimiter.bracket", "@pop"],
          { include: "root" },
        ],

        regexp: [
          [
            /(\{)(\d+(?:,\d*)?)(\})/,
            [
              "regexp.escape.control",
              "regexp.escape.control",
              "regexp.escape.control",
            ],
          ],
          [
            /(\[)(\^?)(?=(?:[^\]\\]|\\.)+)/,
            [
              "regexp.escape.control",
              { token: "regexp.escape.control", next: "@regexrange" },
            ],
          ],
          [
            /(\()(\?:|\?=|\?!)/,
            ["regexp.escape.control", "regexp.escape.control"],
          ],
          [/[()]/, "regexp.escape.control"],
          [/@escapes/, "regexp.escape"],
          [/\\$/, "regexp"],
          [
            /\/([gimsuy]*)/,
            { token: "regexp", bracket: "@close", next: "@pop" },
          ],
        ],

        regexrange: [
          [/-/, "regexp.escape.control"],
          [/\^/, "regexp.invalid"],
          [/@escapes/, "regexp.escape"],
          [/[^\]]/, "regexp"],
          [
            /\]/,
            { token: "regexp.escape.control", next: "@pop", bracket: "@close" },
          ],
        ],
      },
    });

    // Auto-completion configuration
    window.monaco.languages.registerCompletionItemProvider("lynx", {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [
          // Keywords
          ...[
            "if",
            "else",
            "while",
            "for",
            "in",
            "break",
            "continue",
            "return",
            "fn",
            "let",
            "const",
          ].map((keyword) => ({
            label: keyword,
            kind: window.monaco.languages.CompletionItemKind.Keyword,
            insertText: keyword,
            range: range,
          })),

          // Common functions
          {
            label: "function",
            kind: window.monaco.languages.CompletionItemKind.Snippet,
            insertText: "let ${1:name} = fn (${2:params}) {\n\t${3:return}\n}",
            insertTextRules:
              window.monaco.languages.CompletionItemInsertTextRule
                .InsertAsSnippet,
            range: range,
          },
          {
            label: "if statement",
            kind: window.monaco.languages.CompletionItemKind.Snippet,
            insertText: "if ${1:condition} {\n\t${2:// body}\n}",
            insertTextRules:
              window.monaco.languages.CompletionItemInsertTextRule
                .InsertAsSnippet,
            range: range,
          },
          {
            label: "for loop",
            kind: window.monaco.languages.CompletionItemKind.Snippet,
            insertText: "for ${1:item} in ${2:items} {\n\t${3:// body}\n}",
            insertTextRules:
              window.monaco.languages.CompletionItemInsertTextRule
                .InsertAsSnippet,
            range: range,
          },
        ];

        return { suggestions: suggestions };
      },
    });

    // Bracket matching configuration
    window.monaco.languages.setLanguageConfiguration("lynx", {
      brackets: [
        ["{", "}"],
        ["[", "]"],
        ["(", ")"],
        ["<", ">"],
      ],
      autoClosingPairs: [
        { open: "{", close: "}" },
        { open: "[", close: "]" },
        { open: "(", close: ")" },
        { open: '"', close: '"', notIn: ["string"] },
        { open: "'", close: "'", notIn: ["string", "comment"] },
        { open: "`", close: "`", notIn: ["string", "comment"] },
        { open: "/*", close: " */", notIn: ["string"] },
      ],
      surroundingPairs: [
        { open: "{", close: "}" },
        { open: "[", close: "]" },
        { open: "(", close: ")" },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
        { open: "`", close: "`" },
      ],
      folding: {
        markers: {
          start: new RegExp("^\\s*//\\s*#?region\\b"),
          end: new RegExp("^\\s*//\\s*#?endregion\\b"),
        },
      },
      comments: {
        lineComment: "//",
        blockComment: ["/*", "*/"],
      },
      indentationRules: {
        increaseIndentPattern: new RegExp(
          "^((?!\\/\\/).)*(\\{[^}\"'`]*|\\([^)\"'`]*|\\[[^\\]\"'`]*)$",
        ),
        decreaseIndentPattern: new RegExp(
          "^((?!.*?\\/\\*).*\\*/)?\\s*[\\}\\]].*$",
        ),
      },
    });

    console.log("Lynx language registered with enhanced features");
  }, []);

  const initializeEditor = useCallback(() => {
    if (!containerRef.current || editorRef.current || !window.monaco) return;

    try {
      // Register language first
      registerLynxLanguage();

      const initialOptions = {
        value,
        language,
        theme,
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

        // Enhanced editor features
        autoClosingBrackets: "always",
        autoClosingQuotes: "always",
        autoSurround: "languageDefined",
        bracketPairColorization: { enabled: true },
        guides: {
          bracketPairs: true,
          bracketPairsHorizontal: true,
          highlightActiveBracketPair: true,
          indentation: true,
        },
        suggest: {
          enableSnippets: true,
          showKeywords: true,
          showSnippets: true,
          showFunctions: true,
          showConstructors: true,
          showFields: true,
          showVariables: true,
          showClasses: true,
          showModules: true,
          showProperties: true,
          showMethods: true,
        },
        quickSuggestions: {
          other: true,
          comments: false,
          strings: false,
        },
        parameterHints: { enabled: true },
        wordBasedSuggestions: true,
        semanticHighlighting: { enabled: true },
        occurrencesHighlight: true,
        selectionHighlight: true,
        codeLens: true,
        colorDecorators: true,

        // Indentation and formatting
        insertSpaces: true,
        tabSize: 2,
        detectIndentation: true,
        trimAutoWhitespace: true,

        ...options,
      };

      editorRef.current = window.monaco.editor.create(
        containerRef.current,
        initialOptions,
      );

      // Add change listener
      editorRef.current.onDidChangeModelContent(() => {
        if (onChange && editorRef.current) {
          onChange(editorRef.current.getValue());
        }
      });

      // Add keyboard shortcuts
      editorRef.current.addCommand(
        window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.Slash,
        () => {
          editorRef.current.trigger(
            "keyboard",
            "editor.action.commentLine",
            null,
          );
        },
      );

      setTimeout(() => editorRef.current?.focus(), 100);
      setIsEditorReady(true);
    } catch (err: any) {
      console.error("Error initializing Monaco Editor:", err);
      setError(err?.message || String(err));
    }
  }, [
    value,
    language,
    theme,
    readOnly,
    options,
    onChange,
    registerLynxLanguage,
  ]);

  useEffect(() => {
    if (window.monaco) {
      initializeEditor();
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
      window.require(["vs/editor/editor.main"], () => initializeEditor());
    };
    script.onerror = () => setError("Failed to load Monaco Editor");

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
        console.warn("Failed to set theme:", e);
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
        console.warn("Failed to set language:", e);
      }
    }
  }, [language, isEditorReady]);

  useEffect(() => {
    if (editorRef.current && isEditorReady) {
      try {
        editorRef.current.updateOptions({ readOnly, ...options });
      } catch (e) {
        console.warn("Failed to update editor options", e);
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
        style={{ height: "100%", width: "100%" }}
        className={`${!isEditorReady ? "invisible" : "visible"} cursor-text`}
      />
    </div>
  );
};

export default MonacoEditor;

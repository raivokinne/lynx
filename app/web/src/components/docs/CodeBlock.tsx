import { useEffect, useRef } from "react";

interface CodeBlockProps {
  children: string;
  language?: string;
  highlight?: string;
  filename?: string;
  isDarkMode: boolean;
}

export const CodeBlock = ({
  children,
  language = "javascript",
  highlight = "",
  filename = "",
  isDarkMode,
}: CodeBlockProps) => {
  const codeRef = useRef<HTMLElement>(null);
  const scriptsLoadedRef = useRef(false);

  useEffect(() => {
    const loadPrism = async () => {
      if (scriptsLoadedRef.current) {
        if (codeRef.current && window.Prism) {
          window.Prism.highlightElement(codeRef.current);
        }
        return;
      }

      const prismScript = document.createElement("script");
      prismScript.src =
        "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js";
      document.head.appendChild(prismScript);

      await new Promise((resolve) => {
        prismScript.onload = resolve;
      });

      const languages = [
        "javascript",
        "typescript",
        "jsx",
        "tsx",
        "python",
        "css",
        "json",
      ];

      for (const lang of languages) {
        const script = document.createElement("script");
        script.src = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${lang}.min.js`;
        document.head.appendChild(script);
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Define custom language after Prism is loaded
      if (window.Prism) {
        window.Prism.languages.custom = {
          comment: [
            {
              pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
              lookbehind: true,
              greedy: true,
            },
            {
              pattern: /(^|[^\\:])\/\/.*/,
              lookbehind: true,
              greedy: true,
            },
          ],
          string: {
            pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
            greedy: true,
          },
          keyword:
            /\b(?:if|else|while|for|return|function|const|let|var|class|import|export|default|async|await|try|catch|throw|new|this|super|extends|implements|interface|type|enum|namespace|module|declare|public|private|protected|static|readonly|abstract|as|from|of|in|is|typeof|instanceof|void|null|undefined|true|false|break|continue|do|switch|case|default)\b/,
          boolean: /\b(?:true|false)\b/,
          number: /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
          operator: /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
          punctuation: /[{}[\];(),.:]/,
          function: /\b\w+(?=\()/,
          "class-name": {
            pattern:
              /(\b(?:class|interface|extends|implements|instanceof|new)\s+)[\w$]+/,
            lookbehind: true,
          },
        };
      }

      scriptsLoadedRef.current = true;

      if (codeRef.current && window.Prism) {
        window.Prism.highlightElement(codeRef.current);
      }
    };

    loadPrism();
  }, []);

  useEffect(() => {
    if (codeRef.current && window.Prism && scriptsLoadedRef.current) {
      window.Prism.highlightElement(codeRef.current);
    }
  }, [children, language, isDarkMode]);

  const highlightSearchTerms = (html: string, query: string) => {
    if (!query.trim()) return html;
    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    return html.replace(
      regex,
      '<mark class="bg-yellow-300 text-black px-0.5 rounded">$1</mark>',
    );
  };

  useEffect(() => {
    if (codeRef.current && highlight) {
      const originalHTML = codeRef.current.innerHTML;
      codeRef.current.innerHTML = highlightSearchTerms(originalHTML, highlight);
    }
  }, [highlight]);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = isDarkMode
      ? "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css"
      : "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css";
    link.rel = "stylesheet";
    link.id = "prism-theme";

    const existingLink = document.getElementById("prism-theme");
    if (existingLink) {
      existingLink.remove();
    }

    document.head.appendChild(link);

    return () => {
      link.remove();
    };
  }, [isDarkMode]);

  return (
    <div
      className={`border rounded-lg overflow-hidden ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
    >
      {filename && (
        <div
          className={`px-4 py-2 text-xs font-mono border-b flex items-center ${
            isDarkMode
              ? "bg-gray-800 border-gray-700 text-gray-400"
              : "bg-gray-50 border-gray-200 text-gray-600"
          }`}
        >
          <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
          {filename}
        </div>
      )}
      <pre
        className={`${isDarkMode ? "bg-gray-900" : "bg-gray-50"} p-4 overflow-x-auto text-sm m-0`}
      >
        <code
          ref={codeRef}
          className={`language-${language} ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}
        >
          {children}
        </code>
      </pre>
    </div>
  );
};

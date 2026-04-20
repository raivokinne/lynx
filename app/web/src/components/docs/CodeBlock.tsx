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

      const languages = ["javascript"];

      for (const lang of languages) {
        const script = document.createElement("script");
        script.src = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${lang}.min.js`;
        document.head.appendChild(script);
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

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
    <div className="border rounded-sm overflow-hidden">
      {filename && (
        <div className="px-3 py-1.5 text-xs font-mono flex items-center gap-2 bg-neutral-800 border-b border-neutral-700 text-neutral-400">
          <span className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          </span>
          <span className="ml-1">{filename}</span>
        </div>
      )}
<pre
				className={`${isDarkMode ? "bg-[#0a0a0a]" : "bg-neutral-50"} p-5 overflow-x-auto text-sm m-0 font-mono min-h-[100px] leading-7 tracking-wide`}
			>
				<code
					ref={codeRef}
					className={`language-${language} ${isDarkMode ? "text-amber-300 font-light" : "text-neutral-800 font-normal"}`}
				>
					{children}
				</code>
			</pre>
    </div>
  );
};

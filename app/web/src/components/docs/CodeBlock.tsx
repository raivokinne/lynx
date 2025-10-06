interface CodeBlockProps {
  children: string;
  language?: string;
  highlight?: string;
  filename?: string;
  isDarkMode: boolean;
}

export const CodeBlock = ({
  children,
  language = "lynx",
  highlight = "",
  filename = "",
  isDarkMode,
}: CodeBlockProps) => {
  const highlightCode = (code: string, query: string) => {
    if (!query.trim()) return code;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    return code.replace(
      regex,
      '<mark class="bg-yellow-300 text-black">$1</mark>',
    );
  };

  return (
    <div
      className={`border rounded-lg overflow-hidden ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
    >
      {filename && (
        <div
          className={`px-4 py-2 text-xs font-mono border-b ${
            isDarkMode
              ? "bg-gray-800 border-gray-700 text-gray-400"
              : "bg-gray-50 border-gray-200 text-gray-600"
          }`}
        >
          {filename}
        </div>
      )}
      <pre
        className={`${isDarkMode ? "bg-black" : "bg-white"} p-4 overflow-x-auto text-sm font-mono`}
      >
        <code
          className={`language-${language} ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
          dangerouslySetInnerHTML={{
            __html: highlightCode(children, highlight),
          }}
        />
      </pre>
    </div>
  );
};

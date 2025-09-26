import type { CompletionItem } from "../types/monaco";

const LYNX_KEYWORDS = [
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
];

export const createCompletionProvider = () => ({
  provideCompletionItems: (model: any, position: any) => {
    const word = model.getWordUntilPosition(position);
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn,
    };

    const keywordSuggestions: CompletionItem[] = LYNX_KEYWORDS.map(
      (keyword) => ({
        label: keyword,
        kind: window.monaco.languages.CompletionItemKind.Keyword,
        insertText: keyword,
        range: range,
      }),
    );

    const snippetSuggestions: CompletionItem[] = [
      {
        label: "function",
        kind: window.monaco.languages.CompletionItemKind.Snippet,
        insertText: "let ${1:name} = fn (${2:params}) {\n\t${3:return}\n}",
        insertTextRules:
          window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      {
        label: "if statement",
        kind: window.monaco.languages.CompletionItemKind.Snippet,
        insertText: "if ${1:condition} {\n\t${2:// body}\n}",
        insertTextRules:
          window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      {
        label: "for loop",
        kind: window.monaco.languages.CompletionItemKind.Snippet,
        insertText: "for ${1:item} in ${2:items} {\n\t${3:// body}\n}",
        insertTextRules:
          window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
    ];

    return {
      suggestions: [...keywordSuggestions, ...snippetSuggestions],
    };
  },
});

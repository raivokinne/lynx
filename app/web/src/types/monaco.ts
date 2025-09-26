declare global {
  interface Window {
    monaco: any;
    require: any;
  }
}

export interface MonacoEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  language?: string;
  theme?: "vs" | "vs-dark" | "hc-black" | string;
  height?: string;
  width?: string;
  readOnly?: boolean;
  options?: any;
}

export interface CompletionItem {
  label: string;
  kind: any;
  insertText: string;
  insertTextRules?: any;
  range: any;
}

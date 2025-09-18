export interface SavedCode {
  id: string;
  title: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export type EditorSettings = {
  themeDark: string;
  themeLight: string;
  fontSize: number;
  minimap: { enabled: boolean };
  lineNumbers: string;
  wordWrap: string;
  tabSize: number;
  fontFamily: string;
  readOnly: boolean;
};

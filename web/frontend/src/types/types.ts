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

export interface User {
  id: string;
  username: string;
}

export interface AuthContextType {
  user: User | null;
  login: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    username: string,
    password: string,
    confirmPassword: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

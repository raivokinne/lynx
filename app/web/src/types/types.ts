export interface SavedCode {
  id: string;
  title: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface EditorSettings {
  theme?: string;
  themeDark?: string;
  themeLight?: string;
  customThemes?: CustomTheme[];
  fontSize?: number;
  minimap?: { enabled: boolean };
  lineNumbers?: "on" | "off" | "relative" | "interval";
  wordWrap?: "on" | "off" | "wordWrapColumn" | "bounded";
  tabSize?: number;
  fontFamily?: string;
  readOnly?: boolean;
}

export interface CustomTheme {
  id: string;
  name: string;
  css?: string;
  colors: {
    background?: string;
    foreground?: string;
    selection?: string;
    lineHighlight?: string;
    cursor?: string;
    whitespace?: string;
  };
  tokenColors: {
    [tokenType: string]: {
      foreground?: string;
      background?: string;
      fontStyle?: string;
    };
  };
  createdAt: string;
  updatedAt?: string;
}

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

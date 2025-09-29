import { createContext } from "react";

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (languageCode: string) => void;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

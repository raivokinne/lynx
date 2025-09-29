import { useState, useEffect, type ReactNode } from "react";
import { DEFAULT_LANGUAGE } from "../data/languages";
import { LanguageContext } from "../contexts/LanguageContext";

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const stored = localStorage.getItem("lynx-docs-language");
    return stored || DEFAULT_LANGUAGE;
  });

  const changeLanguage = (languageCode: string) => {
    setCurrentLanguage(languageCode);
    localStorage.setItem("lynx-docs-language", languageCode);
  };

  useEffect(() => {
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

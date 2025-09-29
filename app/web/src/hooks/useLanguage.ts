import { LanguageContext } from "../contexts/LanguageContext";
import { useContext } from "react";

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};

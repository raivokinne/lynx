import { useCallback } from "react";
import { translations } from "../data/translations";
import { useLanguage } from "./useLanguage";

export const useTranslation = () => {
  const { currentLanguage } = useLanguage();

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const translation = translations[key];
      if (!translation) {
        return fallback || key;
      }
      return translation[currentLanguage] || translation.en || fallback || key;
    },
    [currentLanguage],
  );

  return { t, currentLanguage };
};

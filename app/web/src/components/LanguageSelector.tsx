import { ChevronDown, Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { SUPPORTED_LANGUAGES } from "../data/languages";
import { useLanguage } from "../hooks/useLanguage";
import { useTranslation } from "../hooks/useTranslation";

interface LanguageSelectorProps {
  isDarkMode: boolean;
}

export const LanguageSelector = ({ isDarkMode }: LanguageSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentLanguage, changeLanguage } = useLanguage();
  const { t } = useTranslation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLanguage = SUPPORTED_LANGUAGES.find(
    (lang) => lang.code === currentLanguage,
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
          isDarkMode
            ? "bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            : "bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
        }`}
        aria-label={t("language.select")}
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm">
          {selectedLanguage?.flag} {selectedLanguage?.nativeName}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full left-0 mt-1 min-w-full bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-50 ${
            isDarkMode ? "border-gray-600" : "border-gray-300"
          }`}
        >
          <div className="py-1">
            {SUPPORTED_LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => {
                  changeLanguage(language.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                  currentLanguage === language.code
                    ? isDarkMode
                      ? "bg-gray-700 text-white"
                      : "bg-gray-100 text-gray-900"
                    : isDarkMode
                      ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <div>
                  <div className="font-medium">{language.nativeName}</div>
                  <div
                    className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {language.name}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

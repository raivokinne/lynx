import { useTranslation } from "../../hooks/useTranslation";
import { CodeBlock } from "./CodeBlock";
import { languageComparisons } from "../../data/comparisons";

interface ComparisonsSectionProps {
  isDarkMode: boolean;
  selectedLanguages: string[];
  availableLanguages: string[];
  onLanguageToggle: (lang: string) => void;
}

export const ComparisonsSection = ({
  isDarkMode,
  selectedLanguages,
  availableLanguages,
  onLanguageToggle,
}: ComparisonsSectionProps) => {
  const { t } = useTranslation();

  const getComparisonTitle = (key: string) => {
    const titles: Record<string, string> = {
      "Fibonacci Sequence": t("comparisons.fibonacci"),
      "Array Processing": t("comparisons.arrayProcessing"),
      "Pattern Matching": t("comparisons.patternMatching"),
    };
    return titles[key] || key;
  };

  const getComparisonDescription = (key: string) => {
    const descriptions: Record<string, string> = {
      "Implementing the Fibonacci sequence": t("comparisons.fibonacci.desc"),
      "Filtering and transforming arrays": t(
        "comparisons.arrayProcessing.desc",
      ),
      "Using pattern matching for control flow": t(
        "comparisons.patternMatching.desc",
      ),
    };
    return descriptions[key] || key;
  };

  return (
    <div className="w-full">
      <div>
        <h2 className="text-sm font-mono mb-2 text-neutral-300">
          {t("comparisons.title")}
        </h2>
        <p className="text-xs font-mono mb-3 text-neutral-500">
          {t("comparisons.description")}
        </p>
      </div>

      <div className="mb-3">
        <h3 className="text-xs font-mono mb-2 text-neutral-400">
          {t("comparisons.selectLanguages")}
        </h3>
        <div className="flex flex-wrap gap-1">
          {availableLanguages.map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageToggle(lang)}
              className={`px-2 py-0.5 border text-xs font-mono transition-colors ${
                selectedLanguages.includes(lang)
                  ? isDarkMode
                    ? "bg-neutral-700 border-neutral-500 text-neutral-200"
                    : "bg-neutral-300 border-neutral-400 text-neutral-800"
                  : isDarkMode
                    ? "bg-black border-neutral-700 text-neutral-500 hover:border-neutral-500"
                    : "bg-white border-neutral-300 text-neutral-600 hover:border-neutral-400"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {languageComparisons.map((comparison, index) => (
          <div
            key={index}
            className={`border p-3 ${
              isDarkMode
                ? "border-neutral-700 bg-black"
                : "border-neutral-300:bg-neutral-100"
            }`}
          >
            <h3 className="text-xs font-mono mb-1 text-neutral-300">
              {getComparisonTitle(comparison.title)}
            </h3>
            <p
              className={`mb-2 text-xs font-mono ${isDarkMode ? "text-neutral-500" : "text-neutral-600"}`}
            >
              {getComparisonDescription(comparison.description)}
            </p>

            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns:
                  selectedLanguages.length === 1
                    ? "repeat(auto-fit, minmax(280px, 1fr))"
                    : selectedLanguages.length === 2
                      ? "repeat(2, 1fr)"
                      : "repeat(auto-fit, minmax(200px, 1fr))",
              }}
            >
              {selectedLanguages.map((langCode) => {
                const example = comparison.examples[langCode];
                if (!example) return null;

                return (
                  <div key={langCode}>
                    <div
                      className={`flex items-center gap-1 mb-1 px-1 py-0.5 text-xs font-mono ${
                        isDarkMode
                          ? "bg-neutral-900 text-neutral-500"
                          : "bg-white text-neutral-600"
                      }`}
                    >
                      {langCode}
                    </div>
                    <CodeBlock
                      language={example.language}
                      filename={example.filename}
                      isDarkMode={isDarkMode}
                    >
                      {example.code}
                    </CodeBlock>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

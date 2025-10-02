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

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-4">{t("comparisons.title")}</h2>
                <p className="text-lg mb-6">{t("comparisons.description")}</p>
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                    {t("comparisons.selectLanguages")}
                </h3>
                <div className="flex flex-wrap gap-2">
                    {availableLanguages.map((lang) => (
                        <button
                            key={lang}
                            onClick={() => onLanguageToggle(lang)}
                            className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors capitalize ${selectedLanguages.includes(lang)
                                ? isDarkMode
                                    ? "bg-blue-600 border-blue-500 text-white"
                                    : "bg-blue-500 border-blue-500 text-white"
                                : isDarkMode
                                    ? "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            {lang}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-8">
                {languageComparisons.map((comparison, index) => (
                    <div
                        key={index}
                        className={`border rounded-lg p-6 ${isDarkMode
                            ? "border-gray-700 bg-gray-900"
                            : "border-gray-200 bg-gray-50"
                            }`}
                    >
                        <h3 className="text-xl font-bold mb-2">{comparison.title}</h3>
                        <p
                            className={`mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                        >
                            {comparison.description}
                        </p>

                        <div
                            className="grid gap-4"
                            style={{
                                gridTemplateColumns:
                                    selectedLanguages.length === 1
                                        ? "1fr"
                                        : selectedLanguages.length === 2
                                            ? "repeat(2, 1fr)"
                                            : "repeat(auto-fit, minmax(300px, 1fr))",
                            }}
                        >
                            {selectedLanguages.map((langCode) => {
                                const example = comparison.examples[langCode];
                                if (!example) return null;

                                return (
                                    <div key={langCode}>
                                        <div
                                            className={`flex items-center gap-2 mb-2 p-2 rounded ${isDarkMode ? "bg-gray-800" : "bg-white"
                                                }`}
                                        >
                                            <h4 className="font-semibold capitalize">{langCode}</h4>
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


import { X } from "lucide-react";
import { useState, useMemo } from "react";
import { Book, Package, Shield, Code, Languages } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";
import { LanguageSelector } from "./LanguageSelector";
import { SearchBar } from "./docs/SearchBar";
import { NavigationSidebar } from "./docs/NavigationSidebar";
import { SearchResults } from "./docs/SearchResults";
import { OverviewSection } from "./docs/OverviewSection";
import { LanguageSection } from "./docs/LanguageSection";
import { StdLibSection } from "./docs/StdLibSection";
import { ExamplesSection } from "./docs/ExamplesSection";
import { ComparisonsSection } from "./docs/ComparisonsSection";
import { useSearchableContent } from "../hooks/useSearchableContent";

interface DocsModalProps {
    isDarkMode: boolean;
    onClose: () => void;
}

export const DocsModal = ({ isDarkMode, onClose }: DocsModalProps) => {
    const [activeSection, setActiveSection] = useState("overview");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedComparisonLanguages, setSelectedComparisonLanguages] =
        useState<string[]>(["lynx", "javascript"]);
    const { t } = useTranslation();

    const sections = useMemo(
        () => [
            { id: "overview", title: t("nav.overview"), icon: Book },
            { id: "language", title: t("nav.language"), icon: Package },
            { id: "stdlib", title: t("nav.stdlib"), icon: Shield },
            { id: "examples", title: t("nav.examples"), icon: Code },
            { id: "comparisons", title: t("nav.comparisons"), icon: Languages },
        ],
        [t],
    );

    const availableComparisonLanguages = [
        "lynx",
        "javascript",
        "python",
        "go",
        "rust",
    ];

    const searchableContent = useSearchableContent(t);

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return {};

        const query = searchQuery.toLowerCase();
        const results = searchableContent.filter((item) =>
            item.content.toLowerCase().includes(query),
        );

        const groupedResults = results.reduce(
            (acc, result) => {
                if (!acc[result.section]) acc[result.section] = [];
                if (acc[result.section].length < 5) {
                    acc[result.section].push(result);
                }
                return acc;
            },
            {} as Record<string, typeof searchableContent>,
        );

        return groupedResults;
    }, [searchQuery, searchableContent]);

    const handleSectionChange = (sectionId: string) => {
        setActiveSection(sectionId);
        setSearchQuery("");
    };

    const handleLanguageToggle = (lang: string) => {
        if (selectedComparisonLanguages.includes(lang)) {
            if (selectedComparisonLanguages.length > 1) {
                setSelectedComparisonLanguages(
                    selectedComparisonLanguages.filter((l) => l !== lang),
                );
            }
        } else {
            setSelectedComparisonLanguages([...selectedComparisonLanguages, lang]);
        }
    };

    const renderContent = () => {
        if (searchQuery.trim()) {
            return (
                <SearchResults
                    searchQuery={searchQuery}
                    searchResults={searchResults}
                    sections={sections}
                    isDarkMode={isDarkMode}
                    onSectionClick={handleSectionChange}
                    noResultsText={t("search.noResults")}
                    tryDifferentText={t("search.tryDifferent")}
                    resultsTitle={t("search.results")}
                />
            );
        }

        switch (activeSection) {
            case "overview":
                return <OverviewSection isDarkMode={isDarkMode} />;
            case "language":
                return <LanguageSection isDarkMode={isDarkMode} />;
            case "stdlib":
                return <StdLibSection isDarkMode={isDarkMode} />;
            case "examples":
                return <ExamplesSection isDarkMode={isDarkMode} />;
            case "comparisons":
                return (
                    <ComparisonsSection
                        isDarkMode={isDarkMode}
                        selectedLanguages={selectedComparisonLanguages}
                        availableLanguages={availableComparisonLanguages}
                        onLanguageToggle={handleLanguageToggle}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div
                className={`w-full mx-4 h-[90vh] rounded-xl ${isDarkMode ? "bg-black border-gray-700" : "bg-white border-gray-200"
                    } border flex overflow-hidden`}
            >
                <div
                    className={`w-64 ${isDarkMode ? "bg-black border-gray-700" : "bg-white border-gray-200"
                        } border-r flex-shrink-0 flex flex-col`}
                >
                    <div
                        className={`p-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-xl font-bold">{t("docs.title")}</h1>
                            <button
                                onClick={onClose}
                                className={`p-1 rounded transition-colors ${isDarkMode
                                    ? "hover:bg-gray-700 text-gray-300 hover:text-white"
                                    : "hover:bg-gray-200 text-gray-600 hover:text-black"
                                    }`}
                                aria-label={t("common.close")}
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <LanguageSelector isDarkMode={isDarkMode} />
                        </div>

                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            isDarkMode={isDarkMode}
                            placeholder={t("search.placeholder")}
                            clearLabel={t("search.clear")}
                        />
                    </div>

                    <NavigationSidebar
                        sections={sections}
                        activeSection={activeSection}
                        onSectionChange={handleSectionChange}
                        isDarkMode={isDarkMode}
                        searchQuery={searchQuery}
                    />
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="p-6">{renderContent()}</div>
                </div>
            </div>
        </div>
    );
};

export default DocsModal;

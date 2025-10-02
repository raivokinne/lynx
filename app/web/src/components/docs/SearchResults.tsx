import { Search, Video as LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface Section {
    id: string;
    title: string;
    icon: LucideIcon;
}

interface SearchResult {
    section: string;
    sectionTitle: string;
    content: string;
    type: "heading" | "text" | "code";
}

interface SearchResultsProps {
    searchQuery: string;
    searchResults: Record<string, SearchResult[]>;
    sections: Section[];
    isDarkMode: boolean;
    onSectionClick: (sectionId: string) => void;
    noResultsText: string;
    tryDifferentText: string;
    resultsTitle: string;
}

export const SearchResults = ({
    searchQuery,
    searchResults,
    sections,
    isDarkMode,
    onSectionClick,
    noResultsText,
    tryDifferentText,
    resultsTitle,
}: SearchResultsProps) => {
    const highlightText = (text: string, query: string): ReactNode => {
        if (!query.trim()) return text;

        const regex = new RegExp(
            `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
            "gi",
        );
        const parts = text.split(regex);

        return parts.map((part, index) =>
            regex.test(part) ? (
                <mark key={index} className="bg-yellow-300 text-black">
                    {part}
                </mark>
            ) : (
                part
            ),
        );
    };

    if (!searchQuery.trim()) return null;

    const hasResults = Object.keys(searchResults).length > 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{resultsTitle}</h2>
            </div>

            {!hasResults ? (
                <div
                    className={`text-center py-8 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm mt-2">{tryDifferentText}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(searchResults).map(([sectionId, results]) => {
                        const section = sections.find((s) => s.id === sectionId);
                        const SectionIcon = section?.icon || Search;

                        return (
                            <div
                                key={sectionId}
                                className={`border rounded-lg p-4 ${isDarkMode
                                    ? "border-gray-700 bg-gray-900"
                                    : "border-gray-200 bg-gray-50"
                                    }`}
                            >
                                <button
                                    onClick={() => onSectionClick(sectionId)}
                                    className={`flex items-center gap-2 mb-3 text-lg font-semibold hover:underline ${isDarkMode
                                        ? "text-blue-400 hover:text-blue-300"
                                        : "text-blue-600 hover:text-blue-800"
                                        }`}
                                >
                                    <SectionIcon className="w-5 h-5" />
                                    {section?.title}
                                </button>

                                <div className="space-y-2">
                                    {results.map((result, index) => (
                                        <div
                                            key={index}
                                            className={`p-3 rounded border-l-2 ${result.type === "heading"
                                                ? isDarkMode
                                                    ? "border-blue-500 bg-gray-800"
                                                    : "border-blue-500 bg-blue-50"
                                                : result.type === "code"
                                                    ? isDarkMode
                                                        ? "border-green-500 bg-gray-800"
                                                        : "border-green-500 bg-green-50"
                                                    : isDarkMode
                                                        ? "border-gray-600 bg-gray-800"
                                                        : "border-gray-300 bg-white"
                                                }`}
                                        >
                                            <div
                                                className={`text-sm font-mono ${result.type === "heading"
                                                    ? "font-bold"
                                                    : result.type === "code"
                                                        ? "font-mono text-xs"
                                                        : ""
                                                    }`}
                                            >
                                                {result.type === "code" ? (
                                                    <pre className="whitespace-pre-wrap">
                                                        {highlightText(
                                                            result.content.slice(0, 200) +
                                                            (result.content.length > 200 ? "..." : ""),
                                                            searchQuery,
                                                        )}
                                                    </pre>
                                                ) : (
                                                    highlightText(
                                                        result.content.slice(0, 200) +
                                                        (result.content.length > 200 ? "..." : ""),
                                                        searchQuery,
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};


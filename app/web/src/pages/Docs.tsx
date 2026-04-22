import { useState, useMemo } from "react";
import {
  Wrench,
  Book,
  Package,
  Shield,
  Code,
  Languages,
  Github,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";
import { LanguageSelector } from "../components/LanguageSelector";
import { SearchBar } from "../components/docs/SearchBar";
import { NavigationSidebar } from "../components/docs/NavigationSidebar";
import { SearchResults } from "../components/docs/SearchResults";
import { OverviewSection } from "../components/docs/OverviewSection";
import { LanguageSection } from "../components/docs/LanguageSection";
import { StdLibSection } from "../components/docs/StdLibSection";
import { ExamplesSection } from "../components/docs/ExamplesSection";
import { ComparisonsSection } from "../components/docs/ComparisonsSection";
import { BuiltinsSection } from "../components/docs/BuiltinsSection";
import { useSearchableContent } from "../hooks/useSearchableContent";

export const Docs: React.FC = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComparisonLanguages, setSelectedComparisonLanguages] =
    useState<string[]>(["lynx", "javascript"]);
  const { t } = useTranslation();

  const sections = useMemo(
    () => [
      { id: "overview", title: t("nav.overview"), icon: Book },
      { id: "language", title: t("nav.language"), icon: Package },
      { id: "builtins", title: "Built-ins", icon: Wrench },
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
          isDarkMode={true}
          onSectionClick={handleSectionChange}
          noResultsText={t("search.noResults")}
          tryDifferentText={t("search.tryDifferent")}
          resultsTitle={t("search.results")}
        />
      );
    }

    switch (activeSection) {
      case "overview":
        return <OverviewSection isDarkMode={true} />;
      case "language":
        return <LanguageSection isDarkMode={true} />;
      case "builtins":
        return <BuiltinsSection isDarkMode={true} />;
      case "stdlib":
        return <StdLibSection isDarkMode={true} />;
      case "examples":
        return <ExamplesSection isDarkMode={true} />;
      case "comparisons":
        return (
          <ComparisonsSection
            isDarkMode={true}
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
		<div className="min-h-screen bg-black text-neutral-300 font-mono">
			<header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-neutral-800">
				<div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Link to="/" className="flex items-center gap-2 hover:text-white transition-colors">
							<img src="/logo.png" alt="logo" className="w-5 h-5" />
							<span className="text-sm font-bold">lynx</span>
						</Link>
						<Link
							to="/editor"
							className="text-xs hover:text-white transition-colors"
						>
							editor
						</Link>
					</div>
					<div className="flex items-center gap-4 text-xs">
						<a
							href="https://github.com/raivokinne/lynx"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-white transition-colors flex items-center gap-1"
						>
							<Github className="w-3 h-3" />
							github
						</a>
					</div>
				</div>
			</header>

			<div className="pt-12 flex h-[calc(100vh-3rem)]">
				<aside className="w-56 bg-black border-r border-neutral-800 flex flex-col overflow-hidden">
					<div className="p-3 border-b border-neutral-800 shrink-0">
						<div className="mb-3">
							<LanguageSelector isDarkMode={true} />
						</div>

            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              isDarkMode={true}
              placeholder={t("search.placeholder")}
              clearLabel={t("search.clear")}
            />
          </div>

          <NavigationSidebar
            sections={sections}
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            isDarkMode={true}
            searchQuery={searchQuery}
          />
        </aside>

				<main className="flex-1 overflow-y-auto">
					<div className="p-6">{renderContent()}</div>
				</main>
			</div>
		</div>
	);
};

export default Docs;

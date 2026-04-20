import { Search, Video as LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface Section {
	id: string;
	title: string;
	icon: typeof LucideIcon;
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
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xs font-mono text-neutral-400">{resultsTitle}</h2>
			</div>

			{!hasResults ? (
				<div
					className={`text-center py-4 ${isDarkMode ? "text-neutral-600" : "text-neutral-400"}`}
				>
					<p className="text-xs font-mono">{tryDifferentText}</p>
				</div>
			) : (
				<div className="space-y-3">
					{Object.entries(searchResults).map(
						([sectionId, results]) => {
							const section = sections.find(
								(s) => s.id === sectionId,
							);
							const SectionIcon = section?.icon || Search;

							return (
								<div
									key={sectionId}
									className={`border p-2 ${isDarkMode
											? "border-neutral-700 bg-black"
											: "border-neutral-300 bg-neutral-100"
										}`}
								>
									<button
										onClick={() =>
											onSectionClick(sectionId)
										}
										className={`flex items-center gap-1 mb-2 text-xs font-mono hover:underline ${isDarkMode
												? "text-neutral-400 hover:text-neutral-300"
												: "text-neutral-600 hover:text-neutral-700"
											}`}
									>
										<SectionIcon className="w-3 h-3" />
										{section?.title.toLowerCase()}
									</button>

									<div className="space-y-1">
										{results.map((result, index) => (
											<div
												key={index}
												className={`p-1.5 text-xs font-mono ${result.type === "heading"
														? isDarkMode
															? "border-l-2 border-neutral-500 bg-neutral-900"
															: "border-l-2 border-neutral-400 bg-neutral-200"
														: result.type === "code"
															? isDarkMode
																? "border-l-2 border-green-700 bg-neutral-900"
																: "border-l-2 border-green-300 bg-neutral-200"
															: isDarkMode
																? "border-l-2 border-neutral-600 bg-neutral-900"
																: "border-l-2 border-neutral-300 bg-neutral-200"
													}`}
											>
												{result.type === "code" ? (
												<pre className="whitespace-pre-wrap text-xs">
													{highlightText(
														result.content.slice(
															0,
									150,
														) +
														(result
															.content
															.length >
															150
															? "..."
															: ""),
														searchQuery,
													)}
												</pre>
											) : (
												<span className="text-xs">
													{highlightText(
														result.content.slice(
															0,
									150,
														) +
													(result.content
														.length >
														150
														? "..."
														: ""),
													searchQuery,
												)}
												</span>
											)}
											</div>
										))}
									</div>
								</div>
							);
						},
					)}
				</div>
			)}
		</div>
	);
};

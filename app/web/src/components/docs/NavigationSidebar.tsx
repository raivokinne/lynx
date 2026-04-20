import { Video as LucideIcon } from "lucide-react";

interface Section {
	id: string;
	title: string;
	icon: typeof LucideIcon;
}

interface NavigationSidebarProps {
	sections: Section[];
	activeSection: string;
	onSectionChange: (sectionId: string) => void;
	isDarkMode: boolean;
	searchQuery: string;
}

export const NavigationSidebar = ({
	sections,
	activeSection,
	onSectionChange,
	isDarkMode,
	searchQuery,
}: NavigationSidebarProps) => {
	return (
		<nav className="px-2 pb-3 flex-1">
			<ul className="space-y-px">
				{sections.map((section) => {
					const Icon = section.icon;
					return (
						<li key={section.id}>
							<button
								onClick={() => onSectionChange(section.id)}
								className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs font-mono text-left transition-colors ${activeSection === section.id && !searchQuery
										? isDarkMode
											? "bg-neutral-800 text-neutral-200"
											: "bg-neutral-200 text-neutral-800"
										: isDarkMode
											? "text-neutral-500 hover:bg-neutral-800 hover:text-neutral-400"
											: "text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700"
									}`}
							>
								<Icon className="w-3 h-3" />
								{section.title.toLowerCase()}
							</button>
						</li>
					);
				})}
			</ul>
		</nav>
	);
};

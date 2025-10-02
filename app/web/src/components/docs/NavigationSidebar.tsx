import { Video as LucideIcon } from "lucide-react";

interface Section {
    id: string;
    title: string;
    icon: LucideIcon;
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
        <nav className="p-4 flex-1">
            <ul className="space-y-2">
                {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                        <li key={section.id}>
                            <button
                                onClick={() => onSectionChange(section.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeSection === section.id && !searchQuery
                                        ? isDarkMode
                                            ? "bg-gray-700 text-white"
                                            : "bg-gray-200 text-black"
                                        : isDarkMode
                                            ? "text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {section.title}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};


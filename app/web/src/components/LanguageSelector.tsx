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
				className={`flex items-center gap-1 px-2 py-1 border transition-colors text-xs font-mono ${isDarkMode
						? "bg-black border-neutral-700 text-neutral-400 hover:bg-neutral-800"
						: "bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100"
					}`}
				aria-label={t("language.select")}
			>
				<Globe className="w-3 h-3" />
				<span className="text-xs">
					{selectedLanguage?.flag} {selectedLanguage?.nativeName}
				</span>
				<ChevronDown
					className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
				/>
			</button>

			{isOpen && (
				<div
					className={`absolute top-full left-0 mt-px min-w-full border z-50 ${isDarkMode ? "bg-neutral-900 border-neutral-700" : "bg-neutral-100 border-neutral-300"
						}`}
				>
					<div>
						{SUPPORTED_LANGUAGES.map((language) => (
							<button
								key={language.code}
								onClick={() => {
									changeLanguage(language.code);
									setIsOpen(false);
								}}
								className={`w-full flex items-center gap-2 px-2 py-1 text-left transition-colors text-xs font-mono ${currentLanguage === language.code
										? isDarkMode
											? "bg-neutral-800 text-neutral-200"
											: "bg-neutral-200 text-neutral-800"
										: isDarkMode
											? "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
											: "text-neutral-600 hover:bg-neutral-200 hover:text-neutral-800"
									}`}
							>
								<span>{language.flag}</span>
								<span>{language.nativeName}</span>
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

import { Search, X } from "lucide-react";

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
	isDarkMode: boolean;
	placeholder: string;
	clearLabel: string;
}

export const SearchBar = ({
	value,
	onChange,
	isDarkMode,
	placeholder,
	clearLabel,
}: SearchBarProps) => {
	return (
		<div className="relative">
			<Search
				className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 ${isDarkMode ? "text-neutral-600" : "text-neutral-400"
					}`}
			/>
			<input
				type="text"
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className={`w-full pl-7 pr-6 py-1 text-xs font-mono border transition-colors ${isDarkMode
					? "bg-black border-neutral-700 text-neutral-400 placeholder-neutral-600 focus:border-neutral-500"
					: "bg-white border-neutral-300 text-neutral-700 placeholder-neutral-400 focus:border-neutral-400"
					}`}
			/>
			{value && (
				<button
					onClick={() => onChange("")}
					className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-0.5 transition-colors ${isDarkMode
						? "hover:bg-neutral-800 text-neutral-500"
						: "hover:bg-neutral-200 text-neutral-400"
						}`}
					aria-label={clearLabel}
				>
					<X className="w-2.5 h-2.5" />
				</button>
			)}
		</div>
	);
};

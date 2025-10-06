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
        className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
          isDarkMode ? "text-gray-400" : "text-gray-500"
        }`}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm border transition-colors ${
          isDarkMode
            ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500 focus:bg-gray-700"
            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-400 focus:bg-gray-50"
        }`}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded transition-colors ${
            isDarkMode
              ? "hover:bg-gray-600 text-gray-400 hover:text-white"
              : "hover:bg-gray-200 text-gray-500 hover:text-black"
          }`}
          aria-label={clearLabel}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

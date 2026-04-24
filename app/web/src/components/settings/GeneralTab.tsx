import { Monitor, Info } from "lucide-react";
import { Toggle } from "../ui/Form";
import { showToast } from "../../utils/toast";

interface GeneralTabProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const GeneralTab = ({ isDarkMode, onToggleTheme }: GeneralTabProps) => {
  const handleToggle = () => {
    onToggleTheme();
    showToast.success("Settings saved");
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3
          className={`text-xs font-mono mb-3 flex items-center gap-2 ${
            isDarkMode ? "text-neutral-400" : "text-neutral-600"
          }`}
        >
          <Monitor className="w-3 h-3" />
          appearance
        </h3>
        <div
          className={`p-3 border ${
            isDarkMode ? "border-neutral-700 bg-black" : "border-neutral-300 bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-mono ${
                isDarkMode ? "text-neutral-400" : "text-neutral-600"
              }`}
            >
              theme mode
            </span>
            <Toggle
              isChecked={isDarkMode}
              onChange={handleToggle}
              isDarkMode={isDarkMode}
              labels={{ on: "dark", off: "light" }}
            />
          </div>
        </div>
      </div>

      <div>
        <h3
          className={`text-xs font-mono mb-3 flex items-center gap-2 ${
            isDarkMode ? "text-neutral-400" : "text-neutral-600"
          }`}
        >
          <Info className="w-3 h-3" />
          about
        </h3>
        <div
          className={`p-3 border ${
            isDarkMode ? "border-neutral-700 bg-black" : "border-neutral-300 bg-white"
          }`}
        >
          <div className="flex justify-between">
            <span
              className={`text-xs font-mono ${
                isDarkMode ? "text-neutral-500" : "text-neutral-500"
              }`}
            >
              version
            </span>
            <span
              className={`text-xs font-mono ${
                isDarkMode ? "text-neutral-400" : "text-neutral-700"
              }`}
            >
              1.0.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
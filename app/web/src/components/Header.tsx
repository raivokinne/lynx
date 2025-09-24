import React from "react";
import { Code, Sun, Moon, User, LogOut } from "lucide-react";

interface HeaderProps {
    isDarkMode: boolean;
    username?: string;
    onToggleTheme: () => void;
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    isDarkMode,
    username,
    onToggleTheme,
    onLogout,
}) => (
    <header
        className={`${isDarkMode ? "bg-black border-gray-700" : "bg-white border-gray-200"} border-b`}
    >
        <div className="max-w-full px-2 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button
                    onClick={onToggleTheme}
                    className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
                >
                    {isDarkMode ? (
                        <Sun className="w-4 h-4" />
                    ) : (
                        <Moon className="w-4 h-4" />
                    )}
                </button>
                <div
                    className={`flex items-center gap-2 px-3 py-1.5 ${isDarkMode ? "bg-gray-900" : "bg-gray-100"} rounded-lg`}
                >
                    <User className="w-4 h-4" />
                    <span className="text-sm">{username}</span>
                </div>
                <button
                    onClick={onLogout}
                    className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg ${isDarkMode ? "border-gray-700 hover:bg-gray-800" : "border-gray-300 hover:bg-gray-50"}`}
                >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Iziet</span>
                </button>
            </div>
        </div>
    </header>
);

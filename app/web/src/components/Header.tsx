import React from "react";
import { User, LogOut } from "lucide-react";
import { useNavigate } from "react-router";

interface HeaderProps {
  isDarkMode: boolean;
  username?: string;
  onToggleTheme: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  username,
  onLogout,
}) => {
  const navigate = useNavigate();
  const onLogin = () => {
    navigate("/login");
  };
  const onRegister = () => {
    navigate("/register");
  };
  return (
    <header
      className={`${isDarkMode ? "bg-black border-gray-700" : "bg-white border-gray-200"} border-b`}
    >
      {username ? (
        <div className="max-w-full px-2 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
              <span className="text-sm">Log out</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-full px-2 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onLogin}
              className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg ${isDarkMode ? "border-gray-700 hover:bg-gray-800" : "border-gray-300 hover:bg-gray-50"}`}
            >
              <span className="text-sm">Login</span>
            </button>
            <button
              onClick={onRegister}
              className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg ${isDarkMode ? "border-gray-700 hover:bg-gray-800" : "border-gray-300 hover:bg-gray-50"}`}
            >
              <span className="text-sm">Register</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

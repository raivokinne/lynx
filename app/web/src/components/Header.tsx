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
			className={`${isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-neutral-200 border-neutral-300"} border-b`}
		>
			{username ? (
				<div className="max-w-full px-3 py-1.5 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div
							className={`flex items-center gap-2 px-2 py-0.5 ${isDarkMode ? "bg-black" : "bg-neutral-300"}`}
						>
							<img
								src="/logo.png"
								className="w-4 h-4"
								alt="logo"
							/>
							<span className="text-xs font-mono">lynx</span>
						</div>
						<div
							className={`flex items-center gap-2 px-2 py-0.5 text-xs ${isDarkMode ? "bg-black text-neutral-400" : "bg-neutral-300 text-neutral-600"}`}
						>
							<User className="w-3 h-3" />
							<span className="text-xs font-mono">{username}</span>
						</div>
						<button
							onClick={onLogout}
							className={`flex items-center gap-1 px-2 py-0.5 text-xs font-mono ${isDarkMode ? "hover:bg-neutral-800 text-neutral-400" : "hover:bg-neutral-300 text-neutral-600"}`}
						>
							<LogOut className="w-3 h-3" />
							<span className="text-xs">logout</span>
						</button>
					</div>
				</div>
			) : (
				<div className="max-w-full px-3 py-1.5 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div
							className={`flex items-center gap-2 px-2 py-0.5 ${isDarkMode ? "bg-black" : "bg-neutral-300"}`}
						>
							<img
								src="/logo.png"
								className="w-4 h-4"
								alt="logo"
							/>
							<span className="text-xs font-mono">lynx</span>
						</div>
						<button
							onClick={onLogin}
							className={`flex items-center gap-1 px-2 py-0.5 text-xs font-mono ${isDarkMode ? "hover:bg-neutral-800 text-neutral-400" : "hover:bg-neutral-300 text-neutral-600"}`}
						>
							<span className="text-xs">login</span>
						</button>
						<button
							onClick={onRegister}
							className={`flex items-center gap-1 px-2 py-0.5 text-xs font-mono ${isDarkMode ? "hover:bg-neutral-800 text-neutral-400" : "hover:bg-neutral-300 text-neutral-600"}`}
						>
							<span className="text-xs">register</span>
						</button>
					</div>
				</div>
			)}
		</header>
	);
};

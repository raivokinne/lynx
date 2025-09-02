import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
	id: string;
	username: string;
}

interface AuthContextType {
	user: User | null;
	login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
	register: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
	logout: () => void;
	isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (token) {
			// Decode token to get user info (basic implementation)
			try {
				const payload = JSON.parse(atob(token.split('.')[1]));
				if (payload.exp * 1000 > Date.now()) {
					setUser({ id: payload.id, username: payload.username });
				} else {
					localStorage.removeItem('token');
				}
			} catch (error) {
				localStorage.removeItem('token');
			}
		}
		setIsLoading(false);
	}, []);

	const login = async (username: string, password: string) => {
		try {
			const response = await fetch('http://localhost:3001/api/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, password }),
			});

			const data = await response.json();

			if (data.success) {
				localStorage.setItem('token', data.token);
				const payload = JSON.parse(atob(data.token.split('.')[1]));
				setUser({ id: payload.id, username: payload.username });
				return { success: true };
			} else {
				return { success: false, error: data.error };
			}
		} catch (error) {
			return { success: false, error: 'Network error. Please try again.' };
		}
	};

	const register = async (username: string, password: string) => {
		try {
			const response = await fetch('http://localhost:3001/api/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, password }),
			});

			const data = await response.json();

			if (data.success) {
				return { success: true };
			} else {
				return { success: false, error: data.error };
			}
		} catch (error) {
			return { success: false, error: 'Network error. Please try again.' };
		}
	};

	const logout = () => {
		localStorage.removeItem('token');
		setUser(null);
	};

	const value = {
		user,
		login,
		register,
		logout,
		isLoading,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

import { useEffect, useState } from "react";
import type { User } from "../types/types";
import { AuthContext } from "../contexts/AuthContext";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                if (payload.exp * 1000 > Date.now()) {
                    setUser({ id: payload.id, username: payload.username });
                } else {
                    localStorage.removeItem("token");
                }
            } catch (error) {
                localStorage.removeItem("token");
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem("token", data.token);
                const payload = JSON.parse(atob(data.token.split(".")[1]));
                setUser({ id: payload.id, username: payload.username });
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: "Network error. Please try again." };
        }
    };

    const register = async (
        username: string,
        password: string,
        confirmPassword: string,
    ) => {
        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password, confirmPassword }),
            });

            const data = await response.json();

            if (data.success) {
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: "Network error. Please try again." };
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        window.location.reload()
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

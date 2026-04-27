import { useEffect, useState } from "react";
import type { User } from "../types/types";
import { AuthContext } from "../contexts/AuthContext";
import { API_BASE } from "../types/constants";

// Auth context provider for login, register, logout
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/profile`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUser({
              id: data.user.id,
              username: data.user.username,
            });
          }
        }
      } catch {
        // Not authenticated
      }
      setIsLoading(false);
    };

    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => initAuth(), { timeout: 2000 });
    } else {
      setTimeout(initAuth, 100);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser({
          id: data.user.id,
          username: data.user.username,
        });
        await fetch(`${API_BASE}/execution/cooldown`, {
          method: "DELETE",
          credentials: "include",
        });
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error || "Login failed",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: "Network error. Please try again.",
      };
    }
  };

  const register = async (
    username: string,
    password: string,
    confirmPassword: string,
  ) => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password, confirmPassword }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser({
          id: data.user.id,
          username: data.user.username,
        });
        await fetch(`${API_BASE}/execution/cooldown`, {
          method: "DELETE",
          credentials: "include",
        });
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error || "Registration failed",
        };
      }
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        error: "Network error. Please try again.",
      };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore errors
    }

    setUser(null);

    window.location.href = "/";
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

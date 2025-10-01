import { useEffect, useState } from "react";
import type { User } from "../types/types";
import { AuthContext } from "../contexts/AuthContext";
import { API_BASE } from "../types/constants";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));

          if (payload.exp * 1000 > Date.now()) {
            const response = await fetch(`${API_BASE}/auth/profile`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success) {
                setUser({
                  id: data.user.id,
                  username: data.user.username,
                });
              } else {
                localStorage.removeItem("token");
              }
            } else {
              localStorage.removeItem("token");
            }
          } else {
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          localStorage.removeItem("token");
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        setUser({
          id: data.user.id,
          username: data.user.username,
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
        body: JSON.stringify({ username, password, confirmPassword }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.token) {
          localStorage.setItem("token", data.token);
          setUser({
            id: data.user.id,
            username: data.user.username,
          });
        }
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error || "Registration failed",
        };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: "Network error. Please try again.",
      };
    }
  };

  const logout = async () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }

    localStorage.removeItem("token");
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

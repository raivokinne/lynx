import React, { useState } from "react";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Link, useLocation, Navigate } from "react-router";

export default function Login() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { login, user } = useAuth();
    const location = useLocation();

    if (user) {
        const from = location.state?.from?.pathname || "/";
        return <Navigate to={from} replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const result = await login(formData.username, formData.password);

        if (!result.success) {
            setError(result.error || "Login failed");
        }

        setIsLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (error) setError("");
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-black border-2 p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Laipni lūdzam atpakaļ
                        </h1>
                    </div>

                    <div className="space-y-6">
                        {error && (
                            <div className="flex items-center gap-2 p-4 bg-red-900/50 border border-red-500 rounded text-red-300 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-white"
                            >
                                Lietotājvārds
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={formData.username}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-white rounded focus:outline-none focus:ring-2 focus:ring-gray-500 bg-black text-white placeholder:text-gray-400"
                                placeholder="Ievadiet savu lietotājvārdu"
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-white"
                            >
                                Parole
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 pr-12 border-2 border-white rounded focus:outline-none focus:ring-2 focus:ring-gray-500 bg-black text-white placeholder:text-gray-400"
                                    placeholder="Ievadiet savu paroli"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full bg-white hover:bg-gray-200 disabled:bg-gray-600 text-black font-medium py-3 px-4 rounded border-2 border-white transition-colors duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                                    Pieteicos...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" />
                                    Pieteikties
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-gray-300">
                            Nav konta?{" "}
                            <Link
                                to="/register"
                                className="text-white hover:text-gray-300 font-medium transition-colors underline cursor-pointer"
                            >
                                Reģistrēties
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

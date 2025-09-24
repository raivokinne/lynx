import React, { useState } from "react";
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router";

export default function Register() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const result = await register(
            formData.username,
            formData.password,
            formData.confirmPassword,
        );

        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.error || "Reģistrācija neizdevās");
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

    if (success) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-black border-2 border-white rounded-lg shadow-lg p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-6">
                            <CheckCircle className="w-8 h-8 text-black" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-4">
                            Konts izveidots!
                        </h1>
                        <p className="text-gray-300 mb-8">
                            Jūsu konts ir veiksmīgi izveidots.
                        </p>
                        <Link
                            to="/login"
                            className="w-full bg-white hover:bg-gray-200 text-black font-medium py-3 px-4 rounded border-2 border-white transition-colors duration-200"
                        >
                            Pieteikties kontā
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-black border-2 p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Izveidot kontu
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
                                placeholder="Izvēlieties lietotājvārdu"
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
                                    placeholder="Izveidojiet paroli"
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

                        <div className="space-y-2">
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-white"
                            >
                                Apstipriniet paroli
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 pr-12 border-2 border-white rounded focus:outline-none focus:ring-2 focus:ring-gray-500 bg-black text-white placeholder:text-gray-400"
                                    placeholder="Apstipriniet savu paroli"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showConfirmPassword ? (
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
                                    Izveido kontu...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4" />
                                    Izveidot kontu
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-gray-300">
                            Jau ir konts?{" "}
                            <Link
                                to="/login"
                                className="text-white hover:text-gray-300 font-medium transition-colors underline cursor-pointer"
                            >
                                Pieteikties
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

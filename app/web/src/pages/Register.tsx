import {
  useState,
  type ChangeEventHandler,
  type MouseEventHandler,
} from "react";
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router";

// Registration page component
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

  const handleSubmit: MouseEventHandler<HTMLButtonElement> = async (e) => {
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
      setError(result.error || "Registration failed");
    }

    setIsLoading(false);
  };

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
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
        <div className="max-w-sm w-full">
          <div className="bg-neutral-900 border border-neutral-700 p-6 text-center">
            <div className="mb-4">
              <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
            </div>
            <h1 className="text-sm font-mono text-neutral-300 mb-2">
              account created
            </h1>
            <p className="text-xs font-mono text-neutral-500 mb-4">
              account ready. sign in to continue.
            </p>
            <Link
              to="/login"
              className="w-full bg-neutral-700 hover:bg-neutral-600 text-neutral-200 font-mono py-1.5 px-3 transition-colors text-xs block text-center"
            >
              sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <div className="bg-neutral-900 border border-neutral-700 p-6">
          <div className="text-center mb-6">
            <h1 className="text-sm font-mono text-neutral-300 mb-1">
              create account
            </h1>
            <p className="text-xs font-mono text-neutral-500">
              sign up to begin
            </p>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-2 border border-red-900 text-red-500 text-xs font-mono">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label
                htmlFor="username"
                className="block text-xs font-mono text-neutral-500"
              >
                username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-2 py-1.5 bg-black border border-neutral-700 focus:border-neutral-500 text-neutral-300 text-xs font-mono placeholder:text-neutral-600"
                placeholder="username"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="password"
                className="block text-xs font-mono text-neutral-500"
              >
                password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 pr-8 bg-black border border-neutral-700 focus:border-neutral-500 text-neutral-300 text-xs font-mono placeholder:text-neutral-600"
                  placeholder="password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-mono text-neutral-500"
              >
                confirm
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 pr-8 bg-black border border-neutral-700 focus:border-neutral-500 text-neutral-300 text-xs font-mono placeholder:text-neutral-600"
                  placeholder="confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 text-neutral-200 font-mono py-1.5 px-3 transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border border-neutral-300 border-t-transparent"></div>
                  <span>creating...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3 h-3" />
                  sign up
                </>
              )}
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-neutral-500 text-xs font-mono">
              have account?{" "}
              <Link
                to="/login"
                className="text-neutral-400 hover:text-neutral-300 transition-colors cursor-pointer"
              >
                sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

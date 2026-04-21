import {
  useState,
  type ChangeEventHandler,
  type MouseEventHandler,
} from "react";
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
    const from = location.state?.from?.pathname || "/editor";
    return <Navigate to={from} replace />;
  }
  
  const handleSubmit: MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await login(formData.username, formData.password);

    if (!result.success) {
      setError(result.error || "Login failed");
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

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <div className="bg-neutral-900 border border-neutral-700 p-6">
          <div className="text-center mb-6">
            <h1 className="text-sm font-mono text-neutral-300 mb-1">
              lynx ide
            </h1>
            <p className="text-xs font-mono text-neutral-500">
              sign in to continue
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

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 text-neutral-200 font-mono py-1.5 px-3 transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border border-neutral-300 border-t-transparent"></div>
                  <span>signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3 h-3" />
                  sign in
                </>
              )}
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-neutral-500 text-xs font-mono">
              no account?{" "}
              <Link
                to="/register"
                className="text-neutral-400 hover:text-neutral-300 transition-colors cursor-pointer"
              >
                register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

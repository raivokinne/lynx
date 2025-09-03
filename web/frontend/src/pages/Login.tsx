import React, { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
	const [formData, setFormData] = useState({
		username: '',
		password: '',
	});
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const { login, user } = useAuth();
	const location = useLocation();

	if (user) {
		const from = location.state?.from?.pathname || '/';
		return <Navigate to={from} replace />;
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError('');

		const result = await login(formData.username, formData.password);

		if (!result.success) {
			setError(result.error || 'Login failed');
		}

		setIsLoading(false);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value,
		}));
		if (error) setError('');
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
			<div className="max-w-md w-full">
				<div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/10">
					<div className="text-center mb-8">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4">
							<LogIn className="w-8 h-8 text-black" />
						</div>
						<h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
						<p className="text-gray-300">Please sign in to your account</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-6">
						{error && (
							<div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm backdrop-blur-sm">
								<AlertCircle className="w-4 h-4 flex-shrink-0" />
								{error}
							</div>
						)}

						<div className="space-y-1">
							<label htmlFor="username" className="block text-sm font-medium text-gray-200">
								Username
							</label>
							<input
								id="username"
								name="username"
								type="text"
								required
								value={formData.username}
								onChange={handleInputChange}
								className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all duration-200 bg-white/5 focus:bg-white/10 text-white placeholder:text-gray-400"
								placeholder="Enter your username"
							/>
						</div>

						<div className="space-y-1">
							<label htmlFor="password" className="block text-sm font-medium text-gray-200">
								Password
							</label>
							<div className="relative">
								<input
									id="password"
									name="password"
									type={showPassword ? 'text' : 'password'}
									required
									value={formData.password}
									onChange={handleInputChange}
									className="w-full px-4 py-3 pr-12 border border-white/20 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all duration-200 bg-white/5 focus:bg-white/10 text-white placeholder:text-gray-400"
									placeholder="Enter your password"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
								>
									{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
								</button>
							</div>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-400 text-black font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							{isLoading ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
									Signing in...
								</>
							) : (
								<>
									<LogIn className="w-4 h-4" />
									Sign in
								</>
							)}
						</button>
					</form>

					<div className="mt-8 text-center">
						<p className="text-gray-300">
							Don't have an account?{' '}
							<Link
								to="/register"
								className="text-white hover:text-gray-200 font-medium transition-colors underline decoration-white/30 hover:decoration-white/60"
							>
								Sign up
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

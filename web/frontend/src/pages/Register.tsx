import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

export default function Register() {
	const [formData, setFormData] = useState({
		username: '',
		password: '',
		confirmPassword: '',
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const { register, user } = useAuth();

	if (user) {
		return <Navigate to="/" replace />;
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError('');

		const result = await register(formData.username, formData.password, formData.confirmPassword);

		if (result.success) {
			setSuccess(true);
		} else {
			setError(result.error || 'Registration failed');
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

	if (success) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
				<div className="max-w-md w-full">
					<div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/10 text-center">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4">
							<CheckCircle className="w-8 h-8 text-black" />
						</div>
						<h1 className="text-3xl font-bold text-white mb-2">Account Created!</h1>
						<p className="text-gray-300 mb-6">Your account has been successfully created.</p>
						<Link
							to="/login"
							className="w-full bg-white hover:bg-gray-100 text-black font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] inline-block"
						>
							Sign in to your account
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
			<div className="max-w-md w-full">
				<div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/10">
					<div className="text-center mb-8">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4">
							<UserPlus className="w-8 h-8 text-black" />
						</div>
						<h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
						<p className="text-gray-300">Join us today and get started</p>
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
								placeholder="Choose a username"
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
									placeholder="Create a password"
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

						<div className="space-y-1">
							<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200">
								Confirm Password
							</label>
							<div className="relative">
								<input
									id="confirmPassword"
									name="confirmPassword"
									type={showConfirmPassword ? 'text' : 'password'}
									required
									value={formData.confirmPassword}
									onChange={handleInputChange}
									className="w-full px-4 py-3 pr-12 border border-white/20 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all duration-200 bg-white/5 focus:bg-white/10 text-white placeholder:text-gray-400"
									placeholder="Confirm your password"
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
								>
									{showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
									Creating account...
								</>
							) : (
								<>
									<UserPlus className="w-4 h-4" />
									Create Account
								</>
							)}
						</button>
					</form>

					<div className="mt-8 text-center">
						<p className="text-gray-300">
							Already have an account?{' '}
							<Link
								to="/login"
								className="text-white hover:text-gray-200 font-medium transition-colors underline decoration-white/30 hover:decoration-white/60"
							>
								Sign in
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

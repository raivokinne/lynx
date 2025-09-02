import { AlertCircle, Download, Play, Trash2, LogOut, User, Terminal } from "lucide-react";
import { useState } from "react";
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
	const [code, setCode] = useState('');
	const [output, setOutput] = useState('');
	const [isRunning, setIsRunning] = useState(false);
	const [error, setError] = useState('');
	const { user, logout } = useAuth();

	const executeCode = async () => {
		setIsRunning(true);
		setOutput('Running...\n');
		setError('');

		try {
			const response = await fetch('http://localhost:3001/api/compile', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ code }),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();

			if (result.success) {
				setOutput(result.output || 'Program executed successfully (no output)');
			} else {
				setError(result.error || 'Compilation failed');
				setOutput('');
			}
		} catch (error) {
			console.error('Error:', error);
			setError(`Connection error: ${error.message}. Make sure your backend server is running.`);
			setOutput('');
		} finally {
			setIsRunning(false);
		}
	};

	const clearCode = () => {
		setCode('');
		setOutput('');
		setError('');
	};

	const downloadCode = () => {
		const blob = new Blob([code], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'code.go';
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white shadow-sm border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center gap-3">
							<div className="bg-blue-600 p-2 rounded-lg">
								<Terminal className="w-6 h-6 text-white" />
							</div>
							<h1 className="text-xl font-semibold text-gray-900">Lynx Code Compiler</h1>
						</div>

						<div className="flex items-center gap-4">
							<div className="flex items-center gap-2 text-gray-700">
								<User className="w-4 h-4" />
								<span className="text-sm font-medium">{user?.username}</span>
							</div>
							<button
								onClick={logout}
								className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
							>
								<LogOut className="w-4 h-4" />
								Sign out
							</button>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto p-6">
				<div className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
					{/* Toolbar */}
					<div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
						<div className="flex items-center gap-3">
							<button
								onClick={executeCode}
								disabled={isRunning || !code.trim()}
								className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
							>
								<Play size={16} />
								{isRunning ? 'Running...' : 'Compile & Run'}
							</button>
							{isRunning && (
								<div className="flex items-center gap-2 text-blue-600">
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
									<span className="text-sm">Executing...</span>
								</div>
							)}
						</div>

						<div className="flex items-center gap-2">
							<button
								onClick={downloadCode}
								disabled={!code.trim()}
								className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
								title="Download Code"
							>
								<Download size={16} />
								<span className="hidden sm:inline">Download</span>
							</button>
							<button
								onClick={clearCode}
								disabled={!code.trim() && !output && !error}
								className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
								title="Clear All"
							>
								<Trash2 size={16} />
								<span className="hidden sm:inline">Clear</span>
							</button>
						</div>
					</div>

					{/* Error Display */}
					{error && (
						<div className="bg-red-50 border-l-4 border-red-500 p-4 mx-4 mt-4 rounded-lg">
							<div className="flex items-start">
								<AlertCircle className="text-red-500 mr-3 mt-0.5 flex-shrink-0" size={16} />
								<div>
									<h4 className="text-red-800 font-medium text-sm">Compilation Error</h4>
									<p className="text-red-700 text-sm mt-1 font-mono whitespace-pre-wrap">{error}</p>
								</div>
							</div>
						</div>
					)}

					{/* Code Editor and Output */}
					<div className="grid grid-cols-1 lg:grid-cols-2 h-[600px]">
						{/* Code Editor */}
						<div className="border-r border-gray-200">
							<div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
								<h3 className="font-semibold text-gray-800 flex items-center gap-2">
									<div className="w-3 h-3 bg-green-500 rounded-full"></div>
									Code Editor
									<span className="text-xs text-gray-500 ml-auto">Lynx Language</span>
								</h3>
							</div>
							<textarea
								value={code}
								onChange={(e) => setCode(e.target.value)}
								className="w-full h-full p-4 font-mono text-sm resize-none border-none outline-none bg-white text-gray-900 leading-relaxed"
								spellCheck="false"
							/>
						</div>

						{/* Output Panel */}
						<div className="bg-gray-900">
							<div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
								<h3 className="font-semibold text-gray-200 flex items-center gap-2">
									<div className={`w-3 h-3 rounded-full ${output && !error ? 'bg-green-500' : error ? 'bg-red-500' : 'bg-gray-500'}`}></div>
									Output
									{output && !error && (
										<span className="text-xs text-green-400 ml-auto">Success</span>
									)}
									{error && (
										<span className="text-xs text-red-400 ml-auto">Error</span>
									)}
								</h3>
							</div>
							<div className="h-full bg-gray-900 text-gray-100 p-4 font-mono text-sm overflow-auto">
								<pre className="whitespace-pre-wrap">
									{error ? (
										<span className="text-red-400">{error}</span>
									) : (
										output
									)}
								</pre>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

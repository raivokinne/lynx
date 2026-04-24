import React from "react";
import { Terminal, AlertCircle } from "lucide-react";

// Output display panel for code execution results
interface OutputPanelProps {
	isDarkMode: boolean;
	output: string;
	error: string;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
	isDarkMode,
	output,
	error,
}) => (
	<div
		className={`${isDarkMode ? "bg-black border-neutral-800" : "bg-neutral-100 border-neutral-300"} w-80 border-l flex flex-col`}
	>
		<div
			className={`border-b px-2 py-1 ${isDarkMode ? "border-neutral-800 bg-neutral-900" : "border-neutral-300 bg-neutral-200"}`}
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-1 text-xs font-mono text-neutral-400">
					<Terminal className="w-3 h-3" />
					<span>output</span>
				</div>
				<div className="flex items-center gap-1">
					<div
						className={`w-2 h-2 ${output && !error
								? "bg-green-600"
								: error
									? "bg-red-600"
									: "bg-neutral-600"
							}`}
					></div>
					<span className="text-xs font-mono text-neutral-400">
						{output && !error ? "done" : error ? "error" : "idle"}
					</span>
				</div>
			</div>
		</div>

		<div className="flex-1 p-2 overflow-auto font-mono text-xs">
			{!output && !error && (
				<div className="flex items-center justify-center h-full">
					<div
						className={`text-xs font-mono ${isDarkMode ? "text-neutral-600" : "text-neutral-400"}`}
					>
						_
					</div>
				</div>
			)}

			{error && (
				<div className="space-y-1">
					<div className="flex items-center gap-1 text-red-500 text-xs font-mono">
						<AlertCircle className="w-3 h-3" />
						error
					</div>
					<pre
						className={`text-xs whitespace-pre-wrap font-mono ${isDarkMode ? "text-red-500" : "text-red-600"}`}
					>
						{error}
					</pre>
				</div>
			)}

			{output && (
				<div className="space-y-1">
					<pre
						className={`text-xs whitespace-pre-wrap font-mono ${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}
					>
						{output}
					</pre>
				</div>
			)}
		</div>
	</div>
);

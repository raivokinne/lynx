import React from "react";
import { X } from "lucide-react";

interface SaveDialogProps {
	isDarkMode: boolean;
	saveTitle: string;
	setSaveTitle: (title: string) => void;
	onSave: () => void;
	onClose: () => void;
}

export const SaveDialog: React.FC<SaveDialogProps> = ({
	isDarkMode,
	saveTitle,
	setSaveTitle,
	onSave,
	onClose,
}) => (
	<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
		<div
			className={`max-w-sm w-full mx-4 p-4 ${isDarkMode ? "bg-neutral-900 border-neutral-700" : "bg-neutral-100 border-neutral-300"} border`}
		>
			<div className="flex items-center justify-between mb-3">
				<h3
					className={`text-xs font-mono ${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}
				>
					save code
				</h3>
				<button
					onClick={onClose}
					className={`p-0.5 ${isDarkMode ? "hover:bg-neutral-800 text-neutral-500" : "hover:bg-neutral-200 text-neutral-500"}`}
				>
					<X className="w-3 h-3" />
				</button>
			</div>

			<div className="space-y-3">
				<div>
					<label
						className={`block text-xs font-mono mb-1 ${isDarkMode ? "text-neutral-500" : "text-neutral-600"}`}
					>
						name
					</label>
					<input
						type="text"
						value={saveTitle}
						onChange={(e) => setSaveTitle(e.target.value)}
						placeholder="filename"
						className={`w-full p-2 text-xs font-mono border ${isDarkMode
								? "bg-black border-neutral-700 text-neutral-300 placeholder-neutral-600"
								: "bg-white border-neutral-300 text-neutral-700 placeholder-neutral-400"
							}`}
						autoFocus
					/>
				</div>

				<div className="flex gap-2">
					<button
						onClick={onClose}
						className={`flex-1 p-2 text-xs font-mono border ${isDarkMode
								? "border-neutral-700 text-neutral-400 hover:bg-neutral-800"
								: "border-neutral-300 text-neutral-600 hover:bg-neutral-200"
							}`}
					>
						cancel
					</button>
					<button
						onClick={onSave}
						disabled={!saveTitle.trim()}
						className={`flex-1 p-2 text-xs font-mono text-black ${saveTitle.trim()
								? "bg-neutral-300 hover:bg-neutral-200"
								: "bg-neutral-700 text-neutral-500 cursor-not-allowed"
							}`}
					>
						save
					</button>
				</div>
			</div>
		</div>
	</div>
);

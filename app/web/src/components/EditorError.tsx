import React from "react";

interface EditorErrorProps {
  error: string;
  height: string;
  width: string;
}

const EditorError: React.FC<EditorErrorProps> = ({ error, height, width }) => (
  <div
    style={{ height, width }}
    className="flex items-center justify-center bg-red-50 border border-red-200 rounded"
  >
    <div className="text-center text-red-600">
      <div className="font-semibold">Editor Error</div>
      <div className="text-sm mt-1">{error}</div>
      <button
        onClick={() => window.location.reload()}
        className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
      >
        Reload Page
      </button>
    </div>
  </div>
);

export default EditorError;

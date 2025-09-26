import React from "react";

interface EditorLoadingProps {
  isVisible: boolean;
}

const EditorLoading: React.FC<EditorLoadingProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
        <div className="text-sm text-gray-600">Loading editor...</div>
      </div>
    </div>
  );
};

export default EditorLoading;

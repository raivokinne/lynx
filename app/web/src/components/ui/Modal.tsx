import type { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  isDarkMode: boolean;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  isDarkMode,
}: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isDarkMode ? "bg-black/80" : "bg-white/80"
      }`}
      onClick={onClose}
    >
      <div
        className={`w-full ${sizeClasses[size]} ${
          isDarkMode
            ? "bg-neutral-900 border-neutral-700"
            : "bg-neutral-100 border-neutral-300"
        } border`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div
            className={`px-4 py-2 border-b ${
              isDarkMode ? "border-neutral-700" : "border-neutral-300"
            }`}
          >
            <h2
              className={`text-sm font-mono ${
                isDarkMode ? "text-neutral-300" : "text-neutral-700"
              }`}
            >
              {title}
            </h2>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDarkMode: boolean;
  variant?: "default" | "danger";
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "confirm",
  cancelLabel = "cancel",
  isDarkMode,
  variant = "default",
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isDarkMode={isDarkMode} size="sm">
      <div className="p-4">
        <h3
          className={`text-sm font-mono mb-2 ${
            isDarkMode ? "text-neutral-300" : "text-neutral-700"
          }`}
        >
          {title}
        </h3>
        <p
          className={`mb-4 text-xs font-mono ${
            isDarkMode ? "text-neutral-500" : "text-neutral-500"
          }`}
        >
          {message}
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className={`px-2 py-1 text-xs font-mono transition-colors ${
              isDarkMode
                ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-400"
                : "bg-neutral-200 hover:bg-neutral-300 text-neutral-600"
            }`}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-2 py-1 text-xs font-mono transition-colors ${
              variant === "danger"
                ? isDarkMode
                  ? "bg-red-900 hover:bg-red-800 text-red-400"
                  : "bg-red-200 hover:bg-red-300 text-red-600"
                : isDarkMode
                  ? "bg-neutral-700 hover:bg-neutral-600 text-neutral-200"
                  : "bg-neutral-300 hover:bg-neutral-400 text-neutral-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
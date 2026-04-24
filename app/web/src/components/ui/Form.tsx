import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isDarkMode: boolean;
  children: ReactNode;
}

const variantStyles = {
  primary: (isDarkMode: boolean) =>
    isDarkMode
      ? "bg-neutral-700 hover:bg-neutral-600 text-neutral-200 border-neutral-600"
      : "bg-neutral-300 hover:bg-neutral-400 text-neutral-700 border-neutral-400",
  secondary: (isDarkMode: boolean) =>
    isDarkMode
      ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-400 border-neutral-700"
      : "bg-neutral-200 hover:bg-neutral-300 text-neutral-600 border-neutral-300",
  ghost: (isDarkMode: boolean) =>
    isDarkMode
      ? "hover:bg-neutral-800 text-neutral-500 border-transparent"
      : "hover:bg-neutral-200 text-neutral-500 border-transparent",
  danger: (isDarkMode: boolean) =>
    isDarkMode
      ? "bg-red-900 hover:bg-red-800 text-red-400 border-red-800"
      : "bg-red-200 hover:bg-red-300 text-red-600 border-red-300",
};

const sizeStyles = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-1.5 text-sm",
  lg: "px-4 py-2 text-base",
};

export const Button = ({
  variant = "secondary",
  size = "md",
  isDarkMode,
  children,
  className = "",
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`font-mono border transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant](isDarkMode)} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  isDarkMode: boolean;
}

export const Input = ({ isDarkMode, className = "", ...props }: InputProps) => {
  return (
    <input
      className={`w-full px-2 py-1 text-xs font-mono border ${
        isDarkMode
          ? "border-neutral-700 bg-neutral-900 text-neutral-400 placeholder:text-neutral-600 focus:border-neutral-500"
          : "border-neutral-300 bg-white text-neutral-700 placeholder:text-neutral-400 focus:border-neutral-500"
      } ${className}`}
      {...props}
    />
  );
};

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  isDarkMode: boolean;
}

export const Select = ({ isDarkMode, className = "", ...props }: SelectProps) => {
  return (
    <select
      className={`w-full p-2 text-xs font-mono border ${
        isDarkMode
          ? "border-neutral-700 bg-neutral-900 text-neutral-400 focus:border-neutral-500"
          : "border-neutral-300 bg-white text-neutral-700 focus:border-neutral-500"
      } ${className}`}
      {...props}
    />
  );
};

type CheckboxProps = InputHTMLAttributes<HTMLInputElement>;

export const Checkbox = ({ className = "", ...props }: CheckboxProps) => {
  return (
    <input
      type="checkbox"
      className={`w-3 h-3 ${className}`}
      {...props}
    />
  );
};

interface RangeInputProps extends InputHTMLAttributes<HTMLInputElement> {
  isDarkMode?: boolean;
}

export const RangeInput = ({ isDarkMode = false, className = "", ...props }: RangeInputProps) => {
  return (
    <input
      type="range"
      className={`flex-1 ${isDarkMode ? "accent-neutral-400" : "accent-neutral-600"} ${className}`}
      {...props}
    />
  );
};

interface ToggleProps {
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  isDarkMode: boolean;
  labels?: { on: string; off: string };
}

export const Toggle = ({
  isChecked,
  onChange,
  isDarkMode,
  labels,
}: ToggleProps) => {
  return (
    <div className={`flex items-center gap-px ${isDarkMode ? "bg-neutral-800" : "bg-neutral-200"}`}>
      <button
        type="button"
        onClick={() => !isChecked && onChange(true)}
        className={`flex items-center gap-1 px-2 py-1 text-xs font-mono transition-colors ${
          isChecked
            ? isDarkMode
              ? "bg-neutral-200 text-neutral-800"
              : "bg-neutral-700 text-neutral-200"
            : isDarkMode
              ? "text-neutral-500 hover:text-neutral-300"
              : "text-neutral-500 hover:text-neutral-600"
        }`}
      >
        {labels?.on ?? "on"}
      </button>
      <button
        type="button"
        onClick={() => isChecked && onChange(false)}
        className={`flex items-center gap-1 px-2 py-1 text-xs font-mono transition-colors ${
          !isChecked
            ? isDarkMode
              ? "bg-neutral-700 text-neutral-200"
              : "bg-neutral-300 text-neutral-700"
            : isDarkMode
              ? "text-neutral-500 hover:text-neutral-300"
              : "text-neutral-500 hover:text-neutral-600"
        }`}
      >
        {labels?.off ?? "off"}
      </button>
    </div>
  );
};

interface LabelProps {
  isDarkMode: boolean;
  children: ReactNode;
  htmlFor?: string;
}

export const Label = ({ isDarkMode, children, htmlFor }: LabelProps) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-xs font-mono ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}
    >
      {children}
    </label>
  );
};

interface FormGroupProps {
  isDarkMode: boolean;
  label?: string;
  children: ReactNode;
}

export const FormGroup = ({ isDarkMode, label, children }: FormGroupProps) => {
  return (
    <div
      className={`p-3 border ${
        isDarkMode
          ? "border-neutral-700 bg-black"
          : "border-neutral-300 bg-white"
      }`}
    >
      {label && <Label isDarkMode={isDarkMode}>{label}</Label>}
      {children}
    </div>
  );
};
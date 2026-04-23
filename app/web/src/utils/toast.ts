import toast from "react-hot-toast";

const toastOptions = {
  style: {
    background: "#1a1a1a",
    color: "#a3a3a3",
    border: "1px solid #2d2d2d",
    fontFamily: 'ui-monospace, "Consolas", "Courier New", monospace',
    fontSize: "12px",
  },
  success: {
    iconTheme: {
      primary: "#f59e0b",
      secondary: "#1a1a1a",
    },
  },
  error: {
    iconTheme: {
      primary: "#ef4444",
      secondary: "#2d1a1a",
    },
  },
};

export const showToast = {
  success: (message: string) => toast.success(message, toastOptions),
  error: (message: string) => toast.error(message, toastOptions),
  loading: (message: string) => toast.loading(message, toastOptions),
  promise: <T,>(promise: Promise<T>, messages: { loading: string; success: string; error: string }) => 
    toast.promise(promise, messages, toastOptions),
};
import { useEffect, useState } from "react";

export const useMonacoLoader = (onLoad: () => void) => {
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (window.monaco) {
      onLoad();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js";
    script.async = true;

    script.onload = () => {
      window.require.config({
        paths: {
          vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs",
        },
      });
      window.require(["vs/editor/editor.main"], () => onLoad());
    };

    script.onerror = () => setError("Failed to load Monaco Editor");

    if (!document.querySelector('script[src*="monaco-editor"]')) {
      document.head.appendChild(script);
    }
  }, [onLoad]);

  return { error };
};

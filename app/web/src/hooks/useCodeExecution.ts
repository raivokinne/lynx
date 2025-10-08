import { useState } from "react";
import { API_BASE } from "../types/constants";

export const useCodeExecution = () => {
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const executeCode = async (code: string) => {
    setIsRunning(true);
    setOutput("Kompilē kodu...\n");
    setError("");

    try {
      const response = await fetch(`${API_BASE}/compile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ code }),
      });
      const result = await response.json();

      if (result.success) {
        setOutput(result.output || "[NO OUTPUT]");
      } else {
        setError(result.error || "Unknown error");
      }
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setIsRunning(false);
    }
  };

  const clearOutput = () => {
    setOutput("");
    setError("");
  };

  return {
    output,
    error,
    isRunning,
    executeCode,
    clearOutput,
  };
};

import { useState, useCallback, useRef, useEffect } from "react";
import { API_BASE } from "../types/constants";
import { showToast } from "../utils/toast";

const EXECUTION_COOLDOWN = 3000;
const MAX_UNAUTHENTICATED_EXECUTIONS = 5;
const COOLDOWN_DURATION = 60000;

export const useCodeExecution = () => {
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [cooldownEnd, setCooldownEnd] = useState<number | null>(null);
  const [executionsRemaining, setExecutionsRemaining] = useState(
    MAX_UNAUTHENTICATED_EXECUTIONS,
  );
  const executionCountRef = useRef<number>(0);
  const lastExecutionTimeRef = useRef<number>(0);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (cooldownEnd && cooldownEnd > Date.now()) {
      const remaining = cooldownEnd - Date.now();
      cooldownTimerRef.current = setTimeout(() => {
        setCooldownEnd(null);
        executionCountRef.current = 0;
        setExecutionsRemaining(MAX_UNAUTHENTICATED_EXECUTIONS);
      }, remaining);
    }
    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    };
  }, [cooldownEnd]);

  const executeCode = useCallback(
    async (code: string, isAuthenticated = false) => {
      const now = Date.now();

      if (isRunning) {
        showToast.error("Code is already running");
        return;
      }

      if (cooldownEnd && now < cooldownEnd && !isAuthenticated) {
        const remaining = Math.ceil((cooldownEnd - now) / 1000);
        showToast.error(`Please wait ${remaining}s before running again`);
        return;
      }

      if (
        now - lastExecutionTimeRef.current < EXECUTION_COOLDOWN &&
        !isAuthenticated
      ) {
        showToast.error("Please wait before running again");
        return;
      }

      if (!isAuthenticated) {
        if (executionCountRef.current >= MAX_UNAUTHENTICATED_EXECUTIONS) {
          const cooldownUntil = now + COOLDOWN_DURATION;
          setCooldownEnd(cooldownUntil);
          executionCountRef.current = 0;
          setExecutionsRemaining(0);
          showToast.error(
            "Too many executions. Please sign in for unlimited access or wait 1 minute.",
          );
          return;
        }

        executionCountRef.current += 1;
        const remaining =
          MAX_UNAUTHENTICATED_EXECUTIONS - executionCountRef.current;
        setExecutionsRemaining(remaining);
        showToast.success(`${remaining} executions remaining`);
      }

      lastExecutionTimeRef.current = now;
      setIsRunning(true);
      setOutput("Compiling code...\n");
      setError("");

      try {
        const response = await fetch(`${API_BASE}/compile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
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
    },
    [isRunning, cooldownEnd],
  );

  const clearOutput = useCallback(() => {
    setOutput("");
    setError("");
  }, []);

  const clearCooldown = useCallback(() => {
    setCooldownEnd(null);
    executionCountRef.current = 0;
    setExecutionsRemaining(MAX_UNAUTHENTICATED_EXECUTIONS);
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }
  }, []);

  return {
    output,
    error,
    isRunning,
    cooldownEnd,
    executionsRemaining,
    executeCode,
    clearOutput,
    clearCooldown,
  };
};

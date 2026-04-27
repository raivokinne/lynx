import { useState, useCallback, useRef, useEffect } from "react";
import { API_BASE } from "../types/constants";
import { showToast } from "../utils/toast";
import { safeJson } from "../utils/utils";

const EXECUTION_COOLDOWN = 3000;
const MAX_UNAUTHENTICATED_EXECUTIONS = 5;

export const useCodeExecution = () => {
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [cooldownEnd, setCooldownEnd] = useState<number | null>(null);
  const [executionsRemaining, setExecutionsRemaining] = useState<number>(
    MAX_UNAUTHENTICATED_EXECUTIONS,
  );
  const lastExecutionTimeRef = useRef<number>(0);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchExecutionStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/execution/status`, {
        credentials: "include",
        // Prevent 304s — we always need a fresh body to read execution state
        cache: "no-store",
      });

      const data = await safeJson(response);
      if (!data) return;

      if (data.executionsRemaining !== null) {
        setExecutionsRemaining(data.executionsRemaining);
      }
      setCooldownEnd(data.cooldownEnd ?? null);
    } catch (e) {
      console.error("Failed to fetch execution status:", e);
    }
  }, []);

  useEffect(() => {
    fetchExecutionStatus();
  }, [fetchExecutionStatus]);

  useEffect(() => {
    if (cooldownEnd && cooldownEnd > Date.now()) {
      const tick = () => {
        const remaining = cooldownEnd - Date.now();
        if (remaining <= 0) {
          setCooldownEnd(null);
          setExecutionsRemaining(MAX_UNAUTHENTICATED_EXECUTIONS);
          setError("");
          fetchExecutionStatus();
        } else {
          setError(
            `Cooldown active. Please wait ${Math.ceil(remaining / 1000)}s.`,
          );
        }
      };
      tick();
      cooldownTimerRef.current = setInterval(tick, 1000);
    } else if (cooldownEnd === null) {
      setError("");
    }
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, [cooldownEnd, fetchExecutionStatus]);

  const executeCode = useCallback(
    async (code: string, isAuthenticated = false) => {
      const now = Date.now();

      if (isRunning) {
        setError("Code is already running");
        return;
      }

      if (cooldownEnd && now < cooldownEnd && !isAuthenticated) {
        const remaining = Math.ceil((cooldownEnd - now) / 1000);
        setError(`Please wait ${remaining}s before running again`);
        return;
      }

      if (
        now - lastExecutionTimeRef.current < EXECUTION_COOLDOWN &&
        !isAuthenticated
      ) {
        setError("Please wait before running again");
        return;
      }

      if (!isAuthenticated && executionsRemaining <= 0) {
        setError(
          "Too many executions. Please sign in for unlimited access or wait 1 minute.",
        );
        return;
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

        const result = await safeJson(response);

        if (!result) {
          setOutput("");
          setError("Received an empty response from the server.");
          return;
        }

        if (result.executionsRemaining !== null) {
          setExecutionsRemaining(result.executionsRemaining);
        }
        if (result.cooldownEnd) {
          setCooldownEnd(result.cooldownEnd);
        }

        if (result.success) {
          setOutput(result.output || "[NO OUTPUT]");
        } else {
          setOutput(result.output || "");
          setError(result.error || "Unknown error");
        }
      } catch (e: any) {
        setOutput("");
        setError(e.message || String(e));
        showToast.error(e.message || String(e));
        console.error("Code execution error:", e);
      } finally {
        setIsRunning(false);
        fetchExecutionStatus();
      }
    },
    [isRunning, cooldownEnd, executionsRemaining, fetchExecutionStatus],
  );

  const clearOutput = useCallback(() => {
    setOutput("");
    setError("");
  }, []);

  const clearCooldown = useCallback(() => {
    setCooldownEnd(null);
    setExecutionsRemaining(MAX_UNAUTHENTICATED_EXECUTIONS);
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
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

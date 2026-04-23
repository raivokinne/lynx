import { useState, useCallback, useRef } from "react";
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
	const executionCountRef = useRef<number>(0);
	const lastExecutionTimeRef = useRef<number>(0);
	const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

	const executeCode = useCallback(async (code: string, isAuthenticated = false) => {
		const now = Date.now();

		if (cooldownEnd && now < cooldownEnd) {
			const remaining = Math.ceil((cooldownEnd - now) / 1000);
			showToast.error(`Please wait ${remaining}s before running again`);
			return;
		}

		if (now - lastExecutionTimeRef.current < EXECUTION_COOLDOWN) {
			showToast.error("Please wait before running again");
			return;
		}

		if (!isAuthenticated) {
			executionCountRef.current += 1;

			if (executionCountRef.current > MAX_UNAUTHENTICATED_EXECUTIONS) {
				const cooldownUntil = now + COOLDOWN_DURATION;
				setCooldownEnd(cooldownUntil);
				executionCountRef.current = 0;
				showToast.error("Too many executions. Please sign in for unlimited access or wait 1 minute.");
				return;
			}

			showToast.success(`${MAX_UNAUTHENTICATED_EXECUTIONS - executionCountRef.current} executions remaining`);
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
	}, []);

	const clearOutput = useCallback(() => {
		setOutput("");
		setError("");
	}, []);

	const clearCooldown = useCallback(() => {
		setCooldownEnd(null);
		executionCountRef.current = 0;
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
		executeCode,
		clearOutput,
		clearCooldown,
	};
};

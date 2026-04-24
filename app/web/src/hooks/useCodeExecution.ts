import { useState, useCallback, useRef, useEffect } from "react";
import { API_BASE } from "../types/constants";
import { showToast } from "../utils/toast";

const EXECUTION_COOLDOWN = 3000;
const MAX_UNAUTHENTICATED_EXECUTIONS = 5;
const COOLDOWN_DURATION = 60000;

const STORAGE_KEY_COUNT = "code_execution_count";
const STORAGE_KEY_COOLDOWN = "code_execution_cooldown";

const getStoredCount = (): number => {
	try {
		const stored = localStorage.getItem(STORAGE_KEY_COUNT);
		return stored ? parseInt(stored, 10) : 0;
	} catch (e) {
		console.error("localStorage read error:", e);
		return 0;
	}
};

const getStoredCooldown = (): number | null => {
	try {
		const stored = localStorage.getItem(STORAGE_KEY_COOLDOWN);
		if (!stored) return null;
		const cooldown = parseInt(stored, 10);
		return cooldown > Date.now() ? cooldown : null;
	} catch (e) {
		console.error("localStorage read error:", e);
		return null;
	}
};

export const useCodeExecution = () => {
	const [output, setOutput] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [isRunning, setIsRunning] = useState<boolean>(false);
	const [cooldownEnd, setCooldownEnd] = useState<number | null>(() => getStoredCooldown());
	const [executionsRemaining, setExecutionsRemaining] = useState(() => {
		const storedCount = getStoredCount();
		return MAX_UNAUTHENTICATED_EXECUTIONS - storedCount;
	});
	const executionCountRef = useRef<number>(getStoredCount());
	const lastExecutionTimeRef = useRef<number>(0);
	const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (cooldownEnd && cooldownEnd > Date.now()) {
			try {
				localStorage.setItem(STORAGE_KEY_COOLDOWN, String(cooldownEnd));
			} catch (e) {
				showToast.error("LocalStorage write error")
			}
			const tick = () => {
				const remaining = cooldownEnd - Date.now();
				if (remaining <= 0) {
					setCooldownEnd(null);
					executionCountRef.current = 0;
					setExecutionsRemaining(MAX_UNAUTHENTICATED_EXECUTIONS);
					setError("");
					try {
						localStorage.removeItem(STORAGE_KEY_COOLDOWN);
						localStorage.removeItem(STORAGE_KEY_COUNT);
					} catch (e) {
						showToast.error("LocalStorage write error")
					}
				} else {
					setError(`Cooldown active. Please wait ${Math.ceil(remaining / 1000)}s.`);
				}
			};
			tick();
			cooldownTimerRef.current = setInterval(tick, 1000);
		} else if (cooldownEnd === null) {
			setError("");
			try {
				localStorage.removeItem(STORAGE_KEY_COOLDOWN);
			} catch (e) {
				showToast.error("LocalStorage write error")
			}
		}
		return () => {
			if (cooldownTimerRef.current) {
				clearInterval(cooldownTimerRef.current);
			}
		};
	}, [cooldownEnd]);

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

			if (!isAuthenticated) {
				if (executionCountRef.current >= MAX_UNAUTHENTICATED_EXECUTIONS) {
					const cooldownUntil = now + COOLDOWN_DURATION;
					setCooldownEnd(cooldownUntil);
					executionCountRef.current = 0;
					setExecutionsRemaining(0);
					try {
						localStorage.setItem(STORAGE_KEY_COOLDOWN, String(cooldownUntil));
						localStorage.setItem(STORAGE_KEY_COUNT, "0");
					} catch (e) {
						console.error("localStorage write error:", e);
					}
					setError(
						"Too many executions. Please sign in for unlimited access or wait 1 minute.",
					);
					return;
				}

				executionCountRef.current += 1;
				const remaining =
					MAX_UNAUTHENTICATED_EXECUTIONS - executionCountRef.current;
				setExecutionsRemaining(remaining);
				try {
					localStorage.setItem(
						STORAGE_KEY_COUNT,
						String(executionCountRef.current),
					);
				} catch (e) {
					console.error("localStorage write error:", e);
				}
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
			clearInterval(cooldownTimerRef.current);
			cooldownTimerRef.current = null;
		}
		try {
			localStorage.removeItem(STORAGE_KEY_COUNT);
			localStorage.removeItem(STORAGE_KEY_COOLDOWN);
		} catch (e) {
			console.error("localStorage write error:", e);
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

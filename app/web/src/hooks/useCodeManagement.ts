import { useState, useEffect, useCallback } from "react";
import type { SavedCode } from "../types/types";
import { codeApi } from "../api/code";

export const useCodeManagement = (userId?: string) => {
    const [savedCodes, setSavedCodes] = useState<SavedCode[]>([]);
    const [code, setCode] = useState<string>("");
    const [currentCodeTitle, setCurrentCodeTitle] = useState<string>("Untitled");
    const [currentCodeId, setCurrentCodeId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const loadSavedCodes = useCallback(async () => {
        if (!userId) return;

        try {
            setLoading(true);
            setError(null);
            const result = await codeApi.loadCodes();

            if (result.success && result.codes) {
                const transformedCodes: SavedCode[] = result.codes.map((code) => ({
                    id: code.id,
                    title: code.title,
                    code: "",
                    createdAt: code.createdAt || new Date().toISOString(),
                    updatedAt: code.createdAt || new Date().toISOString(),
                }));
                setSavedCodes(transformedCodes);
            } else {
                setError(result.error || "Failed to load codes");
            }
        } catch (error) {
            console.error("Error loading saved codes:", error);
            setError(error instanceof Error ? error.message : "Failed to load codes");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            loadSavedCodes();
        }
    }, [userId, loadSavedCodes]);

    useEffect(() => {
        if (userId && code) {
            // For now, we'll just keep it in memory during the session
        }
    }, [code, currentCodeTitle, userId]);

    const saveCode = async (title: string): Promise<boolean> => {
        if (!userId || !title.trim()) return false;

        try {
            setLoading(true);
            setError(null);

            const result = await codeApi.saveCode(title.trim(), code);

            if (result.success && result.id) {
                const newCode: SavedCode = {
                    id: result.id,
                    title: title.trim(),
                    code: code,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                setSavedCodes((prev) => [newCode, ...prev]);
                setCurrentCodeTitle(title.trim());
                setCurrentCodeId(result.id);

                // Reload the list to ensure consistency
                await loadSavedCodes();

                return true;
            } else {
                setError(result.error || "Failed to save code");
                return false;
            }
        } catch (error) {
            console.error("Error saving code:", error);
            setError(error instanceof Error ? error.message : "Failed to save code");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const loadCode = async (savedCode: SavedCode): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            // If we already have the code content, use it
            if (savedCode.code) {
                setCode(savedCode.code);
                setCurrentCodeTitle(savedCode.title);
                setCurrentCodeId(savedCode.id);
                return;
            }

            const result = await codeApi.loadCode(savedCode.id);

            if (result.success && result.code) {
                setCode(result.code.code);
                setCurrentCodeTitle(result.code.title);
                setCurrentCodeId(result.code.id);
            } else {
                setError(result.error || "Failed to load code");
            }
        } catch (error) {
            console.error("Error loading code:", error);
            setError(error instanceof Error ? error.message : "Failed to load code");
        } finally {
            setLoading(false);
        }
    };

    const deleteCode = async (codeId: string): Promise<boolean> => {
        if (!userId) return false;

        try {
            setLoading(true);
            setError(null);

            // Note: This will need to be implemented in backend
            const result = await codeApi.deleteCode(codeId);

            if (result.success) {
                setSavedCodes((prev) => prev.filter((c) => c.id !== codeId));

                if (currentCodeId === codeId) {
                    clearCode();
                }

                return true;
            } else {
                setError(result.error || "Failed to delete code");
                return false;
            }
        } catch (error) {
            console.error("Error deleting code:", error);
            setError(
                error instanceof Error ? error.message : "Failed to delete code",
            );
            return false;
        } finally {
            setLoading(false);
        }
    };

    const clearCode = () => {
        setCode("");
        setCurrentCodeTitle("Untitled");
        setCurrentCodeId(null);
    };

    const downloadCode = () => {
        const blob = new Blob([code], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${currentCodeTitle.replace(/[^a-zA-Z0-9]/g, "_")}.lynx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const clearError = () => setError(null);

    return {
        code,
        setCode,
        currentCodeTitle,
        setCurrentCodeTitle,
        currentCodeId,
        savedCodes,
        saveCode,
        loadCode,
        deleteCode,
        clearCode,
        downloadCode,
        loading,
        error,
        clearError,
        refreshCodes: loadSavedCodes,
    };
};

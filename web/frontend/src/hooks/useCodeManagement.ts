import { useState, useEffect, useCallback } from "react";
import type { SavedCode } from "../types/types";

export const useCodeManagement = (userId?: string) => {
  const [savedCodes, setSavedCodes] = useState<SavedCode[]>([]);
  const [code, setCode] = useState<string>("");
  const [currentCodeTitle, setCurrentCodeTitle] = useState<string>("Untitled");

  const loadSavedCodes = useCallback(() => {
    if (!userId) return;

    try {
      const saved = localStorage.getItem(`lynx_saved_codes_${userId}`);
      if (saved) {
        setSavedCodes(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading saved codes:", error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      const savedCode = localStorage.getItem(`lynx_code_${userId}`);
      const savedTitle = localStorage.getItem(`lynx_code_title_${userId}`);
      if (savedCode) {
        setCode(savedCode);
        setCurrentCodeTitle(savedTitle || "Untitled");
      }
      loadSavedCodes();
    }
  }, [userId, loadSavedCodes]);

  useEffect(() => {
    if (userId && code) {
      localStorage.setItem(`lynx_code_${userId}`, code);
      localStorage.setItem(`lynx_code_title_${userId}`, currentCodeTitle);
    }
  }, [code, currentCodeTitle, userId]);

  const saveCode = (title: string) => {
    if (!userId || !title.trim()) return;

    const newCode: SavedCode = {
      id: Date.now().toString(),
      title: title.trim(),
      code: code,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedCodes = [...savedCodes, newCode];
    setSavedCodes(updatedCodes);
    localStorage.setItem(
      `lynx_saved_codes_${userId}`,
      JSON.stringify(updatedCodes),
    );
    setCurrentCodeTitle(title.trim());
  };

  const loadCode = (savedCode: SavedCode) => {
    setCode(savedCode.code);
    setCurrentCodeTitle(savedCode.title);
  };

  const deleteCode = (codeId: string) => {
    if (!userId) return;

    const updatedCodes = savedCodes.filter((c) => c.id !== codeId);
    setSavedCodes(updatedCodes);
    localStorage.setItem(
      `lynx_saved_codes_${userId}`,
      JSON.stringify(updatedCodes),
    );
  };

  const clearCode = () => {
    setCode("");
    setCurrentCodeTitle("Untitled");
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

  return {
    code,
    setCode,
    currentCodeTitle,
    setCurrentCodeTitle,
    savedCodes,
    saveCode,
    loadCode,
    deleteCode,
    clearCode,
    downloadCode,
  };
};

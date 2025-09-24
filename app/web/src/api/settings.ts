import type { EditorSettings } from "../types/types";
import { getAuthToken } from "../utils/utils";
import { API_BASE } from "../types/constants";

export const settingsAPI = {
    async getSettings(): Promise<{
        success: boolean;
        settings?: EditorSettings;
        error?: string;
    }> {
        const token = getAuthToken();
        if (!token) throw new Error("No authentication token");

        const response = await fetch(`${API_BASE}/settings`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return await response.json();
    },

    async saveSettings(
        settings: EditorSettings,
    ): Promise<{ success: boolean; error?: string }> {
        const token = getAuthToken();
        if (!token) throw new Error("No authentication token");

        const response = await fetch(`${API_BASE}/settings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ settings }),
        });

        return await response.json();
    },

    async resetSettings(): Promise<{ success: boolean; error?: string }> {
        const token = getAuthToken();
        if (!token) throw new Error("No authentication token");

        const response = await fetch(`${API_BASE}/settings`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return await response.json();
    },
};

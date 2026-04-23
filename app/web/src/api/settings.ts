import type { EditorSettings } from "../types/types";
import { API_BASE } from "../types/constants";

export const settingsAPI = {
  async getSettings(): Promise<{
    success: boolean;
    settings?: EditorSettings;
    error?: string;
  }> {
    const response = await fetch(`${API_BASE}/settings`, {
      credentials: "include",
    });

    return await response.json();
  },

  async saveSettings(
    settings: EditorSettings,
  ): Promise<{ success: boolean; error?: string }> {
    const response = await fetch(`${API_BASE}/settings`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ settings }),
    });

    return await response.json();
  },

  async resetSettings(): Promise<{ success: boolean; error?: string }> {
    const response = await fetch(`${API_BASE}/settings`, {
      method: "DELETE",
      credentials: "include",
    });

    return await response.json();
  },
};

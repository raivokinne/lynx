import { API_BASE } from "../types/constants";
import type { SavedCode } from "../types/types";
import { getAuthToken } from "../utils/utils";

export const codeApi = {
  async saveCode(
    title: string,
    code: string,
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token");

    const response = await fetch(`${API_BASE}/code/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, code }),
    });

    return await response.json();
  },

  async loadCodes(): Promise<{
    success: boolean;
    codes?: SavedCode[];
    error?: string;
  }> {
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token");

    const response = await fetch(`${API_BASE}/code/list`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await response.json();
  },

  async loadCode(
    id: string,
  ): Promise<{ success: boolean; code?: SavedCode; error?: string }> {
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token");

    const response = await fetch(`${API_BASE}/code/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await response.json();
  },

  async deleteCode(id: string): Promise<{ success: boolean; error?: string }> {
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token");

    const response = await fetch(`${API_BASE}/code/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await response.json();
  },
};

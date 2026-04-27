import { API_BASE } from "../types/constants";
import type { SavedCode } from "../types/types";
import { showToast } from "../utils/toast";

// API client for code CRUD operations
export const codeApi = {
  saveCode: async (
    title: string,
    code: string,
    language = "lynx",
    description?: string,
  ) => {
    try {
      const response = await fetch(`${API_BASE}/codes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ title, code, language, description }),
      });

      const data = await response.json();
      return data;
    } catch {
      showToast.error("Failed to save code");
      return { success: false, error: "Network error" };
    }
  },

  updateCode: async (
    id: string,
    code: string,
    title: string,
    language = "lynx",
    description?: string,
  ) => {
    try {
      const response = await fetch(`${API_BASE}/codes`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ id, title, code, language, description }),
      });
      const data = await response.json();
      return data;
    } catch {
      showToast.error("Failed to update code");
      return { success: false, error: "Network error" };
    }
  },

  loadCodes: async (limit = 50, offset = 0) => {
    try {
      const params = new URLSearchParams();
      params.append("limit", limit.toString());
      params.append("offset", offset.toString());

      const response = await fetch(`${API_BASE}/codes?${params}`, {
        credentials: "include",
      });

      const data = await response.json();

      if (data.success && data.codes) {
        data.codes = data.codes.map((code: SavedCode) => ({
          id: code.id,
          title: code.title,
          code: code.code,
          createdAt: code.createdAt,
          updatedAt: code.updatedAt,
        }));
      }

      return data;
    } catch {
      showToast.error("Failed to load codes");
      return { success: false, error: "Network error" };
    }
  },

  loadCode: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/codes/${id}`, {
        credentials: "include",
      });

      const data = await response.json();

      if (data.success && data.code) {
        data.code = {
          id: data.code.id,
          title: data.code.title,
          code: data.code.code,
          language: data.code.language,
          description: data.code.description,
          createdAt: data.code.createdAt,
          updatedAt: data.code.updatedAt,
        };
      }

      return data;
    } catch {
      showToast.error("Failed to load code");
      return { success: false, error: "Network error" };
    }
  },

  deleteCode: async (id: string, permanent = false) => {
    try {
      const params = permanent ? "?permanent=true" : "";
      const response = await fetch(`${API_BASE}/codes/${id}${params}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      return data;
    } catch {
      showToast.error("Failed to delete code");
      return { success: false, error: "Network error" };
    }
  },
};

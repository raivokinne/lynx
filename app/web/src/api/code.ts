import { API_BASE } from "../types/constants";
import type { SavedCode } from "../types/types";

export const codeApi = {
  saveCode: async (
    title: string,
    code: string,
    language = "cpp",
    description?: string,
  ) => {
    try {
      const response = await fetch(`${API_BASE}/codes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ title, code, language, description }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Save code error:", error);
      return { success: false, error: "Network error" };
    }
  },

  updateCode: async (
    id: string,
    code: string,
    title: string,
    language = "cpp",
    description?: string,
  ) => {
    try {
      const response = await fetch(`${API_BASE}/codes`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ id, title, code, language, description }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Update code error:", error);
      return { success: false, error: "Network error" };
    }
  },

  loadCodes: async (limit = 50, offset = 0) => {
    try {
      const params = new URLSearchParams();
      params.append("limit", limit.toString());
      params.append("offset", offset.toString());

      const response = await fetch(`${API_BASE}/codes?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
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
    } catch (error) {
      console.error("Load codes error:", error);
      return { success: false, error: "Network error" };
    }
  },

  loadCode: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/codes/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (data.success && data.code) {
        data.code = {
          id: data.code.id,
          title: data.code.title,
          code: data.code.code,
          language: data.code.language,
          description: data.code.description,
          createdAt: data.code.created_at,
          updatedAt: data.code.updated_at,
        };
      }

      return data;
    } catch (error) {
      console.error("Load code error:", error);
      return { success: false, error: "Network error" };
    }
  },

  deleteCode: async (id: string, permanent = false) => {
    try {
      const params = permanent ? "?permanent=true" : "";
      const response = await fetch(`${API_BASE}/codes/${id}${params}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Delete code error:", error);
      return { success: false, error: "Network error" };
    }
  },

  restoreCode: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/codes/${id}/restore`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Restore code error:", error);
      return { success: false, error: "Network error" };
    }
  },

  getDeletedCodes: async () => {
    try {
      const response = await fetch(`${API_BASE}/codes/deleted/list`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (data.success && data.codes) {
        data.codes = data.codes.map((code: any) => ({
          id: code.id,
          title: code.title,
          language: code.language,
          description: code.description,
          createdAt: code.created_at,
          updatedAt: code.updated_at,
        }));
      }

      return data;
    } catch (error) {
      console.error("Get deleted codes error:", error);
      return { success: false, error: "Network error" };
    }
  },
};

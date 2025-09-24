import { v4 as uuidv4 } from "uuid";
import { db } from "../db.js";

export const saveCode = async (req, res) => {
    try {
        const { title, code } = req.body;
        if (!code)
            return res
                .status(400)
                .json({ success: false, error: "Code is required" });

        const codeId = uuidv4();
        await db.run(
            "INSERT INTO codes (id, user_id, title, code) VALUES (?, ?, ?, ?)",
            [codeId, req.user.id, title || "Untitled", code],
        );

        res.json({ success: true, message: "Code saved successfully", id: codeId });
    } catch (error) {
        console.error("Save code error:", error?.message ?? error);
        res.status(500).json({ success: false, error: "Failed to save code" });
    }
};

export const listCode = async (req, res) => {
    try {
        const codes = await db.all(
            "SELECT id, title, created_at FROM codes WHERE user_id = ? ORDER BY created_at DESC",
            [req.user.id],
        );
        res.json({ success: true, codes });
    } catch (error) {
        console.error("List code error:", error?.message ?? error);
        res.status(500).json({ success: false, error: "Failed to fetch codes" });
    }
};

export const getCode = async (req, res) => {
    try {
        const { id } = req.params;
        const code = await db.get(
            "SELECT id, title, code, created_at FROM codes WHERE id = ? AND user_id = ?",
            [id, req.user.id],
        );

        if (!code) {
            return res.status(404).json({ success: false, error: "Code not found" });
        }

        res.json({ success: true, code });
    } catch (error) {
        console.error("Get code error:", error?.message ?? error);
        res.status(500).json({ success: false, error: "Failed to fetch code" });
    }
};
export const deleteCode = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                error: "Code ID is required",
            });
        }

        // First, check if the code exists and belongs to the user
        const existingCode = await db.get(
            "SELECT id FROM codes WHERE id = ? AND user_id = ?",
            [id, req.user.id],
        );

        if (!existingCode) {
            return res.status(404).json({
                success: false,
                error: "Code not found or you don't have permission to delete it",
            });
        }

        // Delete the code
        const result = await db.run(
            "DELETE FROM codes WHERE id = ? AND user_id = ?",
            [id, req.user.id],
        );

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                error: "Code not found or already deleted",
            });
        }

        res.json({
            success: true,
            message: "Code deleted successfully",
        });
    } catch (error) {
        console.error("Delete code error:", error?.message ?? error);
        res.status(500).json({
            success: false,
            error: "Failed to delete code",
        });
    }
};

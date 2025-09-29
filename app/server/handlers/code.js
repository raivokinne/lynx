import { v4 as uuidv4 } from "uuid";
import { db } from "../db.js";

export const saveCode = async (req, res) => {
    try {
        const { title, code } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                error: "Code is required"
            });
        }

        const codeId = uuidv4();
        await db.query(
            "INSERT INTO codes (id, user_id, title, code) VALUES ($1, $2, $3, $4)",
            [codeId, req.user.id, title || "Untitled", code]
        );

        res.json({
            success: true,
            message: "Code saved successfully",
            id: codeId
        });
    } catch (error) {
        console.error("Save code error:", error?.message ?? error);
        res.status(500).json({
            success: false,
            error: "Failed to save code"
        });
    }
};

export const listCode = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT id, title, created_at
             FROM codes
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [req.user.id]
        );

        res.json({ success: true, codes: result.rows });
    } catch (error) {
        console.error("List code error:", error?.message ?? error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch codes"
        });
    }
};

export const getCode = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `SELECT id, title, code, created_at
             FROM codes
             WHERE id = $1 AND user_id = $2`,
            [id, req.user.id]
        );

        const code = result.rows[0];
        if (!code) {
            return res.status(404).json({
                success: false,
                error: "Code not found"
            });
        }

        res.json({ success: true, code });
    } catch (error) {
        console.error("Get code error:", error?.message ?? error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch code"
        });
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

        const result = await db.query(
            "DELETE FROM codes WHERE id = $1 AND user_id = $2",
            [id, req.user.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                error: "Code not found or you don't have permission to delete it",
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


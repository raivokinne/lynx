import { v4 as uuidv4 } from "uuid";
import { db } from "../db.js";
import { createVersion } from "./version.js";

export const saveCode = async (req, res) => {
  try {
    const { title, code } = req.body;

    if (!code) {
      return res.status(422).json({
        success: false,
        error: "Code is required",
      });
    }

    const codeId = uuidv4();
    await db.query(
      "INSERT INTO codes (id, user_id, title, code) VALUES ($1, $2, $3, $4)",
      [codeId, req.user.id, title || "Untitled", code],
    );

    await createVersion(codeId, code, title || "Untitled");

    res.json({
      success: true,
      message: "Code saved successfully",
      id: codeId,
    });
  } catch (error) {
    console.error("Save code error:", error?.message ?? error);
    res.status(500).json({
      success: false,
      error: "Failed to save code",
    });
  }
};

export const updateCode = async (req, res) => {
  try {
    const { id, title, code } = req.body;

    if (!id || !code) {
      return res.status(422).json({
        success: false,
        error: "Code and Id are required",
      });
    }

    const currentResult = await db.query(
      "SELECT code, title FROM codes WHERE id = $1 AND user_id = $2",
      [id, req.user.id],
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Code not found or unauthorized",
      });
    }

    const currentCode = currentResult.rows[0];
    if (currentCode.code !== code) {
      await createVersion(id, currentCode.code, currentCode.title);
    }

    const result = await db.query(
      `UPDATE codes
             SET title = COALESCE($1, title),
                 code = $2
             WHERE id = $3 AND user_id = $4
             RETURNING *`,
      [title, code, id, req.user.id],
    );

    const codeData = result.rows[0];
    res.json({
      success: true,
      message: "Code updated successfully",
      id: codeData.id,
    });
  } catch (error) {
    console.error("Update code error:", error?.message ?? error);
    res.status(500).json({
      success: false,
      error: "Failed to update code",
    });
  }
};

export const listCode = async (req, res) => {
  try {
    const {} = req.query;

    let query = `
            SELECT id, title, created_at
            FROM codes
            WHERE user_id = $1
        `;

    const params = [req.user.id];

    const result = await db.query(query, params);

    res.json({
      success: true,
      codes: result.rows,
    });
  } catch (error) {
    console.error("List code error:", error?.message ?? error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch codes",
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
      [id, req.user.id],
    );

    const code = result.rows[0];

    if (!code) {
      return res.status(404).json({
        success: false,
        error: "Code not found",
      });
    }

    res.json({ success: true, code });
  } catch (error) {
    console.error("Get code error:", error?.message ?? error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch code",
    });
  }
};

export const deleteCode = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(422).json({
        success: false,
        error: "Code ID is required",
      });
    }

    let result = await db.query(
      "DELETE FROM codes WHERE id = $1 AND user_id = $2",
      [id, req.user.id],
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

export const restoreCode = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "UPDATE codes SET is_deleted = false WHERE id = $1 AND user_id = $2 AND is_deleted = true",
      [id, req.user.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Code not found or already restored",
      });
    }

    res.json({
      success: true,
      message: "Code restored successfully",
    });
  } catch (error) {
    console.error("Restore code error:", error?.message ?? error);
    res.status(500).json({
      success: false,
      error: "Failed to restore code",
    });
  }
};

export const getDeletedCodes = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, title, language, description, created_at, updated_at
             FROM codes
             WHERE user_id = $1 AND is_deleted = true
             ORDER BY updated_at DESC`,
      [req.user.id],
    );

    res.json({
      success: true,
      codes: result.rows,
    });
  } catch (error) {
    console.error("Get deleted codes error:", error?.message ?? error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch deleted codes",
    });
  }
};

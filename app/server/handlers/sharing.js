import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { db } from "../db.js";

const generateShareToken = () => {
  return crypto.randomBytes(16).toString("hex");
};

export const shareCode = async (req, res) => {
  try {
    const { codeId, isPublic, expiresInDays } = req.body;

    if (!codeId) {
      return res.status(400).json({
        success: false,
        error: "Code ID is required",
      });
    }

    const codeResult = await db.query(
      `SELECT id FROM codes WHERE id = $1 AND user_id = $2`,
      [codeId, req.user.id],
    );

    if (codeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Code not found or unauthorized",
      });
    }

    const existingShare = await db.query(
      `SELECT share_token FROM shared_codes WHERE code_id = $1`,
      [codeId],
    );

    if (existingShare.rows.length > 0) {
      return res.json({
        success: true,
        shareToken: existingShare.rows[0].share_token,
        message: "Code already shared",
      });
    }

    const shareId = uuidv4();
    const shareToken = generateShareToken();
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    await db.query(
      `INSERT INTO shared_codes (id, code_id, share_token, is_public, expires_at)
             VALUES ($1, $2, $3, $4, $5)`,
      [shareId, codeId, shareToken, isPublic || false, expiresAt],
    );

    res.json({
      success: true,
      shareToken,
      message: "Code shared successfully",
    });
  } catch (error) {
    console.error("Share code error:", error?.message ?? error);
    res.status(500).json({
      success: false,
      error: "Failed to share code",
    });
  }
};

export const getSharedCode = async (req, res) => {
  try {
    const { token } = req.params;

    const result = await db.query(
      `SELECT c.id, c.title, c.code, c.language, c.description, c.created_at,
                    u.username, sc.is_public, sc.view_count
             FROM shared_codes sc
             JOIN codes c ON sc.code_id = c.id
             JOIN users u ON c.user_id = u.id
             WHERE sc.share_token = $1
             AND (sc.expires_at IS NULL OR sc.expires_at > NOW())`,
      [token],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Shared code not found or expired",
      });
    }

    await db.query(
      `UPDATE shared_codes SET view_count = view_count + 1 WHERE share_token = $1`,
      [token],
    );

    res.json({
      success: true,
      code: result.rows[0],
    });
  } catch (error) {
    console.error("Get shared code error:", error?.message ?? error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch shared code",
    });
  }
};

export const getCodeShares = async (req, res) => {
  try {
    const { codeId } = req.params;

    const codeResult = await db.query(
      `SELECT id FROM codes WHERE id = $1 AND user_id = $2`,
      [codeId, req.user.id],
    );

    if (codeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Code not found or unauthorized",
      });
    }

    const result = await db.query(
      `SELECT id, share_token, is_public, view_count, expires_at, created_at
             FROM shared_codes
             WHERE code_id = $1`,
      [codeId],
    );

    res.json({
      success: true,
      shares: result.rows,
    });
  } catch (error) {
    console.error("Get code shares error:", error?.message ?? error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch shares",
    });
  }
};

export const updateShare = async (req, res) => {
  try {
    const { token } = req.params;
    const { isPublic, expiresInDays } = req.body;

    const result = await db.query(
      `SELECT sc.id, c.user_id
             FROM shared_codes sc
             JOIN codes c ON sc.code_id = c.id
             WHERE sc.share_token = $1`,
      [token],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Share not found",
      });
    }

    if (result.rows[0].user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    await db.query(
      `UPDATE shared_codes
             SET is_public = COALESCE($1, is_public),
                 expires_at = COALESCE($2, expires_at)
             WHERE share_token = $3`,
      [isPublic, expiresAt, token],
    );

    res.json({
      success: true,
      message: "Share updated successfully",
    });
  } catch (error) {
    console.error("Update share error:", error?.message ?? error);
    res.status(500).json({
      success: false,
      error: "Failed to update share",
    });
  }
};

export const revokeShare = async (req, res) => {
  try {
    const { token } = req.params;

    const result = await db.query(
      `DELETE FROM shared_codes sc
             USING codes c
             WHERE sc.code_id = c.id
             AND sc.share_token = $1
             AND c.user_id = $2`,
      [token, req.user.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Share not found or unauthorized",
      });
    }

    res.json({
      success: true,
      message: "Share revoked successfully",
    });
  } catch (error) {
    console.error("Revoke share error:", error?.message ?? error);
    res.status(500).json({
      success: false,
      error: "Failed to revoke share",
    });
  }
};

export const getPublicShares = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const result = await db.query(
      `SELECT c.id, c.title, c.language, c.description, c.created_at,
                    u.username, sc.share_token, sc.view_count
             FROM shared_codes sc
             JOIN codes c ON sc.code_id = c.id
             JOIN users u ON c.user_id = u.id
             WHERE sc.is_public = true
             AND (sc.expires_at IS NULL OR sc.expires_at > NOW())
             ORDER BY sc.created_at DESC
             LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    res.json({
      success: true,
      codes: result.rows,
    });
  } catch (error) {
    console.error("Get public shares error:", error?.message ?? error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch public shares",
    });
  }
};

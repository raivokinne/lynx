import { v4 as uuidv4 } from "uuid";
import { db } from "../db.js";

export const createVersion = async (codeId, code, title) => {
  try {
    const versionResult = await db.query(
      `SELECT COALESCE(MAX(version_number), 0) as max_version
             FROM code_versions
             WHERE code_id = $1`,
      [codeId],
    );

    const nextVersion = versionResult.rows[0].max_version + 1;
    const versionId = uuidv4();

    await db.query(
      `INSERT INTO code_versions (id, code_id, code, title, version_number)
             VALUES ($1, $2, $3, $4, $5)`,
      [versionId, codeId, code, title, nextVersion],
    );

    return { versionId, versionNumber: nextVersion };
  } catch (error) {
    console.error("Create version error:", error?.message ?? error);
    throw error;
  }
};

export const getVersions = async (req, res) => {
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
      `SELECT id, version_number, title, created_at,
                    LENGTH(code) as code_length
             FROM code_versions
             WHERE code_id = $1
             ORDER BY version_number DESC`,
      [codeId],
    );

    res.json({
      success: true,
      versions: result.rows,
    });
  } catch (error) {
    console.error("Get versions error:", error?.message ?? error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch versions",
    });
  }
};

export const getVersion = async (req, res) => {
  try {
    const { codeId, versionNumber } = req.params;

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
      `SELECT id, code, title, version_number, created_at
             FROM code_versions
             WHERE code_id = $1 AND version_number = $2`,
      [codeId, versionNumber],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Version not found",
      });
    }

    res.json({
      success: true,
      version: result.rows[0],
    });
  } catch (error) {
    console.error("Get version error:", error?.message ?? error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch version",
    });
  }
};

export const restoreVersion = async (req, res) => {
  try {
    const { codeId, versionNumber } = req.params;

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

    const versionResult = await db.query(
      `SELECT code, title FROM code_versions
             WHERE code_id = $1 AND version_number = $2`,
      [codeId, versionNumber],
    );

    if (versionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Version not found",
      });
    }

    const { code, title } = versionResult.rows[0];

    const currentCode = await db.query(
      `SELECT code, title FROM codes WHERE id = $1`,
      [codeId],
    );

    if (currentCode.rows.length > 0) {
      await createVersion(
        codeId,
        currentCode.rows[0].code,
        currentCode.rows[0].title,
      );
    }

    await db.query(
      `UPDATE codes
             SET code = $1, title = $2, updated_at = CURRENT_TIMESTAMP
             WHERE id = $3`,
      [code, title, codeId],
    );

    res.json({
      success: true,
      message: `Restored to version ${versionNumber}`,
    });
  } catch (error) {
    console.error("Restore version error:", error?.message ?? error);
    res.status(500).json({
      success: false,
      error: "Failed to restore version",
    });
  }
};

export const compareVersions = async (req, res) => {
  try {
    const { codeId } = req.params;
    const { version1, version2 } = req.query;

    if (!version1 || !version2) {
      return res.status(400).json({
        success: false,
        error: "Both version numbers are required",
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

    const result = await db.query(
      `SELECT version_number, code, title, created_at
             FROM code_versions
             WHERE code_id = $1 AND version_number IN ($2, $3)
             ORDER BY version_number`,
      [codeId, version1, version2],
    );

    if (result.rows.length !== 2) {
      return res.status(404).json({
        success: false,
        error: "One or both versions not found",
      });
    }

    res.json({
      success: true,
      versions: result.rows,
    });
  } catch (error) {
    console.error("Compare versions error:", error?.message ?? error);
    res.status(500).json({
      success: false,
      error: "Failed to compare versions",
    });
  }
};

export const cleanupOldVersions = async (req, res) => {
  try {
    const { codeId } = req.params;
    const { keepCount = 10 } = req.body;

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
      `DELETE FROM code_versions
             WHERE code_id = $1
             AND version_number NOT IN (
                 SELECT version_number
                 FROM code_versions
                 WHERE code_id = $1
                 ORDER BY version_number DESC
                 LIMIT $2
             )`,
      [codeId, keepCount],
    );

    res.json({
      success: true,
      message: `Cleaned up ${result.rowCount} old versions`,
      deletedCount: result.rowCount,
    });
  } catch (error) {
    console.error("Cleanup versions error:", error?.message ?? error);
    res.status(500).json({
      success: false,
      error: "Failed to cleanup versions",
    });
  }
};

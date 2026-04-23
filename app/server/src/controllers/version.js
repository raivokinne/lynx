/**
 * Version controller
 * Handles code versioning and history
 */
import { Code } from "../models/code.js";
import { db } from "../db/connection.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Create a new version of code (internal helper)
 * @param {string} codeId - Code ID
 * @param {string} code - Code content
 * @param {string} title - Code title
 * @returns {Promise<Object>} Created version info
 */
const createVersion = async (codeId, code, title) => {
  try {
    const versionResult = await db.query(
      `SELECT COALESCE(MAX(version_number), 0) as max_version
       FROM code_versions WHERE code_id = $1`,
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

export { createVersion };

/**
 * Get all versions for a code
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {JSON} Success response with array of versions, or error
 */
export const getVersions = async (req, res) => {
  try {
    const { codeId } = req.params;
    const code = await Code.findById(codeId, req.user.id);

    if (!code) {
      return res.status(404).json({
        success: false,
        error: "Code not found or unauthorized",
      });
    }

    const result = await db.query(
      `SELECT id, version_number, title, created_at, LENGTH(code) as code_length
       FROM code_versions WHERE code_id = $1 ORDER BY version_number DESC`,
      [codeId],
    );

    res.json({ success: true, versions: result.rows });
  } catch (error) {
    console.error("Get versions error:", error?.message ?? error);
    res.status(500).json({ success: false, error: "Failed to fetch versions" });
  }
};

/**
 * Get a specific version of code
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {JSON} Success response with version data, or error
 */
export const getVersion = async (req, res) => {
  try {
    const { codeId, versionNumber } = req.params;
    const code = await Code.findById(codeId, req.user.id);

    if (!code) {
      return res.status(404).json({
        success: false,
        error: "Code not found or unauthorized",
      });
    }

    const result = await db.query(
      `SELECT id, code, title, version_number, created_at
       FROM code_versions WHERE code_id = $1 AND version_number = $2`,
      [codeId, versionNumber],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Version not found",
      });
    }

    res.json({ success: true, version: result.rows[0] });
  } catch (error) {
    console.error("Get version error:", error?.message ?? error);
    res.status(500).json({ success: false, error: "Failed to fetch version" });
  }
};

/**
 * Restore code to a specific version
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {JSON} Success message or error
 */
export const restoreVersion = async (req, res) => {
  try {
    const { codeId, versionNumber } = req.params;
    const code = await Code.findById(codeId, req.user.id);

    if (!code) {
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

    const { code: versionCode, title } = versionResult.rows[0];
    await createVersion(codeId, code.code, code.title);
    await Code.update(codeId, req.user.id, { title, code: versionCode });

    res.json({
      success: true,
      message: `Restored to version ${versionNumber}`,
    });
  } catch (error) {
    console.error("Restore version error:", error?.message ?? error);
    res.status(500).json({ success: false, error: "Failed to restore version" });
  }
};

/**
 * Compare two versions of code
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {JSON} Success response with both versions, or error
 */
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

    const code = await Code.findById(codeId, req.user.id);
    if (!code) {
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

    res.json({ success: true, versions: result.rows });
  } catch (error) {
    console.error("Compare versions error:", error?.message ?? error);
    res.status(500).json({ success: false, error: "Failed to compare versions" });
  }
};

/**
 * Clean up old versions, keeping only the most recent ones
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {JSON} Success message with deleted count, or error
 */
export const cleanupOldVersions = async (req, res) => {
  try {
    const { codeId } = req.params;
    const { keepCount = 10 } = req.body;
    const code = await Code.findById(codeId, req.user.id);

    if (!code) {
      return res.status(404).json({
        success: false,
        error: "Code not found or unauthorized",
      });
    }

    const result = await db.query(
      `DELETE FROM code_versions
       WHERE code_id = $1
       AND version_number NOT IN (
         SELECT version_number FROM code_versions
         WHERE code_id = $1 ORDER BY version_number DESC LIMIT $2
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
    res.status(500).json({ success: false, error: "Failed to cleanup versions" });
  }
};
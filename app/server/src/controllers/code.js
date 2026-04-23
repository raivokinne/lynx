/**
 * Code controller
 * Handles saving, updating, retrieving, listing, and deleting user code
 */
import { Code } from "../models/code.js";
import { db } from "../db/connection.js";
import { v4 as uuidv4 } from "uuid";
import logger from "../../logger.js";

const createVersion = async (codeId, code, title) => {
  const versionResult = await db.query(
    `SELECT COALESCE(MAX(version_number), 0) as max_version FROM code_versions WHERE code_id = $1`,
    [codeId],
  );
  const nextVersion = versionResult.rows[0].max_version + 1;
  await db.query(
    `INSERT INTO code_versions (id, code_id, code, title, version_number) VALUES ($1, $2, $3, $4, $5)`,
    [uuidv4(), codeId, code, title, nextVersion],
  );
};

/**
 * Save new code entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {JSON} Success response with code ID, or error
 */
export const saveCode = async (req, res) => {
  try {
    const { title, code } = req.body;

    if (!code) {
      return res.status(422).json({
        success: false,
        error: "Code is required",
      });
    }

    const { id } = await Code.create(req.user.id, { title, code });
    await createVersion(id, code, title || "Untitled");

    res.json({
      success: true,
      message: "Code saved successfully",
      id,
    });
  } catch (error) {
    logger.error("Save code error:", error?.message ?? error);
    res.status(500).json({
      success: false,
      error: "Failed to save code",
    });
  }
};

/**
 * Update existing code entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {JSON} Success response with updated code ID, or error
 */
export const updateCode = async (req, res) => {
  try {
    const { id, title, code } = req.body;

    if (!id || !code) {
      return res.status(422).json({
        success: false,
        error: "Code and Id are required",
      });
    }

    const existing = await Code.findById(id, req.user.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Code not found or unauthorized",
      });
    }

    if (existing.code !== code) {
      await createVersion(id, existing.code, existing.title);
    }

    const updated = await Code.update(id, req.user.id, { title, code });
    res.json({
      success: true,
      message: "Code updated successfully",
      id: updated.id,
    });
  } catch (error) {
    logger.error("Update code error:", error?.message ?? error);
    res.status(500).json({
      success: false,
      error: "Failed to update code",
    });
  }
};

/**
 * List all code entries for current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {JSON} Success response with array of codes, or error
 */
export const listCode = async (req, res) => {
  try {
    const codes = await Code.findAllByUserId(req.user.id);
    res.json({ success: true, codes });
  } catch (error) {
    logger.error("List code error:", error?.message ?? error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch codes",
    });
  }
};

/**
 * Get single code entry by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {JSON} Success response with code data, or error
 */
export const getCode = async (req, res) => {
  try {
    const { id } = req.params;
    const code = await Code.findById(id, req.user.id);

    if (!code) {
      return res.status(404).json({
        success: false,
        error: "Code not found",
      });
    }

    res.json({ success: true, code });
  } catch (error) {
    logger.error("Get code error:", error?.message ?? error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch code",
    });
  }
};

/**
 * Soft delete (mark as deleted) a code entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {JSON} Success message or error
 */
export const deleteCode = async (req, res) => {
  try {
    const { id } = req.params;
    const permanent = req.query.permanent === "true";

    let deleted;
    if (permanent) {
      deleted = await Code.delete(id, req.user.id);
    } else {
      deleted = await Code.softDelete(id, req.user.id);
    }

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Code not found or unauthorized",
      });
    }

    res.json({
      success: true,
      message: permanent ? "Code permanently deleted" : "Code deleted successfully"
    });
  } catch (error) {
    logger.error("Delete code error:", error?.message ?? error);
    res.status(500).json({
      success: false,
      error: "Failed to delete code",
    });
  }
};

/**
 * Restore a previously deleted code entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {JSON} Success message or error
 */
export const restoreCode = async (req, res) => {
  try {
    const { id } = req.params;
    const restored = await Code.restore(id, req.user.id);

    if (!restored) {
      return res.status(404).json({
        success: false,
        error: "Code not found or already restored",
      });
    }

    res.json({ success: true, message: "Code restored successfully" });
  } catch (error) {
    logger.error("Restore code error:", error?.message ?? error);
    res.status(500).json({
      success: false,
      error: "Failed to restore code",
    });
  }
};

/**
 * Get all soft-deleted code entries for current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {JSON} Success response with array of deleted codes, or error
 */
export const getDeletedCodes = async (req, res) => {
  try {
    const codes = await Code.findDeletedByUserId(req.user.id);
    res.json({ success: true, codes });
  } catch (error) {
    logger.error("Get deleted codes error:", error?.message ?? error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch deleted codes",
    });
  }
};
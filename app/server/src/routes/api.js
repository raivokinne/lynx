import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import * as authController from "../controllers/auth.js";
import * as sessionController from "../controllers/session.js";
import * as codeController from "../controllers/code.js";
import * as sharingController from "../controllers/sharing.js";
import * as versionController from "../controllers/version.js";
import * as historyController from "../controllers/executionHistory.js";
import * as settingsController from "../controllers/settings.js";
import { compilerController } from "../controllers/compiler.js";

const router = express.Router();

// Auth routes - user registration and login
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.post("/auth/logout", authenticateToken, authController.logout);
router.get("/auth/profile", authenticateToken, authController.getProfile);

// Session routes - manage user sessions
router.get("/sessions", authenticateToken, sessionController.getUserSessions);
router.delete("/sessions/:sessionId", authenticateToken, sessionController.revokeSession);
router.delete("/sessions", authenticateToken, sessionController.revokeAllSessions);

// Code routes - CRUD operations for saved code
router.post("/codes", authenticateToken, codeController.saveCode);
router.put("/codes", authenticateToken, codeController.updateCode);
router.get("/codes", authenticateToken, codeController.listCode);
router.get("/codes/:id", authenticateToken, codeController.getCode);
router.delete("/codes/:id", authenticateToken, codeController.deleteCode);
router.post("/codes/:id/restore", authenticateToken, codeController.restoreCode);
router.get("/codes/deleted/list", authenticateToken, codeController.getDeletedCodes);

// Sharing routes - code sharing functionality
router.post("/share", authenticateToken, sharingController.shareCode);
router.get("/share/:token", sharingController.getSharedCode);
router.get("/share/code/:codeId", authenticateToken, sharingController.getCodeShares);
router.put("/share/:token", authenticateToken, sharingController.updateShare);
router.delete("/share/:token", authenticateToken, sharingController.revokeShare);
router.get("/public/shares", sharingController.getPublicShares);

// Version routes - code versioning history
router.get("/versions/:codeId", authenticateToken, versionController.getVersions);
router.get("/versions/:codeId/:versionNumber", authenticateToken, versionController.getVersion);
router.post("/versions/:codeId/:versionNumber/restore", authenticateToken, versionController.restoreVersion);
router.get("/versions/:codeId/compare", authenticateToken, versionController.compareVersions);
router.delete("/versions/:codeId/cleanup", authenticateToken, versionController.cleanupOldVersions);

// Execution history routes - track code runs
router.get("/history/code/:codeId", authenticateToken, historyController.getCodeExecutionHistory);
router.get("/history/user", authenticateToken, historyController.getUserExecutionHistory);
router.get("/history/code/:codeId/stats", authenticateToken, historyController.getCodeExecutionStats);
router.get("/history/user/stats", authenticateToken, historyController.getUserExecutionStats);
router.get("/history/:executionId", authenticateToken, historyController.getExecution);
router.delete("/history/code/:codeId", authenticateToken, historyController.deleteCodeExecutionHistory);

// Compiler route - allows anonymous (unauthenticated) execution
router.post("/compile", compilerController);

// Settings routes - user preferences
router.get("/settings", authenticateToken, settingsController.getSettings);
router.post("/settings", authenticateToken, settingsController.saveSettings);
router.delete("/settings", authenticateToken, settingsController.deleteSettings);

export default router;
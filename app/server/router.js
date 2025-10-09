import express from "express";
import { authenticateToken } from "./middleware.js";

import { register, login, logout, getProfile } from "./handlers/auth.js";

import {
    getUserSessions,
    revokeSession,
    revokeAllSessions,
} from "./handlers/session.js";

import {
    saveCode,
    updateCode,
    listCode,
    getCode,
    deleteCode,
    restoreCode,
    getDeletedCodes,
} from "./handlers/code.js";

import {
    shareCode,
    getSharedCode,
    getCodeShares,
    updateShare,
    revokeShare,
    getPublicShares,
} from "./handlers/sharing.js";

import {
    getVersions,
    getVersion,
    restoreVersion,
    compareVersions,
    cleanupOldVersions,
} from "./handlers/version.js";

import {
    getCodeExecutionHistory,
    getUserExecutionHistory,
    getCodeExecutionStats,
    getUserExecutionStats,
    getExecution,
    deleteCodeExecutionHistory,
} from "./handlers/executionHistory.js";

import { compiler } from "./handlers/compiler.js";

import {
    getSettings,
    saveSettings,
    deleteSettings,
} from "./handlers/settings.js";

const router = express.Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/logout", authenticateToken, logout);
router.get("/auth/profile", authenticateToken, getProfile);

router.get("/sessions", authenticateToken, getUserSessions);
router.delete("/sessions/:sessionId", authenticateToken, revokeSession);
router.delete("/sessions", authenticateToken, revokeAllSessions);

router.post("/codes", authenticateToken, saveCode);
router.put("/codes", authenticateToken, updateCode);
router.get("/codes", authenticateToken, listCode);
router.get("/codes/:id", authenticateToken, getCode);
router.delete("/codes/:id", authenticateToken, deleteCode);
router.post("/codes/:id/restore", authenticateToken, restoreCode);
router.get("/codes/deleted/list", authenticateToken, getDeletedCodes);

router.post("/share", authenticateToken, shareCode);
router.get("/share/:token", getSharedCode); // Public route
router.get("/share/code/:codeId", authenticateToken, getCodeShares);
router.put("/share/:token", authenticateToken, updateShare);
router.delete("/share/:token", authenticateToken, revokeShare);
router.get("/public/shares", getPublicShares); // Public route

router.get("/versions/:codeId", authenticateToken, getVersions);
router.get("/versions/:codeId/:versionNumber", authenticateToken, getVersion);
router.post(
    "/versions/:codeId/:versionNumber/restore",
    authenticateToken,
    restoreVersion,
);
router.get("/versions/:codeId/compare", authenticateToken, compareVersions);
router.delete(
    "/versions/:codeId/cleanup",
    authenticateToken,
    cleanupOldVersions,
);

router.get("/history/code/:codeId", authenticateToken, getCodeExecutionHistory);
router.get("/history/user", authenticateToken, getUserExecutionHistory);
router.get(
    "/history/code/:codeId/stats",
    authenticateToken,
    getCodeExecutionStats,
);
router.get("/history/user/stats", authenticateToken, getUserExecutionStats);
router.get("/history/:executionId", authenticateToken, getExecution);
router.delete(
    "/history/code/:codeId",
    authenticateToken,
    deleteCodeExecutionHistory,
);

router.post("/compile", compiler);

router.get("/settings", authenticateToken, getSettings);
router.post("/settings", authenticateToken, saveSettings);
router.delete("/settings", authenticateToken, deleteSettings);

export default router;

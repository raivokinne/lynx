import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import * as authController from "../controllers/auth.js";
import * as sessionController from "../controllers/session.js";
import * as codeController from "../controllers/code.js";
import * as settingsController from "../controllers/settings.js";
import { compilerController } from "../controllers/compiler.js";

const router = express.Router();

router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.post("/auth/logout", authenticateToken, authController.logout);
router.get("/auth/profile", authenticateToken, authController.getProfile);

router.get("/sessions", authenticateToken, sessionController.getUserSessions);
router.delete("/sessions/:sessionId", authenticateToken, sessionController.revokeSession);
router.delete("/sessions", authenticateToken, sessionController.revokeAllSessions);

router.post("/codes", authenticateToken, codeController.saveCode);
router.put("/codes", authenticateToken, codeController.updateCode);
router.get("/codes", authenticateToken, codeController.listCode);
router.get("/codes/:id", authenticateToken, codeController.getCode);
router.delete("/codes/:id", authenticateToken, codeController.deleteCode);
router.get("/codes/deleted/list", authenticateToken, codeController.getDeletedCodes);

router.post("/compile", compilerController);

router.get("/settings", authenticateToken, settingsController.getSettings);
router.post("/settings", authenticateToken, settingsController.saveSettings);
router.delete("/settings", authenticateToken, settingsController.deleteSettings);

export default router;
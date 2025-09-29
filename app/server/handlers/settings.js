import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";

export const getSettings = async (req, res) => {
    try {
        const result = await db.query(
            "SELECT settings FROM user_settings WHERE user_id = $1",
            [req.user.id]
        );

        if (result.rows.length === 0) {
            const defaultSettings = {
                themeDark: "hc-black",
                themeLight: "vs",
                fontSize: 14,
                minimap: { enabled: true },
                lineNumbers: "on",
                wordWrap: "on",
                tabSize: 2,
                fontFamily: 'Consolas, "Courier New", monospace',
                readOnly: false,
            };
            return res.json({
                success: true,
                settings: defaultSettings,
            });
        }

        res.json({
            success: true,
            settings: JSON.parse(result.rows[0].settings),
        });
    } catch (error) {
        console.error("Get settings error:", error?.message ?? error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch settings",
        });
    }
};

export const saveSettings = async (req, res) => {
    try {
        const { settings } = req.body;
        if (!settings || typeof settings !== "object") {
            return res.status(400).json({
                success: false,
                error: "Settings object is required",
            });
        }

        const settingsJson = JSON.stringify(settings);
        const settingsId = uuidv4();

        await db.query(
            `INSERT INTO user_settings (id, user_id, settings, updated_at)
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
             ON CONFLICT (user_id)
             DO UPDATE SET
                settings = EXCLUDED.settings,
                updated_at = CURRENT_TIMESTAMP`,
            [settingsId, req.user.id, settingsJson]
        );

        res.json({
            success: true,
            message: "Settings saved successfully",
        });
    } catch (error) {
        console.error("Save settings error:", error?.message ?? error);
        res.status(500).json({
            success: false,
            error: "Failed to save settings",
        });
    }
};

export const deleteSettings = async (req, res) => {
    try {
        await db.query("DELETE FROM user_settings WHERE user_id = $1", [req.user.id]);

        res.json({
            success: true,
            message: "Settings reset to default successfully",
        });
    } catch (error) {
        console.error("Reset settings error:", error?.message ?? error);
        res.status(500).json({
            success: false,
            error: "Failed to reset settings",
        });
    }
};

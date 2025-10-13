import { v4 as uuidv4 } from "uuid";
import { db } from "../db.js";

export const logExecution = async (
    userId,
    codeId,
    success,
    output,
    error,
    executionTime,
) => {
    try {
        const historyId = uuidv4();
        await db.query(
            `INSERT INTO execution_history (id, user_id, code_id, success, output, error, execution_time_ms)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [historyId, userId, codeId, success, output, error, executionTime],
        );
        return historyId;
    } catch (error) {
        console.error("Log execution error:", error?.message ?? error);
    }
};

export const getCodeExecutionHistory = async (req, res) => {
    try {
        const { codeId } = req.params;
        const { limit = 20, offset = 0 } = req.query;

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
            `SELECT id, success, output, error, execution_time_ms, executed_at
             FROM execution_history
             WHERE code_id = $1
             ORDER BY executed_at DESC
             LIMIT $2 OFFSET $3`,
            [codeId, limit, offset],
        );

        const countResult = await db.query(
            `SELECT COUNT(*) as total FROM execution_history WHERE code_id = $1`,
            [codeId],
        );

        res.json({
            success: true,
            history: result.rows,
            total: parseInt(countResult.rows[0].total),
        });
    } catch (error) {
        console.error("Get code execution history error:", error?.message ?? error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch execution history",
        });
    }
};

export const getUserExecutionHistory = async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        const result = await db.query(
            `SELECT eh.id, eh.success, eh.output, eh.error, eh.execution_time_ms,
                    eh.executed_at, c.id as code_id, c.title as code_title
             FROM execution_history eh
             LEFT JOIN codes c ON eh.code_id = c.id
             WHERE eh.user_id = $1
             ORDER BY eh.executed_at DESC
             LIMIT $2 OFFSET $3`,
            [req.user.id, limit, offset],
        );

        const countResult = await db.query(
            `SELECT COUNT(*) as total FROM execution_history WHERE user_id = $1`,
            [req.user.id],
        );

        res.json({
            success: true,
            history: result.rows,
            total: parseInt(countResult.rows[0].total),
        });
    } catch (error) {
        console.error("Get user execution history error:", error?.message ?? error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch execution history",
        });
    }
};

export const getCodeExecutionStats = async (req, res) => {
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
            `SELECT
                COUNT(*) as total_executions,
                SUM(CASE WHEN success = true THEN 1 ELSE 0 END) as successful_executions,
                SUM(CASE WHEN success = false THEN 1 ELSE 0 END) as failed_executions,
                AVG(execution_time_ms) as avg_execution_time,
                MIN(execution_time_ms) as min_execution_time,
                MAX(execution_time_ms) as max_execution_time,
                MAX(executed_at) as last_executed
             FROM execution_history
             WHERE code_id = $1`,
            [codeId],
        );

        res.json({
            success: true,
            stats: result.rows[0],
        });
    } catch (error) {
        console.error("Get execution stats error:", error?.message ?? error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch execution statistics",
        });
    }
};

export const getUserExecutionStats = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT
                COUNT(*) as total_executions,
                SUM(CASE WHEN success = true THEN 1 ELSE 0 END) as successful_executions,
                SUM(CASE WHEN success = false THEN 1 ELSE 0 END) as failed_executions,
                AVG(execution_time_ms) as avg_execution_time,
                COUNT(DISTINCT code_id) as unique_codes_executed,
                MAX(executed_at) as last_executed
             FROM execution_history
             WHERE user_id = $1`,
            [req.user.id],
        );

        const dailyStats = await db.query(
            `SELECT
                DATE(executed_at) as date,
                COUNT(*) as executions,
                SUM(CASE WHEN success = true THEN 1 ELSE 0 END) as successful
             FROM execution_history
             WHERE user_id = $1
             AND executed_at >= NOW() - INTERVAL '30 days'
             GROUP BY DATE(executed_at)
             ORDER BY date DESC`,
            [req.user.id],
        );

        res.json({
            success: true,
            stats: result.rows[0],
            dailyStats: dailyStats.rows,
        });
    } catch (error) {
        console.error("Get user execution stats error:", error?.message ?? error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch execution statistics",
        });
    }
};

export const getExecution = async (req, res) => {
    try {
        const { executionId } = req.params;

        const result = await db.query(
            `SELECT eh.*, c.title as code_title
             FROM execution_history eh
             LEFT JOIN codes c ON eh.code_id = c.id
             WHERE eh.id = $1 AND eh.user_id = $2`,
            [executionId, req.user.id],
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Execution record not found",
            });
        }

        res.json({
            success: true,
            execution: result.rows[0],
        });
    } catch (error) {
        console.error("Get execution error:", error?.message ?? error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch execution record",
        });
    }
};

export const deleteCodeExecutionHistory = async (req, res) => {
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
            `DELETE FROM execution_history WHERE code_id = $1`,
            [codeId],
        );

        res.json({
            success: true,
            message: `Deleted ${result.rowCount} execution records`,
            deletedCount: result.rowCount,
        });
    } catch (error) {
        console.error("Delete execution history error:", error?.message ?? error);
        res.status(500).json({
            success: false,
            error: "Failed to delete execution history",
        });
    }
};

export const cleanupOldExecutionHistory = async (days = 30) => {
    try {
        const result = await db.query(
            `DELETE FROM execution_history
             WHERE executed_at < NOW() - INTERVAL '${days} days'`,
        );
        console.log(`Cleaned up ${result.rowCount} old execution records`);
        return result.rowCount;
    } catch (error) {
        console.error("Cleanup execution history error:", error?.message ?? error);
    }
};

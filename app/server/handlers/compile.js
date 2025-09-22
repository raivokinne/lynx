import { existsSync, unlinkSync, writeFileSync } from "fs";
import { join, basename } from "path";
import { v4 as uuidv4 } from "uuid";
import { validateCode } from "../utils.js";
import { CONFIG } from "../index.js";
import { executeCompiler } from "../utils.js";

export const compiler = async (req, res) => {
  let tempFilePath = null;
  try {
    const { code } = req.body;

    const validation = validateCode(code);
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    const filename = `code_${uuidv4()}${CONFIG.FILE_EXTENSION}`;
    tempFilePath = join(CONFIG.TEMP_DIR, filename);

    writeFileSync(tempFilePath, code, "utf8");
    console.log(`Created temp file: ${filename}`);

    const output = await executeCompiler(tempFilePath);

    res.json({
      success: true,
      output: output || "Program executed successfully (no output)",
    });
  } catch (error) {
    console.error("Compilation error:", error?.message ?? error);
    res.json({ success: false, error: error?.message ?? String(error) });
  } finally {
    if (tempFilePath && existsSync(tempFilePath)) {
      try {
        unlinkSync(tempFilePath);
        console.log(`Cleaned up temp file: ${basename(tempFilePath)}`);
      } catch (cleanupError) {
        console.error(
          "Error cleaning up temp file:",
          cleanupError?.message ?? cleanupError,
        );
      }
    }
  }
};

import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const register = async (req, res) => {
    try {
        const { username, password, confirmPassword } = req.body;

        if (!username || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                error: "Username and password and confirmPassword required",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                error: "Confirm Password and Password don't match",
            });
        }

        const passw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/;
        if (!password.match(passw)) {
            return res.status(400).json({ success: false, error: "Bad password" });
        }

        const hashed = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        await db.query(
            "INSERT INTO users (id, username, password) VALUES ($1, $2, $3)",
            [userId, username, hashed]
        );

        res.json({
            success: true,
            message: "User registered successfully",
            user: { id: userId, username },
        });
    } catch (error) {
        console.error("Register error:", error?.message ?? error);
        const message = error && String(error.message).includes("duplicate key")
            ? "Username already taken"
            : "Registration failed";
        res.status(400).json({ success: false, error: message });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: "Username and password required"
            });
        }

        const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({
                success: false,
                error: "Invalid credentials"
            });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({
                success: false,
                error: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({
            success: true,
            token,
            user: { id: user.id, username: user.username },
        });
    } catch (error) {
        console.error("Login error:", error?.message ?? error);
        res.status(500).json({ success: false, error: "Login failed" });
    }
};

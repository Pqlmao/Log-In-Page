const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config();

const pool = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Test backend
app.get("/", (req, res) => {
    res.json({
        message: "Backend is running!"
    });
});

// Test database
app.get("/api/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            success: true,
            message: "Database connection successful!",
            time: result.rows[0].now
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database connection failed."
        });
    }
});

// Register a new user
app.post("/api/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check that both fields were provided
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        // Check if user already exists
        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered."
            });
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 12);

        // Store user in database
        const result = await pool.query(
            `INSERT INTO users (email, password_hash)
             VALUES ($1, $2)
             RETURNING id, email, created_at`,
            [email, passwordHash]
        );

        res.status(201).json({
            success: true,
            message: "Registration successful!",
            user: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Registration failed."
        });
    }
});

// Login
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check that both fields were provided
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        // Find user by email
        const result = await pool.query(
            "SELECT id, email, password_hash FROM users WHERE email = $1",
            [email]
        );

        // Don't reveal whether the email exists
        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const user = result.rows[0];

        // Compare entered password with stored bcrypt hash
        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Login successful
        res.json({
            success: true,
            message: "Login successful!",
            user: {
                id: user.id,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Login failed."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
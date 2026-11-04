const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const mediaRoutes = require("./routes/media");
const profileRoutes = require("./routes/profile");
const pool = require("./config/database");

const app = express();

const PORT = process.env.PORT || 3000;
const allowedOrigins = (
  process.env.CORS_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middleware
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "32kb" }));
app.use("/api/auth", authRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/profile", profileRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MyPlayList API is running.",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    return res.json({ success: true, database: "connected" });
  } catch (error) {
    console.error("Health check database gagal:", error);
    return res.status(503).json({
      success: false,
      database: "unavailable",
      message: "Database belum dapat dihubungi.",
    });
  }
});

app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, message: "Endpoint tidak ditemukan." });
});

app.use((error, req, res, next) => {
  console.error("Permintaan API gagal:", error);
  if (res.headersSent) return next(error);
  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server.",
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`MyPlayList API berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;

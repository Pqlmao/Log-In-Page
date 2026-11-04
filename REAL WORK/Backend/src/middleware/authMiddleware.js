const { createHash } = require("node:crypto");
const pool = require("../config/database");

async function authenticate(req, res, next) {
  const authorization = req.get("authorization") || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      success: false,
      message: "Silakan masuk untuk melanjutkan.",
    });
  }

  try {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const result = await pool.query(
      `SELECT s.id AS session_id, u.id, u.email
       FROM api_sessions s
       JOIN auth_users u ON u.id = s.user_id
       WHERE s.token_hash = $1
         AND s.expires_at > NOW()
         AND u.is_active = true
       LIMIT 1`,
      [tokenHash],
    );

    if (!result.rows[0]) {
      return res.status(401).json({
        success: false,
        message: "Sesi masuk tidak valid atau sudah berakhir.",
      });
    }

    req.user = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      sessionId: result.rows[0].session_id,
    };
    return next();
  } catch (error) {
    console.error("Validasi sesi gagal:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
    });
  }
}

function authenticateOptional(req, res, next) {
  if (!req.get("authorization")) return next();
  return authenticate(req, res, next);
}

module.exports = { authenticate, authenticateOptional };

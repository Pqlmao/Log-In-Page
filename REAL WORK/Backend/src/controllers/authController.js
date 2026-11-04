const bcrypt = require("bcrypt");
const { createHash, randomBytes } = require("node:crypto");
const pool = require("../config/database");

async function login(req, res) {
  const { email, password } = req.body ?? {};

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).json({
      success: false,
      message: "Email dan kata sandi wajib diisi.",
    });
  }

  try {
    const result = await pool.query(
      `SELECT id, email, password_hash, is_active
       FROM auth_users
       WHERE email = $1
       LIMIT 1`,
      [email.trim().toLowerCase()],
    );
    const user = result.rows[0];

    if (
      !user ||
      !user.is_active ||
      !(await bcrypt.compare(password, user.password_hash))
    ) {
      return res.status(401).json({
        success: false,
        message: "Email atau kata sandi salah.",
      });
    }

    const usernameBase =
      user.email
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 20) || "user";
    await pool.query(
      `INSERT INTO profiles (id, username, display_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO NOTHING`,
      [user.id, `${usernameBase}-${user.id.slice(0, 8)}`, usernameBase],
    );

    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO api_sessions (user_id, token_hash, user_agent, ip_address, expires_at)
         VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')`,
        [user.id, tokenHash, req.get("user-agent") || null, req.ip || null],
      );
      await client.query(
        "UPDATE auth_users SET last_login_at = NOW() WHERE id = $1",
        [user.id],
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    const profileResult = await pool.query(
      `SELECT username, display_name, avatar_url, bio, is_verified
       FROM profiles
       WHERE id = $1`,
      [user.id],
    );

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        ...profileResult.rows[0],
      },
      token,
    });
  } catch (error) {
    console.error("Login gagal:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
    });
  }
}

async function logout(req, res) {
  try {
    await pool.query("DELETE FROM api_sessions WHERE id = $1", [
      req.user.sessionId,
    ]);
    return res.json({ success: true });
  } catch (error) {
    console.error("Logout gagal:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengakhiri sesi.",
    });
  }
}

module.exports = { login, logout };

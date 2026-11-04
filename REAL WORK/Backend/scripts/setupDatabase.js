const bcrypt = require("bcrypt");
const fs = require("node:fs/promises");
const path = require("node:path");
const { Pool } = require("pg");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL belum diatur pada file .env backend.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false },
});

async function setupDatabase() {
  const schemaPath = path.resolve(__dirname, "../../Database/schema.sql");
  const schema = await fs.readFile(schemaPath, "utf8");
  await pool.query(schema);

  const email = (process.env.DEMO_EMAIL || "test@gmail.com")
    .trim()
    .toLowerCase();
  const password = process.env.DEMO_PASSWORD || "1234";
  if (!email || !password) {
    throw new Error("DEMO_EMAIL dan DEMO_PASSWORD tidak boleh kosong.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const user = await client.query(
      `INSERT INTO auth_users (email, password_hash, is_active)
       VALUES ($1, $2, true)
       ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash, is_active = true
       RETURNING id`,
      [email, passwordHash],
    );
    await client.query(
      `INSERT INTO profiles (id, username, display_name, bio, is_verified)
       VALUES ($1, 'Imustlarp', 'Larp', 'I Have No personality I Must Larp', true)
       ON CONFLICT (id) DO UPDATE
       SET username = EXCLUDED.username,
           display_name = EXCLUDED.display_name,
           bio = EXCLUDED.bio,
           is_verified = EXCLUDED.is_verified,
           updated_at = NOW()`,
      [user.rows[0].id],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  console.log(`Skema siap. Akun demo lokal dibuat untuk ${email}.`);
}

setupDatabase()
  .catch((error) => {
    console.error("Setup database gagal:", error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());

const { Pool } = require("pg");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL belum diatur. Isi variabel ini di file .env backend.",
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false },
});

module.exports = pool;

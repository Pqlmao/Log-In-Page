const { Pool } = require("pg");
require("dotenv").config();

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_59cVJbpXgKeP@ep-purple-base-b325kosb-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;

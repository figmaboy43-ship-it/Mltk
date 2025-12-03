// netlify/functions/_db.js
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function db(query, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return { rows: result.rows };
  } finally {
    client.release();
  }
}

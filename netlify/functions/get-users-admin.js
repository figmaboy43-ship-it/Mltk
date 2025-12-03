// netlify/functions/get-users-admin.js
import { db } from "./_db.js";

export async function handler(event) {
  const key = event.headers["x-admin-key"];
  if (key !== process.env.ADMIN_KEY) {
    return { statusCode: 403, body: JSON.stringify({ message: "Invalid admin key" }) };
  }

  const result = await db(
    `SELECT id,name,email,role,balance,banned,created_at FROM users ORDER BY created_at DESC`
  );

  return {
    statusCode: 200,
    body: JSON.stringify(result.rows)
  };
}

// netlify/functions/get-withdraws-admin.js
import { db } from "./_db.js";

export async function handler(event) {
  const key = event.headers["x-admin-key"];
  if (key !== process.env.ADMIN_KEY) {
    return { statusCode: 403, body: JSON.stringify({ message: "Invalid admin key" }) };
  }

  const rows = await db(
    `SELECT w.*, u.email AS user_email
     FROM withdraws w
     LEFT JOIN users u ON u.id = w.user_id
     ORDER BY w.requested_at DESC`
  );

  return {
    statusCode: 200,
    body: JSON.stringify(rows.rows)
  };
}

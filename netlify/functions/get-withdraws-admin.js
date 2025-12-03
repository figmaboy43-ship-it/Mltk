// netlify/functions/get-withdraws-admin.js
import { db } from "./_db.js";

export async function handler(event) {
  const key = event.headers["x-admin-key"];
  if (key !== process.env.ADMIN_KEY) return { statusCode: 403, body: JSON.stringify({ message: "Invalid admin key" }) };

  try {
    const res = await db(
      `SELECT w.id,w.user_id,w.amount,w.method,w.number,w.note,w.status,w.requested_at,w.processed_at,w.processed_by,
              u.email AS user_email,u.name AS user_name
       FROM withdraws w
       LEFT JOIN users u ON u.id = w.user_id
       ORDER BY w.requested_at DESC`
    );
    return { statusCode: 200, body: JSON.stringify(res.rows) };
  } catch (err) {
    console.error("get-withdraws-admin err:", err);
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
}

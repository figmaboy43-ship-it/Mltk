// netlify/functions/get-my-withdraws.js
import { db } from "./_db.js";
import { verifyToken } from "./_auth.js";

export async function handler(event) {
  const token = verifyToken(event.headers);
  if (!token) return { statusCode: 401, body: JSON.stringify({ message: "Unauthorized" }) };

  try {
    const res = await db(
      `SELECT id, amount, method, number, note, status, requested_at, processed_at
       FROM withdraws WHERE user_id=$1 ORDER BY requested_at DESC`,
      [token.sub]
    );
    return { statusCode: 200, body: JSON.stringify(res.rows || []) };
  } catch (err) {
    console.error("get-my-withdraws err:", err);
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
}

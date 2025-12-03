// netlify/functions/get-my-profile.js
import { db } from "./_db.js";
import { verifyToken } from "./_auth.js";

export async function handler(event) {
  const token = verifyToken(event.headers);
  if (!token) return { statusCode: 401, body: JSON.stringify({ message: "Unauthorized" }) };

  try {
    const res = await db("SELECT id,name,email,role,balance,banned,created_at FROM users WHERE id=$1 LIMIT 1", [token.sub]);
    const user = res.rows && res.rows[0];
    if (!user) return { statusCode: 404, body: JSON.stringify({ message: "User not found" }) };
    return { statusCode: 200, body: JSON.stringify(user) };
  } catch (err) {
    console.error("get-my-profile err:", err);
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
}

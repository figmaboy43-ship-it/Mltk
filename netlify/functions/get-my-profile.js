// netlify/functions/get-my-profile.js
import { db } from "./_db.js";
import { verifyToken } from "./_auth.js";

export async function handler(event) {
  const token = verifyToken(event.headers);

  if (!token) {
    return { statusCode: 401, body: JSON.stringify({ message: "Unauthorized" }) };
  }

  const result = await db(`SELECT id,name,email,role,balance,banned FROM users WHERE id=$1`, [
    token.sub
  ]);

  return {
    statusCode: 200,
    body: JSON.stringify(result.rows[0] || {})
  };
}

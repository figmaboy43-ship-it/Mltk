// netlify/functions/create-withdraw-public.js
import { db } from "./_db.js";
import { verifyToken } from "./_auth.js";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const token = verifyToken(event.headers);
  if (!token) return { statusCode: 401, body: JSON.stringify({ message: "Unauthorized" }) };

  try {
    const { amount, method, number, note } = JSON.parse(event.body || "{}");

    if (!amount || amount <= 0) {
      return { statusCode: 400, body: JSON.stringify({ message: "Invalid amount" }) };
    }

    // Check user banned
    const userCheck = await db(`SELECT banned FROM users WHERE id=$1`, [token.sub]);
    if (userCheck.rows[0]?.banned) {
      return { statusCode: 403, body: JSON.stringify({ message: "User is banned" }) };
    }

    // Insert withdraw
    const wd = await db(
      `INSERT INTO withdraws (user_id, amount, method, number, note)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [token.sub, amount, method, number, note]
    );

    return {
      statusCode: 201,
      body: JSON.stringify({ ok: true, data: wd.rows[0] })
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ ok: false, message: err.message })
    };
  }
}

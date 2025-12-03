// netlify/functions/create-withdraw-public.js
import { db } from "./_db.js";
import { verifyToken } from "./_auth.js";

export async function handler(event) {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };

  const token = verifyToken(event.headers);
  if (!token) return { statusCode: 401, body: JSON.stringify({ message: "Unauthorized" }) };

  try {
    const { amount, method, number, note } = JSON.parse(event.body || "{}");
    if (!amount || amount <= 0) return { statusCode: 400, body: JSON.stringify({ message: "Invalid amount" }) };
    if (!method || !number) return { statusCode: 400, body: JSON.stringify({ message: "Invalid payload" }) };

    // check banned
    const u = await db("SELECT banned, balance FROM users WHERE id=$1 LIMIT 1", [token.sub]);
    const user = u.rows && u.rows[0];
    if (!user) return { statusCode: 404, body: JSON.stringify({ message: "User not found" }) };
    if (user.banned) return { statusCode: 403, body: JSON.stringify({ message: "User banned" }) };

    // OPTIONAL: ensure user has sufficient balance before allowing withdraw
    // If you want immediate reservation: uncomment below
    // if (Number(user.balance) < Number(amount)) return { statusCode: 400, body: JSON.stringify({ message: "Insufficient balance" }) };

    const res = await db(
      `INSERT INTO withdraws (user_id, amount, method, number, note) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [token.sub, amount, method, number, note]
    );

    return { statusCode: 201, body: JSON.stringify({ ok: true, data: res.rows[0] }) };
  } catch (err) {
    console.error("create-withdraw err:", err);
    return { statusCode: 500, body: JSON.stringify({ ok: false, message: err.message }) };
  }
}

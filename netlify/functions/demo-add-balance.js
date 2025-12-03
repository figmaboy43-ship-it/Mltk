// netlify/functions/demo-add-balance.js
import { db } from "./_db.js";
import { verifyToken } from "./_auth.js";

export async function handler(event) {
  const token = verifyToken(event.headers);
  if (!token) return { statusCode: 401, body: JSON.stringify({ message: "Unauthorized" }) };

  try {
    const { amount } = JSON.parse(event.body || "{}");
    if (!amount) return { statusCode: 400, body: JSON.stringify({ message: "Missing amount" }) };

    const res = await db("UPDATE users SET balance = balance + $1 WHERE id=$2 RETURNING balance", [amount, token.sub]);
    const newBal = res.rows && res.rows[0] && res.rows[0].balance;
    // optional transaction log
    await db("INSERT INTO transactions (user_id,type,amount,reason) VALUES ($1,$2,$3,$4)", [token.sub, "credit", amount, "demo add"]);

    return { statusCode: 200, body: JSON.stringify({ ok: true, balance: newBal }) };
  } catch (err) {
    console.error("demo-add-balance err:", err);
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
}

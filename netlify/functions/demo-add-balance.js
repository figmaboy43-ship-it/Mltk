// netlify/functions/demo-add-balance.js
import { db } from "./_db.js";
import { verifyToken } from "./_auth.js";

export async function handler(event) {
  const token = verifyToken(event.headers);
  if (!token)
    return { statusCode: 401, body: JSON.stringify({ message: "Unauthorized" }) };

  const { amount } = JSON.parse(event.body || "{}");

  const newBalance = await db(
    `UPDATE users SET balance = balance + $1 WHERE id=$2 RETURNING balance`,
    [amount, token.sub]
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      ok: true,
      balance: newBalance.rows[0].balance
    })
  };
}

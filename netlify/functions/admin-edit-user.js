// netlify/functions/admin-edit-user.js
import { db } from "./_db.js";

export async function handler(event) {
  const key = event.headers["x-admin-key"];
  if (key !== process.env.ADMIN_KEY) return { statusCode: 403, body: JSON.stringify({ message: "Invalid admin key" }) };

  try {
    const { user_id, balance } = JSON.parse(event.body || "{}");
    if (!user_id || balance === undefined) return { statusCode: 400, body: JSON.stringify({ message: "Missing params" }) };

    await db("UPDATE users SET balance=$1 WHERE id=$2", [balance, user_id]);

    // optional: insert transaction log
    await db(`INSERT INTO transactions (user_id,type,amount,reason) VALUES ($1,$2,$3,$4)`, [user_id, "adjustment", balance, "admin edit"]);

    return { statusCode: 200, body: JSON.stringify({ ok: true, message: "balance updated" }) };
  } catch (err) {
    console.error("admin-edit-user err:", err);
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
}

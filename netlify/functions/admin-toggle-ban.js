// netlify/functions/admin-toggle-ban.js
import { db } from "./_db.js";

export async function handler(event) {
  const key = event.headers["x-admin-key"];
  if (key !== process.env.ADMIN_KEY) {
    return { statusCode: 403, body: JSON.stringify({ message: "Invalid admin key" }) };
  }

  const { user_id, ban } = JSON.parse(event.body || "{}");

  await db(`UPDATE users SET banned=$1 WHERE id=$2`, [ban, user_id]);

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, message: ban ? "banned" : "unbanned" })
  };
}

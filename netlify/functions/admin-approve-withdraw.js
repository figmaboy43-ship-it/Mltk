// netlify/functions/admin-approve-withdraw.js
import { db } from "./_db.js";

export async function handler(event) {
  const key = event.headers["x-admin-key"];
  if (key !== process.env.ADMIN_KEY) {
    return { statusCode: 403, body: JSON.stringify({ message: "Invalid admin key" }) };
  }

  const { withdraw_id, action } = JSON.parse(event.body || "{}");

  const wd = await db(`SELECT * FROM withdraws WHERE id=$1`, [withdraw_id]);
  const row = wd.rows[0];

  if (!row) return { statusCode: 404, body: JSON.stringify({ message: "Not found" }) };
  if (row.status !== "pending")
    return { statusCode: 400, body: JSON.stringify({ message: "Already processed" }) };

  // APPROVE
  if (action === "approve") {
    await db(
      `UPDATE withdraws
       SET status='paid', processed_at=NOW(), processed_by='admin'
       WHERE id=$1`,
      [withdraw_id]
    );

    return { statusCode: 200, body: JSON.stringify({ ok: true, message: "approved" }) };
  }

  // REJECT
  if (action === "reject") {
    await db(
      `UPDATE withdraws
       SET status='rejected', processed_at=NOW(), processed_by='admin'
       WHERE id=$1`,
      [withdraw_id]
    );

    return { statusCode: 200, body: JSON.stringify({ ok: true, message: "rejected" }) };
  }

  return { statusCode: 400, body: JSON.stringify({ message: "Invalid action" }) };
}

// netlify/functions/admin-approve-withdraw.js
import { pool } from "./_db.js";

export async function handler(event) {
  const key = event.headers["x-admin-key"];
  if (key !== process.env.ADMIN_KEY) return { statusCode: 403, body: JSON.stringify({ message: "Invalid admin key" }) };

  try {
    const { withdraw_id, action } = JSON.parse(event.body || "{}");
    if (!withdraw_id || !action) return { statusCode: 400, body: JSON.stringify({ message: "Missing params" }) };

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const wdRes = await client.query("SELECT * FROM withdraws WHERE id=$1 FOR UPDATE", [withdraw_id]);
      const wd = wdRes.rows[0];
      if (!wd) {
        await client.query("ROLLBACK");
        return { statusCode: 404, body: JSON.stringify({ message: "Withdraw not found" }) };
      }
      if (wd.status !== "pending") {
        await client.query("ROLLBACK");
        return { statusCode: 400, body: JSON.stringify({ message: "Already processed" }) };
      }

      if (action === "approve") {
        // Deduct balance (if you didn't deduct earlier)
        // Check user's balance
        const userRes = await client.query("SELECT balance FROM users WHERE id=$1 FOR UPDATE", [wd.user_id]);
        const user = userRes.rows[0];
        const newBalance = Number(user.balance) - Number(wd.amount);
        if (newBalance < 0) {
          // optional: allow negative? Here we reject approve if insufficient balance
          await client.query("ROLLBACK");
          return { statusCode: 400, body: JSON.stringify({ message: "Insufficient user balance" }) };
        }

        await client.query("UPDATE users SET balance=$1 WHERE id=$2", [newBalance, wd.user_id]);
        await client.query(
          `UPDATE withdraws SET status='paid', processed_at=NOW(), processed_by=$1 WHERE id=$2`,
          [process.env.ADMIN_KEY || "admin", withdraw_id]
        );

        // optional: insert to transactions table if exists
        await client.query(
          `INSERT INTO transactions (user_id, type, amount, reason, related_withdraw) VALUES ($1,$2,$3,$4,$5)`,
          [wd.user_id, "debit", wd.amount, "withdraw approved", withdraw_id]
        );

        await client.query("COMMIT");
        return { statusCode: 200, body: JSON.stringify({ ok: true, message: "approved" }) };
      } else if (action === "reject") {
        await client.query(
          `UPDATE withdraws SET status='rejected', processed_at=NOW(), processed_by=$1 WHERE id=$2`,
          [process.env.ADMIN_KEY || "admin", withdraw_id]
        );
        await client.query("COMMIT");
        return { statusCode: 200, body: JSON.stringify({ ok: true, message: "rejected" }) };
      } else {
        await client.query("ROLLBACK");
        return { statusCode: 400, body: JSON.stringify({ message: "Invalid action" }) };
      }
    } catch (txErr) {
      await client.query("ROLLBACK");
      console.error("approve tx err:", txErr);
      return { statusCode: 500, body: JSON.stringify({ message: txErr.message }) };
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("admin-approve err:", err);
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
}

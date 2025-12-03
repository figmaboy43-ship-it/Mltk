// netlify/functions/public-login.js
import { db } from "./_db.js";
import bcrypt from "bcryptjs";
import { signToken } from "./_auth.js";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const { email, password } = JSON.parse(event.body || "{}");

    const result = await db(`SELECT * FROM users WHERE email=$1 LIMIT 1`, [email]);
    const user = result.rows[0];

    if (!user) {
      return { statusCode: 401, body: JSON.stringify({ message: "Invalid credentials" }) };
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return { statusCode: 401, body: JSON.stringify({ message: "Invalid credentials" }) };
    }

    const token = signToken(user);

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          balance: user.balance
        }
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, message: err.message })
    };
  }
}

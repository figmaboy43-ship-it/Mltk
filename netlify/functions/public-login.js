// netlify/functions/public-login.js
import { db } from "./_db.js";
import bcrypt from "bcryptjs";
import { signToken } from "./_auth.js";

export async function handler(event) {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };

  try {
    const { email, password } = JSON.parse(event.body || "{}");
    if (!email || !password) return { statusCode: 400, body: JSON.stringify({ message: "Missing credentials" }) };

    const res = await db("SELECT id, name, email, password_hash, role, balance, banned FROM users WHERE email=$1 LIMIT 1", [email]);
    const user = res.rows && res.rows[0];
    if (!user) return { statusCode: 401, body: JSON.stringify({ message: "Invalid credentials" }) };
    if (user.banned) return { statusCode: 403, body: JSON.stringify({ message: "User banned" }) };

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return { statusCode: 401, body: JSON.stringify({ message: "Invalid credentials" }) };

    const token = signToken(user);
    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, balance: user.balance }
      })
    };
  } catch (err) {
    console.error("login err:", err);
    return { statusCode: 500, body: JSON.stringify({ ok: false, message: err.message }) };
  }
}

// netlify/functions/public-register.js
import { db } from "./_db.js";
import bcrypt from "bcryptjs";

export async function handler(event) {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };

  try {
    const { name, email, password } = JSON.parse(event.body || "{}");
    if (!name || !email || !password) return { statusCode: 400, body: JSON.stringify({ message: "Missing fields" }) };

    // check existing
    const existing = await db("SELECT id FROM users WHERE email=$1 LIMIT 1", [email]);
    if (existing.rows && existing.rows.length > 0) {
      return { statusCode: 409, body: JSON.stringify({ message: "Email already registered" }) };
    }

    const hash = await bcrypt.hash(password, 10);
    await db("INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3)", [name, email, hash]);

    return { statusCode: 201, body: JSON.stringify({ ok: true, message: "registered" }) };
  } catch (err) {
    console.error("register err:", err);
    return { statusCode: 500, body: JSON.stringify({ ok: false, message: err.message }) };
  }
}

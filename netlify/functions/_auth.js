// netlify/functions/_auth.js
import jwt from "jsonwebtoken";
const SECRET = process.env.JWT_SECRET || "change_this_in_env";

export function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      balance: user.balance
    },
    SECRET,
    { expiresIn: "7d" }
  );
}

// Accepts event.headers (plain object) or a header-like object
export function verifyToken(headers) {
  if (!headers) return null;
  const auth = headers.authorization || headers.Authorization || headers["Authorization"] || headers["authorization"];
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.replace("Bearer ", "");
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
}

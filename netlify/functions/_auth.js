// netlify/functions/_auth.js
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

// Create JWT for login
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
    { expiresIn: "7d" } // adjust as needed
  );
}

// Verify JWT for protected endpoints
export function verifyToken(headers) {
  const auth = headers.get("authorization") || headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.replace("Bearer ", "");

  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
}

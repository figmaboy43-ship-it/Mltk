// netlify/functions/_db.js
import fetch from "node-fetch";

const NEON_URL = process.env.NEON_REST_URL;
const NEON_KEY = process.env.NEON_SERVICE_KEY;

// Run SQL through Neon REST API
export async function db(query, params = []) {
  const body = {
    sql: query,
    params: params
  };

  const res = await fetch(NEON_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${NEON_KEY}`
    },
    body: JSON.stringify(body)
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "DB error");
  }

  return json; // { rows: [...] }
}

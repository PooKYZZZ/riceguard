const BASE_URL =
  import.meta?.env?.VITE_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000/api/v1";

function jsonHeaders() {
  return { "Content-Type": "application/json" };
}

export async function register({ name, email, password }) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Register failed");
  return res.json(); // { id, name, email }
}

export async function login({ email, password }) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Login failed");
  return res.json(); // { accessToken, user:{id,name,email} }
}

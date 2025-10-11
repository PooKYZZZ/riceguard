// src/api.js

const BASE_URL =
  import.meta?.env?.VITE_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000/api/v1";

// Derive backend origin (e.g., http://127.0.0.1:8000) from BASE_URL
export const BACKEND_BASE = BASE_URL.replace(/\/?api\/?v\d+.*/i, "").replace(/\/$/, "");

function jsonHeaders() {
  return { "Content-Type": "application/json" };
}

function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
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

export async function uploadScan({ file, notes = null, modelVersion = "1.0", token }) {
  const form = new FormData();
  form.append("file", file);
  if (notes != null) form.append("notes", notes);
  form.append("modelVersion", modelVersion);

  const res = await fetch(`${BASE_URL}/scans`, {
    method: "POST",
    headers: { ...authHeader(token) },
    body: form,
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Upload failed");
  return res.json(); // ScanItem
}

export async function listScans(token) {
  const res = await fetch(`${BASE_URL}/scans`, {
    headers: { ...authHeader(token) },
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Fetch scans failed");
  return res.json(); // { items: ScanItem[] }
}

// ✅ Original delete endpoints (kept for compatibility)
export async function deleteScan(token, id) {
  const res = await fetch(`${BASE_URL}/scans/${id}`, {
    method: "DELETE",
    headers: { ...authHeader(token) },
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Delete scan failed");
  return res.json(); // { deleted: true, id }
}

export async function bulkDeleteScans(token, ids) {
  const res = await fetch(`${BASE_URL}/scans/bulk-delete`, {
    method: "POST",
    headers: { ...authHeader(token), ...jsonHeaders() },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Bulk delete failed");
  return res.json(); // { deletedCount: number }
}

export async function getRecommendation(diseaseKey) {
  const res = await fetch(`${BASE_URL}/recommendations/${encodeURIComponent(diseaseKey)}`);
  if (!res.ok) throw new Error((await res.json()).detail || "Fetch recommendation failed");
  return res.json(); // { diseaseKey, title, steps, version, updatedAt }
}

// ✅ Fixed buildImageUrl with support for full absolute URLs
export function buildImageUrl(relPath) {
  if (!relPath) return null;
  if (/^https?:\/\//i.test(relPath)) return relPath; // already absolute
  const clean = String(relPath).replace(/^\/+/, "");
  return `${BACKEND_BASE}/${clean}`;
}

// ✅ Added simplified variants (new naming)
export async function deleteScanSimple(id, token) {
  const res = await fetch(`${BASE_URL}/scans/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { ...authHeader(token) },
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Delete failed");
  return res.json(); // { deleted: true, id }
}

export async function bulkDelete(ids, token) {
  const res = await fetch(`${BASE_URL}/scans/bulk-delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader(token) },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Bulk delete failed");
  return res.json(); // { deletedCount }
}

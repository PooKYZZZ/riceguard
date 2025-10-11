import { API_BASE_URL } from './config';

export async function uploadImageAsync(uri) {
  const fileName = uri.split('/').pop() || 'photo.jpg';
  const match = /\.([^.]+)$/.exec(fileName);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  const data = new FormData();
  data.append('file', { uri, name: fileName, type });

  const res = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    body: data,
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchHistory() {
  const res = await fetch(`${API_BASE_URL}/history`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function clearHistory() {
  try {
    await fetch(`${API_BASE_URL}/history/clear`, { method: 'POST' });
  } catch (_) {}
}

export async function deleteHistoryByTimestamps(timestamps) {
  try {
    await fetch(`${API_BASE_URL}/history/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamps }),
    });
  } catch (_) {}
}


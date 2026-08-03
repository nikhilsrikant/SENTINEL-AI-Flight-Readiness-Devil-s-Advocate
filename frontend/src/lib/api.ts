const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: { message: `HTTP ${res.status}` } }));
    throw new Error(errorData?.error?.message || `API Error: ${res.status}`);
  }

  const json = await res.json();
  if (json.status === 'error') throw new Error(json.error?.message || 'API Error');
  return json.data;
}

export function getWebSocketUrl(): string {
  const apiUrl = API_BASE.replace('/api/v1', '');
  const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
  const host = apiUrl.replace(/^https?:\/\//, '');
  return `${wsProtocol}://${host}/api/v1/telemetry_engine/stream`;
}

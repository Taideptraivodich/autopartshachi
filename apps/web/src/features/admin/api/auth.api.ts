const BASE = "http://localhost:3001/api";

const ADMIN_TOKEN_KEY = "admin_token";

/** Persist the JWT in localStorage so sessions survive page reloads and multi-tab use. */
export function saveToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function clearToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

/**
 * POST /api/admin/login
 * Returns the JWT on success, throws on network error or non-2xx response.
 */
export async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${BASE}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const body = (await res.json()) as { token?: string; error?: string };

  if (!res.ok) {
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }

  if (!body.token) throw new Error("Server did not return a token");

  saveToken(body.token);
  return body.token;
}

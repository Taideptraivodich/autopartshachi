/**
 * adminApiFetch — identical to the public apiFetch but automatically attaches
 * the Authorization: Bearer <token> header for every /api/admin/* call.
 *
 * Handover #2 should import this instead of writing its own fetch wrapper.
 *
 * Usage:
 *   const data = await adminApiFetch<{ items: Product[] }>('/admin/san-pham');
 */

import { getToken } from "./auth.api";

const BASE = "http://localhost:3001/api";

export async function adminApiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

import { readServerKey } from "./config";

/**
 * Fetch a LingualDub `/v1` endpoint, attaching the optional server bearer token.
 *
 * `/health` is public and should be fetched directly so the UI can distinguish
 * "server offline" from "server requires an API key".
 */
export function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const key = readServerKey();
  if (key) headers.set("Authorization", `Bearer ${key}`);
  return fetch(input, { ...init, headers });
}

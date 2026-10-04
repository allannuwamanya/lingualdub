/**
 * Optional dev-time default for the Sunbird API token.
 * Set VITE_SUNBIRD_API_KEY in website/.env.local (git-ignored). Never commit a real key.
 * End users can also paste a token in the Studio; it is stored only in their browser.
 */
export const DEFAULT_SUNBIRD_KEY: string = import.meta.env.VITE_SUNBIRD_API_KEY ?? "";

export const SUNBIRD_KEY_STORAGE = "sunbird_api_key";
export const SUNBIRD_KEY_EVENT = "sunbird_key_updated";

export function readSunbirdKey(): string {
  if (typeof window === "undefined") return DEFAULT_SUNBIRD_KEY;
  return localStorage.getItem(SUNBIRD_KEY_STORAGE) || DEFAULT_SUNBIRD_KEY;
}

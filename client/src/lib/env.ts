/**
 * Environment configuration with validation.
 * Import this instead of accessing import.meta.env directly.
 */

function getEnvVar(key: string): string | undefined {
  const value = import.meta.env[key] as string | undefined;
  return value?.trim() || undefined;
}

function requireEnvVar(key: string): string {
  const value = getEnvVar(key);
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  /** Google OAuth Client ID - required for authentication */
  googleClientId: requireEnvVar("VITE_GOOGLE_CLIENT_ID"),

  /** API base URL - optional, app shows warning if missing */
  apiBaseUrl: getEnvVar("VITE_API_BASE_URL")?.replace(/\/+$/, ""),
} as const;

/** Check if API is configured */
export const isApiConfigured = (): boolean => Boolean(env.apiBaseUrl);

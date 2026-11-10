export const DEFAULT_AUTH_REDIRECT = "/account";

// Only same-origin relative paths are allowed, so `?redirectTo=` can't be used
// as an open redirect ("//evil.com" and "/\evil.com" are protocol-relative).
export function safeRedirect(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return DEFAULT_AUTH_REDIRECT;
  }
  return value;
}

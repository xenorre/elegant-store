type AuthError = { code?: string; status?: number; message?: string };

const messages: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "That email and password don't match. Please try again.",
  INVALID_PASSWORD: "Your current password is incorrect.",
  PASSWORD_TOO_SHORT: "Your password must be at least 8 characters.",
  PASSWORD_TOO_LONG: "Your password must be at most 128 characters.",
  INVALID_TOKEN: "This link has expired or has already been used.",
  EMAIL_NOT_VERIFIED: "Please confirm your email address before signing in.",
};

// Maps Better Auth client errors to customer-facing copy.
export function authErrorMessage(error: AuthError) {
  if (error.status === 429) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  return (error.code && messages[error.code]) ?? "Something went wrong. Please try again.";
}

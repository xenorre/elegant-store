import { createAuthClient } from "better-auth/react";

// No baseURL: the client calls /api/auth on whatever origin the page was
// loaded from, so it works on localhost, a LAN IP, or the production domain.
export const authClient = createAuthClient();

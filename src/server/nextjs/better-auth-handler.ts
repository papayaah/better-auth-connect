import { toNextJsHandler } from "better-auth/next-js";

/**
 * Create Next.js App Router route handlers for Better Auth.
 *
 * Usage in a Next.js app:
 * - Create: src/app/api/auth/[...all]/route.ts
 * - Re-export: GET/POST from createBetterAuthRouteHandlers(auth)
 *
 * The returned handlers handle:
 * - POST /api/auth/sign-in/social
 * - POST /api/auth/link-social
 * - GET  /api/auth/callback/{provider}
 * - GET  /api/auth/session
 */
export function createBetterAuthRouteHandlers(auth: any) {
  return toNextJsHandler(auth);
}




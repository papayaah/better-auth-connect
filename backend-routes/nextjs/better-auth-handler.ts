/**
 * Better Auth Route Handler (Required)
 * 
 * Copy this to: src/app/api/auth/[...all]/route.ts
 * 
 * This is REQUIRED - Better Auth needs this route to handle OAuth callbacks
 */

import { auth } from "@/lib/auth"; // Your Better Auth instance
import { toNextJsHandler } from "better-auth/next-js";

/**
 * This creates all Better Auth routes automatically:
 * - POST /api/auth/sign-in/social
 * - GET  /api/auth/callback/{provider}
 * - POST /api/auth/link-social
 * - GET  /api/auth/session
 * - POST /api/auth/sign-out
 * - etc.
 */
export const { GET, POST } = toNextJsHandler(auth);

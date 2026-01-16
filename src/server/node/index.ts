import { toNodeHandler, fromNodeHeaders } from "better-auth/node";

/**
 * Create a Node.js (IncomingMessage/ServerResponse) handler for Better Auth.
 *
 * This is the "write once" callback/API server for any Node HTTP server.
 *
 * Express example:
 * ```ts
 * import express from "express";
 * import { auth } from "./auth";
 * import { createBetterAuthNodeHandler } from "@reactkits.dev/better-auth-connect/server/node";
 *
 * const app = express();
 * const handler = createBetterAuthNodeHandler(auth);
 *
 * // Mount under /api/auth so callback URLs like:
 * //   /api/auth/callback/google
 * // are handled correctly.
 * app.all("/api/auth/*", (req, res) => void handler(req, res));
 * ```
 */
export function createBetterAuthNodeHandler(auth: any) {
  return toNodeHandler(auth);
}

export { fromNodeHeaders };




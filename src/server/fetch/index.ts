/**
 * Create a Fetch (Request -> Response) handler for Better Auth.
 *
 * Useful for edge-style runtimes that expose a Fetch handler, e.g.
 * - Cloudflare Workers
 * - Bun.serve({ fetch })
 * - "export default { fetch }" style runtimes
 *
 * Example (edge-ish):
 * ```ts
 * import { auth } from "./auth";
 * import { createBetterAuthFetchHandler } from "@reactkits.dev/better-auth-connect/server/fetch";
 *
 * export default {
 *   fetch: createBetterAuthFetchHandler(auth),
 * };
 * ```
 */
export function createBetterAuthFetchHandler(auth: any) {
  return async (request: Request): Promise<Response> => {
    // better-auth can be passed as { handler } or directly as a function(Request)->Response
    if (auth && typeof auth === "object" && "handler" in auth && typeof auth.handler === "function") {
      return auth.handler(request);
    }
    if (typeof auth === "function") {
      return auth(request);
    }
    throw new Error("Invalid auth instance: expected better-auth auth or auth.handler");
  };
}




import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type PlatformParam = "reddit" | "x" | "google";

export interface PlatformAccountsHandlersOptions {
  /**
   * better-auth instance from the consumer app (e.g. `import { auth } from "@/lib/auth"`).
   */
  auth: any;

  /**
   * Function that returns token metadata for a Better Auth account id.
   * This MUST NOT return raw tokens to the client.
   */
  getAccountTokenInfo: (accountId: string) => Promise<{
    accessTokenExpiresAt: Date | null;
    isExpired: boolean;
    hasRefreshToken: boolean;
  }>;

  /**
   * Delete/unlink an account for a user. Kept injectable so apps can use their DB layer of choice.
   */
  deleteAccount: (args: { accountId: string; userId: string; providerId: string }) => Promise<void>;
}

function isSupportedPlatform(platform: string): platform is PlatformParam {
  return platform === "reddit" || platform === "x" || platform === "google";
}

function platformToProviderId(platform: PlatformParam): string {
  switch (platform) {
    case "reddit":
      return "reddit";
    case "x":
      // Better Auth providerId is typically "twitter" for X
      return "twitter";
    case "google":
      return "google";
  }
}

/**
 * Create Next.js route handlers for:
 * - GET    /api/auth/:platform/accounts
 * - DELETE /api/auth/:platform/accounts?accountId=xxx
 *
 * Intended to be used from `src/app/api/auth/[platform]/accounts/route.ts`.
 */
export function createPlatformAccountsRouteHandlers(opts: PlatformAccountsHandlersOptions) {
  const { auth, getAccountTokenInfo, deleteAccount } = opts;

  async function GET(_request: NextRequest, context: { params: Promise<{ platform: string }> }) {
    try {
      const { platform } = await context.params;

      if (!isSupportedPlatform(platform)) {
        return NextResponse.json({ error: "Unknown platform" }, { status: 404 });
      }

      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const accounts = await auth.api.listUserAccounts({
        headers: await headers(),
      });

      if (!accounts || accounts.length === 0) {
        return NextResponse.json([]);
      }

      const providerId = platformToProviderId(platform);
      const filtered = accounts.filter((acc: any) => acc.providerId === providerId);

      if (filtered.length === 0) {
        return NextResponse.json([]);
      }

      const withTokenInfo = await Promise.all(
        filtered.map(async (acc: any) => {
          const tokenInfo = await getAccountTokenInfo(acc.id);
          return {
            id: acc.id,
            userId: acc.userId,
            providerId: acc.providerId,
            accountId: acc.accountId,
            accessToken: "hidden",
            refreshToken: tokenInfo.hasRefreshToken ? "present" : null,
            accessTokenExpiresAt: tokenInfo.accessTokenExpiresAt?.toISOString() || null,
            isExpired: tokenInfo.isExpired,
            scope: acc.scope,
            createdAt: acc.createdAt,
            updatedAt: acc.updatedAt,
          };
        })
      );

      return NextResponse.json(withTokenInfo);
    } catch (error: any) {
      console.error("[Platform Accounts API] Error:", error);
      return NextResponse.json(
        { error: "Failed to fetch accounts", details: error?.message },
        { status: 500 }
      );
    }
  }

  async function DELETE(request: NextRequest, context: { params: Promise<{ platform: string }> }) {
    try {
      const { platform } = await context.params;

      if (!isSupportedPlatform(platform)) {
        return NextResponse.json({ error: "Unknown platform" }, { status: 404 });
      }

      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const accountId = request.nextUrl.searchParams.get("accountId");
      if (!accountId) {
        return NextResponse.json({ error: "accountId is required" }, { status: 400 });
      }

      const providerId = platformToProviderId(platform);
      await deleteAccount({ accountId, userId: session.user.id, providerId });

      return NextResponse.json({ success: true });
    } catch (error: any) {
      console.error("[Platform Accounts API] Delete error:", error);
      return NextResponse.json(
        { error: "Failed to disconnect account", details: error?.message },
        { status: 500 }
      );
    }
  }

  return { GET, DELETE };
}




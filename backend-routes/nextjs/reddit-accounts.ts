/**
 * Next.js API Route Template: Reddit Accounts
 * 
 * Copy this to: src/app/api/auth/reddit/accounts/route.ts
 * 
 * Required dependencies:
 * - better-auth (already installed)
 * - Your database adapter (Drizzle, Prisma, etc.)
 */

import { auth } from "@/lib/auth"; // Your Better Auth instance
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getAccountTokenInfo } from "@/lib/db/helpers"; // Your helper function

/**
 * GET /api/auth/reddit/accounts
 * List all connected Reddit accounts for the current user
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use Better Auth's listUserAccounts API
    const accounts = await auth.api.listUserAccounts({
      headers: await headers(),
    });

    if (!accounts || accounts.length === 0) {
      return NextResponse.json([]);
    }

    // Filter for Reddit accounts
    const redditAccounts = accounts.filter(
      (acc: any) => acc.providerId === "reddit"
    );

    if (redditAccounts.length === 0) {
      return NextResponse.json([]);
    }

    // Get token info for each account
    const accountsWithTokenInfo = await Promise.all(
      redditAccounts.map(async (acc: any) => {
        const tokenInfo = await getAccountTokenInfo(acc.id);

        return {
          id: acc.id,
          userId: acc.userId,
          providerId: acc.providerId,
          accountId: acc.accountId,
          accessToken: "hidden", // Never expose real token
          refreshToken: tokenInfo.hasRefreshToken ? "present" : null,
          accessTokenExpiresAt: tokenInfo.accessTokenExpiresAt?.toISOString() || null,
          isExpired: tokenInfo.isExpired,
          scope: acc.scope || "identity read submit mysubreddits",
          createdAt: acc.createdAt,
          updatedAt: acc.updatedAt,
        };
      })
    );

    return NextResponse.json(accountsWithTokenInfo);
  } catch (error: any) {
    console.error("[Reddit Accounts API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts", details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/reddit/accounts?accountId=xxx
 * Disconnect a Reddit account
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = request.nextUrl.searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId is required" },
        { status: 400 }
      );
    }

    // Delete account using Better Auth's API or direct database access
    // Better Auth doesn't expose deleteAccount, so use your database adapter
    const { db } = await import("@/db"); // Your database instance
    const { account } = await import("@/db/schema");
    const { eq, and } = await import("drizzle-orm");

    await db
      .delete(account)
      .where(
        and(
          eq(account.id, accountId),
          eq(account.userId, session.user.id),
          eq(account.providerId, "reddit")
        )
      );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Reddit Accounts API] Delete error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect account", details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * Next.js API Route Template: Dev.to Accounts
 * 
 * Copy this to: src/app/api/auth/devto/accounts/route.ts
 * 
 * Required dependencies:
 * - better-auth (already installed)
 * - Your database adapter (Drizzle, Prisma, etc.)
 */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { account } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/auth/devto/accounts
 * List all connected Dev.to accounts for the current user
 */
export async function GET() {
  let userId: string | null = null;

  // Try to get session, but don't require it (Dev.to can work without auth)
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (session?.user?.id) {
      userId = session.user.id;
    }
  } catch (e) {
    // No session - continue with null userId
  }

  try {
    // Query accounts table for providerId = 'devto'
    const rows = await db
      .select({
        id: account.id,
        userId: account.userId,
        providerId: account.providerId,
        accountId: account.accountId,
        accessToken: account.accessToken,
        scope: account.scope,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      })
      .from(account)
      .where(
        userId
          ? and(eq(account.userId, userId), eq(account.providerId, "devto"))
          : eq(account.providerId, "devto")
      );

    // Map to client-safe format (hide API key)
    const accounts = rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      providerId: row.providerId,
      accountId: row.accountId,
      apiKey: "hidden", // Never expose real API key
      scope: row.scope,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));

    return NextResponse.json(accounts);
  } catch (error: any) {
    console.error("[Dev.to Accounts API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts", details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/devto/accounts
 * Connect a Dev.to account with API key
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id || "default-user-id"; // Fallback for dev

    const { apiKey } = await request.json();

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    // Validate API key by fetching user profile
    const response = await fetch("https://dev.to/api/users/me", {
      headers: {
        "api-key": apiKey,
        Accept: "application/vnd.forem.api-v1+json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 400 }
      );
    }

    const profile = await response.json();

    // Store account in database
    const accountId = `devto-${profile.id}`;
    const existingAccount = await db
      .select()
      .from(account)
      .where(
        and(
          eq(account.providerId, "devto"),
          eq(account.accountId, accountId)
        )
      )
      .limit(1);

    if (existingAccount.length > 0) {
      // Update existing account
      await db
        .update(account)
        .set({
          accessToken: apiKey, // Store API key (should be encrypted in production)
          updatedAt: new Date(),
        })
        .where(eq(account.id, existingAccount[0].id));
    } else {
      // Create new account
      await db.insert(account).values({
        id: `devto-${Date.now()}`,
        userId,
        providerId: "devto",
        accountId,
        accessToken: apiKey, // Store API key (should be encrypted in production)
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      account: {
        id: existingAccount[0]?.id || `devto-${Date.now()}`,
        username: profile.username,
        profileImageUrl: profile.profile_image,
      },
    });
  } catch (error: any) {
    console.error("[Dev.to Accounts API] POST error:", error);
    return NextResponse.json(
      { error: "Failed to connect account", details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/devto/accounts?accountId=xxx
 * Disconnect a Dev.to account
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id || "default-user-id";

    const accountId = request.nextUrl.searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId is required" },
        { status: 400 }
      );
    }

    await db
      .delete(account)
      .where(
        and(
          eq(account.id, accountId),
          eq(account.userId, userId),
          eq(account.providerId, "devto")
        )
      );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Dev.to Accounts API] Delete error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect account", details: error?.message },
      { status: 500 }
    );
  }
}

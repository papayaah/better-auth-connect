/**
 * Helper Function: Get Account Token Info
 * 
 * Copy this to: src/lib/db/helpers.ts (or create new file)
 * 
 * This helper retrieves token expiration info from the database
 */

import { db } from "@/db";
import { account } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface AccountTokenInfo {
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: Date | null;
  hasRefreshToken: boolean;
  isExpired: boolean;
}

/**
 * Get token information for an account
 * Used by account listing routes to check token expiration
 */
export async function getAccountTokenInfo(
  accountId: string
): Promise<AccountTokenInfo> {
  const rows = await db
    .select({
      accessToken: account.accessToken,
      refreshToken: account.refreshToken,
      accessTokenExpiresAt: account.accessTokenExpiresAt,
    })
    .from(account)
    .where(eq(account.id, accountId))
    .limit(1);

  const row = rows[0];

  if (!row) {
    return {
      accessToken: null,
      refreshToken: null,
      accessTokenExpiresAt: null,
      hasRefreshToken: false,
      isExpired: true,
    };
  }

  const expiresAt = row.accessTokenExpiresAt
    ? new Date(row.accessTokenExpiresAt)
    : null;
  const now = new Date();
  const isExpired = expiresAt ? expiresAt <= now : false;

  return {
    accessToken: row.accessToken,
    refreshToken: row.refreshToken,
    accessTokenExpiresAt: expiresAt,
    hasRefreshToken: !!row.refreshToken,
    isExpired,
  };
}

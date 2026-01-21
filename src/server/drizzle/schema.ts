/**
 * Better Auth Drizzle schema for PostgreSQL
 *
 * These are the standard tables required by Better Auth.
 * Apps can extend these tables with additional columns via migrations.
 */

import { relations } from 'drizzle-orm';
import { boolean, index, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

/**
 * User table - stores authenticated users
 */
export const user = pgTable(
  'user',
  {
    id: text('id').primaryKey(),
    name: text('name'),
    email: text('email'),
    emailVerified: boolean('email_verified').notNull().default(false),
    image: text('image'),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  },
  (t) => ({
    emailUnique: uniqueIndex('user_email_unique').on(t.email),
  })
);

/**
 * Account table - stores OAuth provider accounts linked to users
 */
export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    // Better Auth / OAuth identity
    providerId: text('provider_id').notNull(),
    accountId: text('account_id').notNull(),

    // Token fields
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { mode: 'string' }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { mode: 'string' }),
    scope: text('scope'),

    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  },
  (t) => ({
    userProviderIdx: uniqueIndex('account_user_provider_unique').on(t.userId, t.providerId, t.accountId),
    providerIdx: index('account_provider_idx').on(t.providerId),
  })
);

/**
 * Session table - stores user sessions
 */
export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    token: text('token').notNull(),
    expiresAt: timestamp('expires_at', { mode: 'string' }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  },
  (t) => ({
    tokenUnique: uniqueIndex('session_token_unique').on(t.token),
    userIdx: index('session_user_idx').on(t.userId),
  })
);

/**
 * Verification table - stores verification tokens (email, OAuth state, etc.)
 */
export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    token: text('token'),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { mode: 'string' }).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  },
  (t) => ({
    identifierIdx: index('verification_identifier_idx').on(t.identifier),
    tokenUnique: uniqueIndex('verification_token_unique').on(t.token),
  })
);

// Relations
export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  sessions: many(session),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

/**
 * All Better Auth tables as a schema object.
 * Use this with drizzle() setup.
 *
 * @example
 * ```ts
 * import { betterAuthSchema } from '@reactkits.dev/better-auth-connect/server/drizzle';
 * import { drizzle } from 'drizzle-orm/postgres-js';
 *
 * export const db = drizzle(client, { schema: betterAuthSchema });
 * ```
 */
export const betterAuthSchema = {
  user,
  account,
  session,
  verification,
  userRelations,
  accountRelations,
  sessionRelations,
};

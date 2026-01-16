# Database Setup Guide for Better Auth Connect

Complete guide for setting up the database layer when using `better-auth-connect` in your application.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Unified Database (Recommended)](#unified-database-recommended)
3. [Provider-Agnostic Setup](#provider-agnostic-setup)
4. [Creating Tables (Migrations)](#creating-tables-migrations)
5. [Client vs Server Separation](#client-vs-server-separation)
6. [Complete Setup Example](#complete-setup-example)

---

## Architecture Overview

### Key Principle: `better-auth-connect` Doesn't Access the Database

`better-auth-connect` is a **client-side library** that runs in the browser. It:
- ✅ Makes HTTP requests to your backend API routes
- ✅ Caches data in IndexedDB (client-side only)
- ❌ **Never directly accesses the database**

**Your application's backend** handles all database access:
- Implements API routes that `better-auth-connect` calls
- Configures database connection
- Manages Better Auth tables and migrations

```
Browser (Client)                    Server (Your App)
┌─────────────────┐                ┌──────────────────┐
│ better-auth-    │  HTTP Request  │ API Routes       │
│ connect         │ ──────────────>│ /api/auth/...   │
│                 │                │                  │
│ (No DB access)  │                │ Database Layer   │
└─────────────────┘                │ - Drizzle ORM    │
                                    │ - Better Auth   │
                                    │ - PostgreSQL    │
                                    └──────────────────┘
```

---

## Unified Database (Recommended)

### Why One Database?

**Always use a single database** where Better Auth tables live alongside your app tables:

✅ **Benefits:**
- Foreign keys between Better Auth `user` table and your app tables
- Single JOIN queries (user + posts in one query)
- Atomic transactions across all tables
- Better performance (single connection)
- Lower cost (one database instance)
- Simpler maintenance

❌ **Problems with Separate Databases:**
- No foreign keys across databases
- Multiple queries needed (can't JOIN)
- No cross-database transactions
- 2x the cost (two database instances)
- More complexity

### Unified Schema Example

```typescript
// src/db/schema.ts

import { pgTable, text, timestamp, boolean, unique, index } from 'drizzle-orm/pg-core';

// ============================================================================
// Better Auth Tables (Required)
// ============================================================================

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
}, (table) => ({
  providerAccountUnique: unique().on(table.providerId, table.accountId),
  userIdIdx: index('idx_account_userId').on(table.userId),
  providerIdIdx: index('idx_account_providerId').on(table.providerId),
}));

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
}, (table) => ({
  userIdIdx: index('idx_session_userId').on(table.userId),
  tokenIdx: index('idx_session_token').on(table.token),
}));

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
});

// ============================================================================
// Your App Tables (Example)
// ============================================================================

export const posts = pgTable('posts', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }), // ✅ Foreign key!
  title: text('title').notNull(),
  content: text('content'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
});
```

---

## Provider-Agnostic Setup

### Use Standard PostgreSQL Driver

Instead of provider-specific drivers, use Drizzle's generic PostgreSQL driver (`postgres-js`) which works with **any PostgreSQL provider** (Neon, Supabase, Railway, AWS RDS, etc.).

### Database Client Setup

```typescript
// src/db/index.ts

import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import postgres from 'postgres';
import Database from 'better-sqlite3';
import * as schema from './schema';

export type AppDatabase = 
  | ReturnType<typeof drizzlePostgres<typeof schema>>
  | ReturnType<typeof drizzleSqlite<typeof schema>>;

let dbInstance: AppDatabase | null = null;

export function getDb(): AppDatabase {
  if (dbInstance) {
    return dbInstance;
  }

  if (process.env.DATABASE_URL) {
    // PostgreSQL (any provider: Neon, Supabase, Railway, AWS RDS, etc.)
    const connectionString = process.env.DATABASE_URL;
    
    // Supabase connection pooler requires prepare: false
    const isSupabase = connectionString.includes('supabase.co');
    
    const client = postgres(connectionString, {
      prepare: !isSupabase, // Required for Supabase pooler
      max: 1, // Serverless-friendly: single connection
    });
    
    dbInstance = drizzlePostgres(client, { schema });
    console.log('[DB] Using PostgreSQL (provider-agnostic)');
  } else {
    // SQLite (local development)
    const sqlite = new Database('./auth.db');
    dbInstance = drizzleSqlite(sqlite, { schema });
    console.log('[DB] Using SQLite');
  }

  return dbInstance;
}

export const db = getDb();
export * from './schema';
```

### Environment Variables

**Local Development (SQLite):**
```env
# No DATABASE_URL = uses SQLite automatically
```

**Production (Any PostgreSQL Provider):**
```env
# Neon
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require

# Supabase
DATABASE_URL=postgresql://postgres.xxx:pass@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require

# Railway
DATABASE_URL=postgresql://postgres:pass@containers-us-west-xxx.railway.app:5432/railway

# AWS RDS
DATABASE_URL=postgresql://user:pass@xxx.rds.amazonaws.com:5432/dbname?sslmode=require
```

### Better Auth Configuration

```typescript
// src/lib/auth.ts

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // Same database instance

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: process.env.DATABASE_URL ? "pg" : "sqlite",
  }),
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  // ... rest of config
});
```

---

## Creating Tables (Migrations)

Better Auth **does not automatically create tables**. You need to:

1. Define the schema (Better Auth tables + your app tables)
2. Generate migrations using Drizzle Kit
3. Apply migrations to the database

### Step 1: Install Dependencies

```bash
npm install drizzle-orm postgres better-sqlite3
npm install -D drizzle-kit @types/better-sqlite3
```

### Step 2: Configure Drizzle Kit

```typescript
// drizzle.config.ts

import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: process.env.DATABASE_URL ? 'postgresql' : 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || './auth.db',
  },
});
```

### Step 3: Generate Migrations

```bash
npm run db:generate
```

This creates SQL migration files in `./drizzle/`:
```
drizzle/
├── 0000_initial_schema.sql
├── meta/
│   └── _journal.json
```

### Step 4: Apply Migrations

**Option A: CLI (Recommended)**
```bash
npm run db:migrate
```

**Option B: Programmatic**
```typescript
// scripts/migrate.ts

import 'dotenv/config';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from '../src/db';

async function runMigrations() {
  console.log('🔄 Running database migrations...');
  await migrate(db as any, { migrationsFolder: './drizzle' });
  console.log('✅ Migrations completed!');
}

runMigrations().catch(console.error);
```

**Add to package.json:**
```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:migrate:script": "tsx scripts/migrate.ts",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

### Migration Workflow

1. **Edit schema** (`src/db/schema.ts`)
2. **Generate migration**: `npm run db:generate --name descriptive_name`
3. **Review SQL** in `drizzle/` folder
4. **Apply migration**: `npm run db:migrate`
5. **Commit migration files** to git

---

## Client vs Server Separation

### What `better-auth-connect` Needs

**Only the API base path (optional):**

```typescript
<IntegrationProvider 
  authClient={authClient}
  apiBasePath="" // Empty = same origin, or custom API server URL
>
```

### What It Doesn't Need

- ❌ Database connection string
- ❌ Database name
- ❌ Database credentials
- ❌ Database schema
- ❌ Migration files

All database configuration happens in **your application's backend**.

### Example Flow

```typescript
// 1. Client: better-auth-connect makes HTTP request
const response = await fetch('/api/auth/devto/accounts', {
  method: 'POST',
  body: JSON.stringify({ apiKey }),
});

// 2. Your backend: Handles database access
// src/app/api/auth/devto/accounts/route.ts
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  const { apiKey } = await request.json();
  
  // YOUR database query
  const [account] = await db
    .insert(account)
    .values({
      userId: session.user.id,
      providerId: "devto",
      // ...
    })
    .returning();
  
  return NextResponse.json(account);
}

// 3. Client: Receives response (no database access needed)
const account = await response.json();
```

---

## Complete Setup Example

### File Structure

```
your-app/
├── src/
│   ├── db/
│   │   ├── schema.ts          # Better Auth + app tables
│   │   └── index.ts            # Database client
│   ├── lib/
│   │   └── auth.ts            # Better Auth config
│   └── app/
│       └── api/
│           └── auth/
│               └── {platform}/
│                   └── accounts/
│                       └── route.ts  # API routes
├── drizzle/
│   ├── 0000_initial_schema.sql
│   └── meta/
│       └── _journal.json
├── scripts/
│   └── migrate.ts              # Migration script
├── drizzle.config.ts          # Drizzle Kit config
└── package.json
```

### Initialization Flow

```
1. Define schema (src/db/schema.ts)
   ↓
2. Generate migrations: npm run db:generate
   ↓
3. Apply migrations: npm run db:migrate
   ↓
4. Database tables created
   ↓
5. Better Auth initializes (src/lib/auth.ts)
   ↓
6. API routes ready (src/app/api/auth/...)
   ↓
7. better-auth-connect can make requests
```

### Quick Start Commands

```bash
# 1. Install dependencies
npm install drizzle-orm postgres better-sqlite3
npm install -D drizzle-kit @types/better-sqlite3

# 2. Define schema (src/db/schema.ts) - Better Auth + app tables

# 3. Generate migrations
npm run db:generate

# 4. Apply migrations
npm run db:migrate

# 5. Start app
npm run dev
```

---

## Summary

| Aspect | Details |
|--------|---------|
| **Database Access** | `better-auth-connect` never accesses DB - only makes HTTP requests |
| **Database Setup** | Your app configures database connection, Better Auth, and migrations |
| **Architecture** | Unified database (Better Auth + app tables in one DB) |
| **Provider** | Use `postgres-js` for provider-agnostic PostgreSQL support |
| **Migrations** | Define schema → Generate → Apply (Drizzle Kit) |
| **Configuration** | `better-auth-connect` only needs `apiBasePath` (optional) |

**Key Takeaway:** `better-auth-connect` is a client library that calls your API routes. Your backend handles all database access, configuration, and migrations.



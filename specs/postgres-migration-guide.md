# PostgreSQL Migration Guide (Any Provider)

## Overview

**Drizzle migrations work with ANY PostgreSQL database** - Neon, Supabase, Railway, AWS RDS, DigitalOcean, etc. The migration files are standard SQL and database-agnostic.

## How It Works

### 1. Migrations Are Just SQL Files

When you run `npm run db:generate`, Drizzle creates standard SQL files in `drizzle/`:

```sql
-- drizzle/0000_initial_auth_schema.sql
CREATE TABLE "user" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  ...
);
```

**These SQL files work with any PostgreSQL database** - they're not provider-specific.

### 2. Migration Process

```bash
# 1. Generate migrations (creates SQL files)
npm run db:generate

# 2. Apply migrations (runs SQL against your database)
npm run db:migrate
```

The `drizzle.config.ts` reads `DATABASE_URL` and connects to whatever PostgreSQL database you specify.

## Setup for Different Providers

### Neon

**Connection String Format:**
```
postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Setup:**
1. Get connection string from Neon dashboard
2. Set `DATABASE_URL` in `.env.local`
3. Run migrations: `npm run db:migrate`

**Runtime Driver:** Uses `@neondatabase/serverless` (serverless-optimized)

### Supabase

**Connection String Format:**
```
# Direct connection
postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres

# Pooled connection (recommended)
postgresql://postgres.xxx:pass@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Setup:**
1. Get connection string from Supabase dashboard (use pooled connection)
2. Set `DATABASE_URL` in `.env.local`
3. Run migrations: `npm run db:migrate`

**Runtime Driver:** Use `postgres` package (not Neon-specific)

**Note:** Supabase pooler requires `prepare: false` in postgres client config.

### Railway

**Connection String Format:**
```
postgresql://postgres:pass@containers-us-west-xxx.railway.app:5432/railway
```

**Setup:**
1. Create PostgreSQL service in Railway
2. Copy connection string from Railway dashboard
3. Set `DATABASE_URL` in `.env.local`
4. Run migrations: `npm run db:migrate`

**Runtime Driver:** Use `postgres` package

### AWS RDS

**Connection String Format:**
```
postgresql://user:pass@xxx.region.rds.amazonaws.com:5432/dbname?sslmode=require
```

**Setup:**
1. Create RDS PostgreSQL instance
2. Get connection string from AWS console
3. Set `DATABASE_URL` in `.env.local`
4. Run migrations: `npm run db:migrate`

**Runtime Driver:** Use `postgres` package

### DigitalOcean Managed Databases

**Connection String Format:**
```
postgresql://user:pass@xxx.db.ondigitalocean.com:25060/dbname?sslmode=require
```

**Setup:**
1. Create PostgreSQL database in DigitalOcean
2. Get connection string from dashboard
3. Set `DATABASE_URL` in `.env.local`
4. Run migrations: `npm run db:migrate`

**Runtime Driver:** Use `postgres` package

### Self-Hosted PostgreSQL

**Connection String Format:**
```
postgresql://user:pass@localhost:5432/dbname
```

**Setup:**
1. Install PostgreSQL locally or on server
2. Create database: `createdb myapp`
3. Set `DATABASE_URL` in `.env.local`
4. Run migrations: `npm run db:migrate`

**Runtime Driver:** Use `postgres` package

## Making Your Code Provider-Agnostic

### Current Setup (Neon-Specific)

Your `src/db/index.ts` is currently Neon-specific:

```typescript
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

if (process.env.DATABASE_URL) {
  const sql = neon(process.env.DATABASE_URL); // Neon-specific
  dbInstance = drizzleNeon(sql, { schema });
}
```

### Provider-Agnostic Setup

To support any PostgreSQL provider, update `src/db/index.ts`:

```typescript
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import postgres from 'postgres'; // Generic PostgreSQL driver
import Database from 'better-sqlite3';
import * as schema from './schema';

export type DrizzleDB = 
  | ReturnType<typeof drizzlePostgres<typeof schema>>
  | ReturnType<typeof drizzleSqlite<typeof schema>>;

let dbInstance: DrizzleDB | null = null;

export function getDb(): DrizzleDB {
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

**Install the generic PostgreSQL driver:**
```bash
npm install postgres
npm install -D @types/pg
```

### When to Use Provider-Specific Drivers

**Use Neon-specific driver (`@neondatabase/serverless`) if:**
- You're only using Neon
- You want serverless-optimized performance
- You're deploying to Vercel Edge Functions

**Use generic `postgres` driver if:**
- You want to support multiple providers
- You're using Supabase, Railway, AWS RDS, etc.
- You want maximum compatibility

## Migration Commands

### Generate Migrations

```bash
npm run db:generate
# or
npx drizzle-kit generate
```

Creates SQL files in `drizzle/` folder.

### Apply Migrations

```bash
npm run db:migrate
# or
npx drizzle-kit migrate
```

Runs SQL files against your database (specified by `DATABASE_URL`).

### Push Schema (Dev Only)

```bash
npm run db:push
# or
npx drizzle-kit push
```

Directly syncs schema without migration files (useful for development).

### View Database

```bash
npm run db:studio
# or
npx drizzle-kit studio
```

Opens Drizzle Studio GUI to browse your database.

## Environment Variables

### Local Development (SQLite)

```env
# No DATABASE_URL = uses SQLite automatically
```

### Production (Any PostgreSQL)

```env
# Set DATABASE_URL to your provider's connection string
DATABASE_URL=postgresql://user:pass@host:port/dbname?sslmode=require
```

**Important:** Never commit `.env.local` or `.env` files with real credentials to git!

## Migration Workflow

1. **Edit schema** (`src/db/schema.ts`)
2. **Generate migration**: `npm run db:generate --name descriptive_name`
3. **Review SQL** in `drizzle/` folder
4. **Apply migration**: `npm run db:migrate`
5. **Commit migration files** to git (they're safe to commit)

## Troubleshooting

### "Connection refused"

- Check `DATABASE_URL` is correct
- Verify database is running/accessible
- Check firewall rules (for cloud providers)

### "SSL required"

Add `?sslmode=require` to connection string:
```
DATABASE_URL=postgresql://user:pass@host:port/dbname?sslmode=require
```

### "Migration already applied"

Drizzle tracks applied migrations in `__drizzle_migrations` table. If you see this error, the migration was already run.

### "Schema drift detected"

Your database schema doesn't match your code. Options:
- Reset database (dev only): `npm run db:push --force`
- Create new migration: `npm run db:generate`

## Summary

| Aspect | Details |
|--------|---------|
| **Migration Compatibility** | ✅ Works with ANY PostgreSQL database |
| **Migration Files** | Standard SQL files (database-agnostic) |
| **Runtime Driver** | Can be provider-specific (Neon) or generic (`postgres`) |
| **Connection String** | Standard PostgreSQL format (`postgresql://...`) |
| **Migration Tool** | `drizzle-kit migrate` (reads `DATABASE_URL`) |

**Key Takeaway:** Migrations are just SQL files. They work with any PostgreSQL database. The only difference is the runtime driver you use in your application code.

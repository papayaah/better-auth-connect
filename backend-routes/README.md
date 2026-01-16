# Backend Routes for better-auth-connect

> **Note**: `backend-routes` is just an organizational folder name - **not deployable itself**. Copy these files into your Next.js app's `src/app/api/` directory.

This directory contains **ready-to-use backend route templates** for Next.js, Express, or any Node.js framework.

## What Are These Routes?

### Two Types of Routes:

#### 1. **OAuth Login/Connection Routes** (Better Auth provides automatically)
These handle the actual OAuth flow - **Better Auth creates these automatically**:

```
POST /api/auth/sign-in/social     # Initiates OAuth login
GET  /api/auth/callback/{provider} # Handles OAuth callback
POST /api/auth/link-social        # Links account to existing user
```

**You create**: `src/app/api/auth/[...all]/route.ts` (one file)
**Better Auth handles**: All OAuth redirects, token exchange, storage

#### 2. **Account Management Routes** (You copy from here)
These are for listing/disconnecting accounts - **you copy these templates**:

```
GET    /api/auth/{platform}/accounts  # List connected accounts
DELETE /api/auth/{platform}/accounts  # Disconnect account
```

**You copy**: Files from `backend-routes/nextjs/` → Your `src/app/api/` directory

## Quick Setup

### For Next.js (Recommended)

1. **Copy Better Auth handler** (one file):
   ```
   backend-routes/nextjs/better-auth-handler.ts 
   → src/app/api/auth/[...all]/route.ts
   ```
   This handles OAuth login/connection automatically.

2. **Copy account management routes** (one per platform):
   ```
   backend-routes/nextjs/reddit-accounts.ts 
   → src/app/api/auth/reddit/accounts/route.ts
   
   backend-routes/nextjs/google-accounts.ts 
   → src/app/api/auth/google/accounts/route.ts
   
   backend-routes/nextjs/x-accounts.ts 
   → src/app/api/auth/x/accounts/route.ts
   
   backend-routes/nextjs/google-accounts.ts 
   → src/app/api/auth/google/accounts/route.ts
   ```
   These handle listing/disconnecting accounts.

#### Option: Use ONE Dynamic Route Instead (Recommended for package-based apps)

If you don't want one file per platform, you can use a single dynamic route:

```
backend-routes/nextjs/platform-accounts-dynamic.ts
→ src/app/api/auth/[platform]/accounts/route.ts
```

This will serve:
- `/api/auth/reddit/accounts`
- `/api/auth/x/accounts`
- `/api/auth/google/accounts`

Dev.to is still separate (`/api/auth/devto/accounts`) because it uses API-key semantics (POST) and different storage behavior.

3. **Deploy your Next.js app** to Vercel/Netlify/etc.
4. **Done!** Routes deploy as serverless functions automatically.

### For Express/Other Frameworks

1. **Copy route handlers** and adapt to your framework
2. **Install Better Auth** and configure database
3. **Mount routes** at `/api/auth/{platform}/accounts`

## Required Routes

### OAuth Platforms (Reddit, X, Google)

```
GET    /api/auth/{platform}/accounts     # List connected accounts
DELETE /api/auth/{platform}/accounts     # Disconnect account
```

### API Key Platforms (Dev.to)

```
GET    /api/auth/{platform}/accounts     # List connected accounts
POST   /api/auth/{platform}/accounts     # Connect account (with API key)
DELETE /api/auth/{platform}/accounts     # Disconnect account
```

### Optional: API Proxy (for fetching content)

```
GET  /api/{platform}/proxy              # Proxy GET requests
POST /api/{platform}/proxy               # Proxy POST requests
```

## Deployment

### ✅ Vercel (Serverless Functions)

**Works perfectly!** When you deploy your Next.js app:

```
Your Next.js App (deployed to Vercel)
├── src/app/api/auth/[...all]/route.ts        → Serverless Function ✅
├── src/app/api/auth/reddit/accounts/route.ts → Serverless Function ✅
├── src/app/api/auth/google/accounts/route.ts  → Serverless Function ✅
└── src/app/api/auth/x/accounts/route.ts      → Serverless Function ✅
```

**No separate backend server needed** - Next.js API routes automatically become serverless functions on Vercel.

### ✅ Netlify (Serverless Functions)

**Works!** Next.js API routes deploy as Netlify Functions automatically.

### ✅ Supabase Edge Functions

**Not directly** - Supabase Edge Functions use Deno runtime. You'd need to:
- Adapt routes to Deno/Edge runtime
- Or use Supabase's PostgreSQL + deploy Next.js API routes separately

### ✅ AWS Lambda

**Works!** Deploy Next.js app - API routes become Lambda functions.

### ✅ Other Platforms

- **Railway** - Deploy Next.js app
- **Render** - Deploy Next.js app  
- **Fly.io** - Deploy Next.js app
- **Any Node.js host** - Works anywhere Next.js works

**Key Point**: You deploy your **entire Next.js app** (including API routes). The routes become serverless functions automatically - no separate backend deployment needed.

## Architecture

```
┌─────────────────────────────────────────┐
│  Client (better-auth-connect package)  │
│  - React components                     │
│  - Hooks                                │
│  - IndexedDB cache                      │
└──────────────┬──────────────────────────┘
               │ HTTP Requests
               ▼
┌─────────────────────────────────────────┐
│  Backend (Your Next.js/Express app)    │
│  - API routes (this directory)          │
│  - Better Auth config                   │
│  - Database (PostgreSQL/SQLite)        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Better Auth                           │
│  - OAuth flow                           │
│  - Token storage                        │
│  - Session management                   │
└─────────────────────────────────────────┘
```

## Is This Client-Side Only?

**No!** The package has two parts:

1. **Client-side** (React components, hooks) - `better-auth-connect` package
2. **Server-side** (API routes) - You deploy these routes

**Deployment Options:**
- ✅ **Vercel** - Next.js API routes = Serverless Functions (no separate backend)
- ✅ **Netlify** - Next.js or Netlify Functions
- ✅ **Any Node.js host** - Deploy your Next.js/Express app

You don't need a separate backend server - Next.js API routes run as serverless functions on Vercel/Netlify.

# @reactkits.dev/better-auth-connect

![WIP](https://img.shields.io/badge/status-WIP-orange?style=flat-square)
![Version](https://img.shields.io/badge/version-0.1.0--alpha-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![Bundlephobia min](https://img.shields.io/bundlephobia/min/@reactkits.dev/better-auth-connect?style=flat&label=minified)
![Bundlephobia minzip](https://img.shields.io/bundlephobia/minzip/@reactkits.dev/better-auth-connect?style=flat&label=gzipped)

> ⚠️ **Work in Progress**: This library is under active development. APIs may change. Not recommended for production use yet.

A headless React library for managing OAuth and API key integrations with social platforms.

## Why This Library?

- **Headless** - Bring your own UI. Works with Tailwind, Mantine, or any component library
- **Better Auth Integration** - Built specifically for [better-auth](https://better-auth.com)
- **Simple** - Full platform integration in 10 lines of code
- **Caching** - Built-in IndexedDB caching for optimal performance

## Installation

```bash
npm install @reactkits.dev/better-auth-connect

# Optional: icons
npm install lucide-react

# Optional: for Mantine preset
npm install @mantine/core @mantine/hooks
```

## Quick Start

```tsx
import {
  IntegrationProvider,
  IntegrationCard,
  tailwindPreset,
  defaultIconSet
} from '@reactkits.dev/better-auth-connect';
import { createAuthClient } from 'better-auth/react';

// Initialize your Better Auth client
const authClient = createAuthClient({
  baseURL: 'https://your-app.com',
});

function IntegrationsPage() {
  return (
    <IntegrationProvider authClient={authClient}>
      <IntegrationCard
        platform="reddit"
        preset={tailwindPreset}
        icons={defaultIconSet}
        showPermissions={true}
      />
    </IntegrationProvider>
  );
}
```

## Supported Platforms

- **Reddit** - OAuth2 authentication
- **X (Twitter)** - OAuth2 authentication
- **Dev.to** - API Key authentication
- **Google** - OAuth2 authentication

## Headless Architecture

The library doesn't ship any UI. You provide components via a `preset`:

```tsx
const myPreset = {
  Card: (props) => <div className="my-card" {...props} />,
  Button: (props) => <button className="my-btn" {...props} />,
  TextInput: ({ value, onChange }) => (
    <input value={value} onChange={e => onChange(e.target.value)} />
  ),
  // ... see types for full list
};

<IntegrationCard preset={myPreset} platform="reddit" />
```

Built-in presets: `tailwindPreset`, `mantinePreset`, `defaultPreset`

## Using Hooks Directly

For more control, use the hooks directly:

```tsx
import { useIntegration } from '@reactkits.dev/better-auth-connect';

function CustomRedditIntegration() {
  const {
    accounts,
    loading,
    error,
    connected,
    connect,
    disconnect
  } = useIntegration('reddit');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {connected ? (
        <button onClick={() => disconnect(accounts[0].id)}>
          Disconnect Reddit
        </button>
      ) : (
        <button onClick={() => connect()}>
          Connect Reddit
        </button>
      )}
    </div>
  );
}
```

## Bundle Size

| Module | Gzipped |
|--------|---------|
| Core Library | < 20 KB |
| Tailwind Preset | < 3 KB |
| Mantine Preset | < 10 KB |

## What This Package Provides

### ✅ OAuth Account Connection (via Better Auth)
- **UI/Hooks Layer** - Provides React components and hooks for OAuth flows
- **Connects OAuth accounts** (Reddit, X, Google) using Better Auth's OAuth methods
- **Can be used for login** - If user is not logged in, `connect()` calls Better Auth's `signIn.social()`
- **Account linking** - Links OAuth accounts using Better Auth's `linkSocial()`
- **Caching** - IndexedDB caching layer for account data

**Important**: The package doesn't implement OAuth itself—it's a **wrapper around Better Auth's OAuth functionality**. All OAuth flows (redirects, token exchange, storage) are handled by Better Auth.

### ❌ What It Does NOT Provide
- **OAuth Implementation** - Better Auth handles all OAuth flows
- **Email/Password Login** - That's Better Auth's job (use `authClient.signIn.email()`)
- **Main Authentication System** - You need Better Auth set up first
- **Backend Routes** - You must implement the custom API routes yourself

## How It Works

The package is a **UI/hooks wrapper** around Better Auth's OAuth methods:

```typescript
// Package's connect() method:
if (session?.user) {
  // User logged in → Use Better Auth's linkSocial()
  await authClient.linkSocial({ provider: 'reddit' });
} else {
  // User NOT logged in → Use Better Auth's signIn.social()
  await authClient.signIn.social({ provider: 'reddit' });
}
```

**What Better Auth Handles:**
- OAuth redirect flow
- Token exchange with provider
- Token storage in database
- Session creation
- Token refresh

**What This Package Adds:**
- React components (IntegrationCard, ConnectButton, etc.)
- Hooks (useIntegration, useAccounts)
- IndexedDB caching
- Permission selection UI
- Account management UI

**Important**: The package doesn't implement OAuth—it provides a convenient React interface to Better Auth's existing OAuth functionality.

## Backend Requirements

The library requires Better Auth backend + custom API routes. **We provide ready-to-use route templates** in `backend-routes/` directory.

### Better Auth Routes (Auto-provided)

Create this file: `src/app/api/auth/[...all]/route.ts`

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

This creates all Better Auth routes automatically:
- `POST /api/auth/sign-in/social` - OAuth login
- `GET /api/auth/callback/{provider}` - OAuth callback
- `POST /api/auth/link-social` - Link account
- `GET /api/auth/session` - Get session

### Custom Routes (Copy Templates)

**Minimum Required** (for OAuth connection only):
- Copy `better-auth-handler.ts` → `src/app/api/auth/[...all]/route.ts`
- This handles OAuth login/connection automatically ✅

**Optional** (if using UI components like `IntegrationCard`):
- Copy `reddit-accounts.ts` → `src/app/api/auth/reddit/accounts/route.ts` (GET/DELETE)
- Copy `google-accounts.ts` → `src/app/api/auth/google/accounts/route.ts` (GET/DELETE)
- Copy `x-accounts.ts` → `src/app/api/auth/x/accounts/route.ts` (GET/DELETE)
- Copy `devto-accounts.ts` → `src/app/api/auth/devto/accounts/route.ts` (GET/POST/DELETE)

**Why optional?**
- ⚠️ **UI components (`IntegrationCard`) REQUIRE GET route** - they call `getAccounts()` on mount to check connection status
- If you only use hooks directly (not UI components) and don't need status display, GET route is optional
- DELETE route only needed if you want disconnect functionality

**Note:** There's no way to show connection status in UI components without the GET route, since account data is stored server-side in your database.

**Note**: `backend-routes` is just a template folder - **not deployable**. Copy files into your Next.js app's `src/app/api/` directory.

### Deployment: Vercel/Netlify (Serverless)

**✅ Works perfectly!** Next.js API routes deploy as **serverless functions**:

- **Vercel**: API routes → Serverless Functions (no separate backend needed)
- **Netlify**: API routes → Netlify Functions (no separate backend needed)
- **Any Node.js host**: Deploy your Next.js app

**You don't need a separate backend server** - everything runs in serverless functions!

## License

MIT

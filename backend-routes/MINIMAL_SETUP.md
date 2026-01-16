# Minimal Backend Setup

## If You ONLY Want to Connect Accounts (No UI Components)

If you're using the package's hooks directly and **don't need** to:
- Show connection status
- Display account list
- Show disconnect button

Then you can skip the account management routes!

### Minimal Setup (Just OAuth Connection)

**Only need ONE file:**

```typescript
// src/app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

**That's it!** Better Auth handles all OAuth flows automatically.

### Usage (Hooks Only)

```tsx
import { useIntegration } from '@reactkits.dev/better-auth-connect';

function MyComponent() {
  const { connect } = useIntegration('reddit');
  
  // This works! OAuth flow happens via Better Auth
  return <button onClick={() => connect()}>Connect Reddit</button>;
}
```

**What happens:**
1. User clicks button
2. `connect()` calls `authClient.signIn.social()`
3. Better Auth redirects to Reddit
4. User authorizes
5. Better Auth handles callback
6. Account connected ✅

**No GET/DELETE routes needed** - you're just connecting, not checking status.

## If You Use UI Components (IntegrationCard, etc.)

**⚠️ UI components REQUIRE the GET route** - there's no way around it.

The UI components call `getAccounts()` on mount (via `useIntegration` hook) to:
- Check if accounts are connected (`accounts.length > 0`)
- Display account info (username, avatar, etc.)
- Show disconnect button

**Why?** The connection status is stored server-side in your database. The UI needs to fetch it to know if accounts exist.

**Required routes:**
- ✅ `src/app/api/auth/[...all]/route.ts` (Better Auth handler)
- ✅ `src/app/api/auth/{platform}/accounts/route.ts` (GET - **required for UI**)
- ✅ `src/app/api/auth/{platform}/accounts/route.ts` (DELETE - for disconnect)

**Can't avoid GET route?** If you want to show connection status, you need the GET route. The only way to avoid it is to:
1. Not use UI components (use hooks directly)
2. Manually track connection status in your own state (not recommended - unreliable)

## Summary

| Use Case | Required Routes |
|----------|----------------|
| **Just connect** (hooks only) | `[...all]/route.ts` only ✅ |
| **Connect + show status** (UI components) | `[...all]/route.ts` + GET route ✅ |
| **Connect + disconnect** (full UI) | `[...all]/route.ts` + GET + DELETE ✅ |

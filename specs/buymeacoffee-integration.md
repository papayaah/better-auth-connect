# Buy Me A Coffee Integration Specification

## Overview

Buy Me A Coffee integration uses **API Token authentication** (similar to Dev.to). Users generate access tokens from the Buy Me A Coffee Developer Dashboard, which are securely stored and used for all API requests.

## Better Auth Connect Architecture

**Type**: API Token (Custom Flow - Similar to DevTo)

**Integration Approach**:
- ✅ **Uses Better Auth Database Structure**: Store tokens in Better Auth's `account` table
- ❌ **NOT using Better Auth OAuth Flow**: Custom authentication flow (user provides token)
- ✅ **Follows Storage Pattern**: Uses `providerId = 'buymeacoffee'`, stores encrypted token in `accessToken` field
- ✅ **Service Pattern**: Follows `better-auth-connect` service factory pattern (same as DevTo API key flow)

**Why Not Better Auth OAuth?**
- Buy Me A Coffee uses API tokens (not OAuth2)
- Better Auth's `socialProviders` only works for OAuth providers
- We reuse Better Auth's database structure but handle auth flow manually

**Implementation Pattern**:
```typescript
// Custom auth service (not using authClient.signIn.social)
const buymeacoffeeAuthService = createBuyMeACoffeeAuthService({ apiBasePath });

// Add account with access token
await buymeacoffeeAuthService.addAccount(accessToken);

// But uses Better Auth DB structure:
// account {
//   providerId: 'buymeacoffee',
//   accessToken: encryptedToken,
//   userId: currentUser.id
// }
```

**Comparison with Other Integrations**:
- **Reddit/X (OAuth)**: Use `authClient.signIn.social()` → Better Auth handles everything
- **DevTo (API Key)**: Custom form → Validate API key → Store in Better Auth DB manually
- **Buy Me A Coffee (API Token)**: Custom form → Validate token → Store in Better Auth DB manually (same pattern as DevTo)

## Buy Me A Coffee API Overview

- **Authentication**: API Token (in request header: `Authorization: Bearer <token>`)
- **Base URL**: `https://developers.buymeacoffee.com/api/v1`
- **Documentation**: https://www.postman.com/apifyi/buy-me-a-coffee-api/overview
- **API Token Generation**: Created via Developer Dashboard at https://www.buymeacoffee.com/developer/dashboard
- **Status**: Read-only API (write permissions under development)

## Authentication Method

Buy Me A Coffee uses **API tokens**:
- Single access token (no refresh token needed)
- Tokens don't expire (unless revoked)
- Bearer token authentication
- Tokens generated from Developer Dashboard

## API Capabilities - What's Possible

**⚠️ IMPORTANT**: Buy Me A Coffee API is currently **read-only**. Write permissions are under development.

### ✅ Read Operations

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Get Profile/Community** | `GET /community` | ✅ Yes | Get authenticated user's profile and community info |
| **Get Supporters** | `GET /supporters` | ✅ Yes | Get list of supporters (with pagination) |
| **Get Subscriptions** | `GET /subscriptions` | ✅ Yes | Get active/inactive subscriptions |
| **Get Feed** | `GET /feed` | ✅ Yes | Get activity feed |
| **Get Extras** | `GET /extras` | ✅ Yes | Get extras purchases (BETA) |
| **Get Extras by ID** | `GET /extras/{id}` | ✅ Yes | Get specific extra purchase details (BETA) |
| **Get One-Time Supporters** | `GET /supporters` | ✅ Yes | Get one-time supporters with messages |
| **Get One-Time Supporter by ID** | `GET /supporters/{id}` | ✅ Yes | Get specific supporter details |

### ⚠️ Limited/Partial Support

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Get Members** | Various | ⚠️ Limited | Member data available through supporters/subscriptions |
| **Analytics** | Various | ⚠️ Limited | Limited analytics data available |

### ❌ Not Available

| Operation | Status | Notes |
|-----------|--------|-------|
| **Create Posts** | ❌ No | API is read-only |
| **Update Profile** | ❌ No | Cannot update profile via API |
| **Send Messages** | ❌ No | Cannot send messages to supporters |
| **Manage Subscriptions** | ❌ No | Cannot create/update/cancel subscriptions |
| **Create Extras** | ❌ No | Cannot create extras via API |
| **Webhooks** | ❌ No | Webhook support not available (use IFTTT for automation) |

### 📝 Supporter Operations Details

**Reading Supporters:**
- Can fetch all supporters (one-time and recurring)
- Includes supporter name, email, amount, date
- Includes messages from supporters
- Supports pagination (limit, page)
- Can filter by supporter ID

**Supporter Data:**
- Supporter name and email
- Support amount and currency
- Support date
- Messages/notes from supporter
- Support type (one-time vs subscription)

### 💳 Subscription Operations

**Reading Subscriptions:**
- Can fetch active and inactive subscriptions
- Includes subscription details (amount, currency, status)
- Includes supporter information
- Can filter by status (active, inactive)

**Subscription Data:**
- Subscription amount and currency
- Status (active, inactive, canceled)
- Start date and renewal date
- Supporter information
- Membership level/tier

### 🎁 Extras Operations (BETA)

**Reading Extras:**
- Can fetch all extras purchases
- Can fetch specific extra by ID
- Includes purchase details
- BETA feature - may change

**Extras Data:**
- Extra name and description
- Purchase amount
- Purchase date
- Supporter information

### 📊 Feed Operations

**Reading Feed:**
- Activity feed of all supporter actions
- Includes supporters, subscriptions, extras
- Chronological activity timeline
- Supports pagination

### 🔍 Limitations

1. **Read-Only API**: Cannot create, update, or delete anything
2. **No Write Operations**: All write operations must be done via Buy Me A Coffee website
3. **No Webhooks**: Must use IFTTT or similar for automation
4. **Rate Limits**: API has rate limits (check response headers)
5. **Browser Requests**: In-browser requests not supported (security) - must use proxy in development

## Implementation Plan

### Phase 1: Types & Platform Config

**Update**: `src/types.ts`

Add Buy Me A Coffee to platform types:

```typescript
export type Platform = 'reddit' | 'x' | 'devto' | 'bluesky' | 'buymeacoffee';

export interface BuyMeACoffeeAccount extends BaseAccount {
  providerId: 'buymeacoffee';
  accountId: string; // Buy Me A Coffee user ID (from profile)
  accessToken: string; // Encrypted access token
  username?: string;
  email?: string;
  firstName?: string;
  imageUrl?: string;
}

export type Account = RedditAccount | XAccount | DevToAccount | BlueskyAccount | BuyMeACoffeeAccount;
```

Add platform config:

```typescript
export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  // ... existing platforms
  buymeacoffee: {
    id: 'buymeacoffee',
    name: 'Buy Me A Coffee',
    authType: 'apikey', // API token authentication
    callbackPath: '/app/integrations/buymeacoffee',
  },
};
```

Add permissions (API tokens don't have scopes, but we document capabilities):

```typescript
export const BUYMEACOFFEE_PERMISSIONS: Permission[] = [
  { id: 'read', label: 'Read data', description: 'Read supporters, subscriptions, and feed (Required)', required: true, default: true },
];

export const PLATFORM_PERMISSIONS: Record<Platform, Permission[]> = {
  // ... existing
  buymeacoffee: BUYMEACOFFEE_PERMISSIONS,
};
```

Add features:

```typescript
export const PLATFORM_FEATURES: Record<Platform, PlatformFeature[]> = {
  // ... existing
  buymeacoffee: [
    { text: 'API token authentication' },
    { text: 'Secure token storage' },
    { text: 'Read supporters and subscriptions' },
    { text: 'View activity feed' },
    { text: 'Read-only API (write permissions under development)' },
  ],
};
```

Add platform colors:

```typescript
export const PLATFORM_COLORS: Record<Platform, { primary: string; bg: string; hover: string }> = {
  // ... existing
  buymeacoffee: { primary: '#FFDD00', bg: 'rgba(255, 221, 0, 0.1)', hover: '#FFD700' },
};
```

**New File**: `src/services/buymeacoffee/types.ts`

```typescript
export interface BuyMeACoffeeProfile {
  id: string;
  first_name: string;
  last_name?: string;
  email: string;
  image_url?: string;
  url?: string;
  twitter_username?: string;
  facebook_username?: string;
  instagram_username?: string;
  youtube_username?: string;
}

export interface BuyMeACoffeeSupporter {
  payer_name: string;
  payer_email: string;
  amount: string;
  currency: string;
  support_created_on: string;
  support_coffee_price: string;
  support_note?: string;
  support_visibility: number;
  transaction_id?: string;
}

export interface BuyMeACoffeeSubscription {
  subscriber_name: string;
  subscriber_email: string;
  amount: string;
  currency: string;
  subscription_created_on: string;
  subscription_coffee_price: string;
  subscription_status: 'active' | 'inactive' | 'canceled';
  subscription_updated_on: string;
}

export interface BuyMeACoffeeExtra {
  extra_name: string;
  extra_price: string;
  buyer_name: string;
  buyer_email: string;
  support_created_on: string;
  support_coffee_price: string;
  support_note?: string;
}

export interface BuyMeACoffeeFeedItem {
  type: 'support' | 'subscription' | 'extra';
  supporter_name: string;
  amount: string;
  currency: string;
  created_on: string;
  note?: string;
}
```

### Phase 2: Auth Service

**New File**: `src/services/buymeacoffee/auth.ts`

```typescript
import type { BuyMeACoffeeAccount } from '../../types';
import {
  getCachedAccounts,
  cacheAccounts,
  clearAccountCache,
  isCacheValid,
  ACCOUNT_CACHE_TTL,
} from '../../utils/cache';
import { ApiKeyError, ConnectionError } from '../../utils/errors';
import type { BuyMeACoffeeProfile } from './types';

// ============================================================================
// Service Factory
// ============================================================================

export interface BuyMeACoffeeAuthServiceConfig {
  apiBasePath?: string;
}

export const createBuyMeACoffeeAuthService = (config: BuyMeACoffeeAuthServiceConfig = {}) => {
  const { apiBasePath = '' } = config;

  return {
    /**
     * Validate API token by fetching profile from Buy Me A Coffee
     */
    validateToken: async (token: string): Promise<BuyMeACoffeeProfile | null> => {
      try {
        const response = await fetch(`${apiBasePath}/api/buymeacoffee/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          return null;
        }

        return await response.json();
      } catch {
        return null;
      }
    },

    /**
     * Add a new Buy Me A Coffee account with access token
     * This validates the token and stores it via the API route
     */
    addAccount: async (accessToken: string): Promise<BuyMeACoffeeAccount> => {
      const response = await fetch(`${apiBasePath}/api/auth/buymeacoffee/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ApiKeyError('buymeacoffee', error.error || 'Failed to add Buy Me A Coffee account');
      }

      // Clear cache to force refresh
      await clearAccountCache('buymeacoffee');

      return response.json();
    },

    /**
     * Connect Buy Me A Coffee account (same as addAccount for API token auth)
     */
    connect: async (accessToken: string): Promise<BuyMeACoffeeAccount> => {
      return buymeacoffeeAuthService.addAccount(accessToken);
    },

    /**
     * Get connected Buy Me A Coffee accounts with IndexedDB caching
     */
    getAccounts: async (forceRefresh = false): Promise<BuyMeACoffeeAccount[]> => {
      // Check IndexedDB cache first
      if (!forceRefresh) {
        try {
          const cached = await getCachedAccounts('buymeacoffee');
          if (cached && isCacheValid(cached.cachedAt, ACCOUNT_CACHE_TTL)) {
            // Only use cache if it has accounts (don't cache empty arrays)
            if (cached.accounts && cached.accounts.length > 0) {
              return cached.accounts as BuyMeACoffeeAccount[];
            }
          }
        } catch {
          // Continue to fetch from API
        }
      }

      // Fetch from API
      const response = await fetch(`${apiBasePath}/api/auth/buymeacoffee/accounts`);
      if (response.ok) {
        const accounts = await response.json();
        try {
          // Only cache if we have accounts (don't cache empty arrays)
          if (accounts && accounts.length > 0) {
            await cacheAccounts('buymeacoffee', accounts);
          } else {
            // Clear any stale cache if we got empty array
            await clearAccountCache('buymeacoffee');
          }
        } catch {
          // Cache failure is non-fatal
        }
        return accounts;
      }
      return [];
    },

    /**
     * Remove a Buy Me A Coffee account
     */
    removeAccount: async (accountId: string): Promise<void> => {
      const response = await fetch(`${apiBasePath}/api/auth/buymeacoffee/accounts?accountId=${accountId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ConnectionError('buymeacoffee', error.error || 'Failed to remove account');
      }

      await clearAccountCache('buymeacoffee');
    },

    /**
     * Disconnect a Buy Me A Coffee account (alias for removeAccount)
     */
    disconnect: async (accountId: string): Promise<void> => {
      return buymeacoffeeAuthService.removeAccount(accountId);
    },

    /**
     * Clear the account cache
     */
    clearCache: async (): Promise<void> => {
      await clearAccountCache('buymeacoffee');
    },
  };
};

// Default instance
let buymeacoffeeAuthService: ReturnType<typeof createBuyMeACoffeeAuthService>;

export const initBuyMeACoffeeAuthService = (config: BuyMeACoffeeAuthServiceConfig = {}) => {
  buymeacoffeeAuthService = createBuyMeACoffeeAuthService(config);
  return buymeacoffeeAuthService;
};

export const getBuyMeACoffeeAuthService = () => {
  if (!buymeacoffeeAuthService) {
    throw new Error('Buy Me A Coffee auth service not initialized. Use IntegrationProvider.');
  }
  return buymeacoffeeAuthService;
};

export { buymeacoffeeAuthService };
```

### Phase 3: API Service (Optional - for future use)

**New File**: `src/services/buymeacoffee/api.ts` (optional, for API operations)

This would contain methods for:
- Getting profile
- Getting supporters
- Getting subscriptions
- Getting feed
- Getting extras
- etc.

This can be implemented later as needed.

### Phase 4: Export from Index

**Update**: `src/index.ts`

Add Buy Me A Coffee exports:

```typescript
export {
  createBuyMeACoffeeAuthService,
  initBuyMeACoffeeAuthService,
  getBuyMeACoffeeAuthService,
  type BuyMeACoffeeAuthServiceConfig,
} from './services/buymeacoffee/auth';
export type {
  BuyMeACoffeeProfile,
  BuyMeACoffeeSupporter,
  BuyMeACoffeeSubscription,
  BuyMeACoffeeExtra,
  BuyMeACoffeeFeedItem,
} from './services/buymeacoffee/types';
```

### Phase 5: Integration Provider Updates

**Update**: `src/components/IntegrationProvider.tsx`

Add Buy Me A Coffee service initialization:

```typescript
// In IntegrationProvider initialization
if (config.platforms?.includes('buymeacoffee')) {
  initBuyMeACoffeeAuthService({
    apiBasePath: config.apiBasePath,
  });
}
```

## Files Summary

### New Files (3)

1. `packages/better-auth-connect/specs/buymeacoffee-integration.md` - This spec
2. `packages/better-auth-connect/src/services/buymeacoffee/auth.ts` - Auth service
3. `packages/better-auth-connect/src/services/buymeacoffee/types.ts` - TypeScript types

### Files to Modify (3)

1. `packages/better-auth-connect/src/types.ts` - Add Buy Me A Coffee platform types, config, permissions, features
2. `packages/better-auth-connect/src/index.ts` - Export Buy Me A Coffee service
3. `packages/better-auth-connect/src/components/IntegrationProvider.tsx` - Initialize Buy Me A Coffee service

### Optional Future Files

1. `packages/better-auth-connect/src/services/buymeacoffee/api.ts` - API service for data operations
2. `packages/better-auth-connect/src/services/buymeacoffee/index.ts` - Service exports

## Backend API Routes Required

The following API routes need to be implemented in the consuming application:

### `POST /api/auth/buymeacoffee/accounts`

Creates a new Buy Me A Coffee account connection.

**Request Body:**
```json
{
  "accessToken": "your-access-token-here"
}
```

**Response:**
```json
{
  "id": "account-id",
  "userId": "user-id",
  "providerId": "buymeacoffee",
  "accountId": "user-id-from-profile",
  "accessToken": "encrypted-token",
  "username": "username",
  "email": "email@example.com",
  "firstName": "First Name",
  "imageUrl": "https://..."
}
```

**Implementation Notes:**
1. Validate token by calling Buy Me A Coffee API (`GET /community`)
2. Get user profile using the token
3. Encrypt token before storage
4. Store account in Better Auth database with `providerId = 'buymeacoffee'`
5. Return account object

### `GET /api/auth/buymeacoffee/accounts`

Returns all connected Buy Me A Coffee accounts for the current user.

**Response:**
```json
[
  {
    "id": "account-id",
    "userId": "user-id",
    "providerId": "buymeacoffee",
    "accountId": "user-id-from-profile",
    "accessToken": "hidden",
    "username": "username",
    "email": "email@example.com",
    "firstName": "First Name",
    "imageUrl": "https://..."
  }
]
```

### `DELETE /api/auth/buymeacoffee/accounts?accountId=xxx`

Removes a Buy Me A Coffee account connection.

**Response:** 200 OK

### `POST /api/buymeacoffee/validate`

Validates an access token by fetching the user profile.

**Request Body:**
```json
{
  "token": "access-token-to-validate"
}
```

**Response:**
```json
{
  "id": "user-id",
  "first_name": "First Name",
  "email": "email@example.com",
  "image_url": "https://..."
}
```

**Implementation Notes:**
1. Call Buy Me A Coffee API with token: `GET https://developers.buymeacoffee.com/api/v1/community`
2. Return profile if valid, error if invalid

## Environment Variables Needed

```env
# Encryption key for tokens (can reuse from Dev.to)
ENCRYPTION_KEY=your-secure-encryption-key-here
```

No client ID/secret needed (unlike OAuth providers).

## Security Considerations

**Token Encryption**:
- Store access tokens encrypted in database
- Use environment variable for encryption key
- Decrypt only when needed for API calls

**Token Validation**:
- Always validate token with Buy Me A Coffee API before storing
- Handle invalid/revoked tokens gracefully
- Show clear error messages

**Browser Request Limitation**:
- Buy Me A Coffee API doesn't support in-browser requests
- Must use proxy endpoint in development
- Production should use server-side API routes

## Implementation Verification

When building the integration, ensure these features work correctly:

- [ ] Add Buy Me A Coffee account with valid access token
- [ ] Validate token before storing
- [ ] Reject invalid tokens
- [ ] List connected accounts
- [ ] Remove account
- [ ] Encrypt/decrypt tokens correctly
- [ ] Fetch user profile
- [ ] Fetch supporters
- [ ] Fetch subscriptions
- [ ] Fetch feed
- [ ] Handle API errors gracefully
- [ ] Clear cache on add/remove
- [ ] Show read-only API warning in UI
- [ ] Use proxy in development (browser requests not supported)

## Buy Me A Coffee API Endpoints Reference

- `GET /community` - Get authenticated user profile
- `GET /supporters` - Get supporters (with pagination)
- `GET /subscriptions` - Get subscriptions (with status filter)
- `GET /feed` - Get activity feed
- `GET /extras` - Get extras purchases (BETA)
- `GET /extras/{id}` - Get specific extra (BETA)

All requests require `Authorization: Bearer <token>` header.

## Implementation Notes

1. **Read-Only API**: Buy Me A Coffee API is currently read-only. Write permissions are under development.

2. **Token Format**: Buy Me A Coffee access tokens are:
   - Long alphanumeric strings
   - Generated from Developer Dashboard
   - Don't expire unless revoked
   - Must be kept secure

3. **Browser Requests**: In-browser requests are not supported for security reasons. Use:
   - Proxy endpoint in development
   - Server-side API routes in production

4. **Rate Limits**: API has rate limits - check response headers and implement backoff

5. **IFTTT Integration**: For automation, users can use IFTTT (Buy Me A Coffee has IFTTT integration)

---

## Notes

- Buy Me A Coffee API tokens don't expire (unlike OAuth tokens)
- No refresh token flow needed
- Users can have multiple tokens (different accounts)
- API is read-only - write permissions under development
- Browser requests not supported - must use proxy/server-side routes
- **Follows Dev.to pattern** (API key/token authentication, not OAuth)
- Uses `addAccount()`, `getAccounts()`, `removeAccount()` (not `connect()`, `signIn()`, `getSession()`)
- No OAuth flow - manual token input like Dev.to




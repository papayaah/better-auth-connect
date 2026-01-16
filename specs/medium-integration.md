# Medium Integration Specification

## Overview

Medium integration uses **API Token authentication** (similar to Dev.to/Buy Me A Coffee). **Important Note**: Medium has restricted access to their official API and is not issuing new integration tokens. Existing tokens continue to work, but new integrations may require alternative approaches or waiting for API access to be restored.

## Better Auth Connect Architecture

**Type**: API Token (Custom Flow - Similar to DevTo/BuyMeACoffee)

**Integration Approach**:
- ✅ **Uses Better Auth Database Structure**: Store tokens in Better Auth's `account` table
- ❌ **NOT using Better Auth OAuth Flow**: Custom authentication flow (user provides token)
- ✅ **Follows Storage Pattern**: Uses `providerId = 'medium'`, stores encrypted token in `accessToken` field
- ✅ **Service Pattern**: Follows `better-auth-connect` service factory pattern (same as DevTo/BuyMeACoffee API key flow)

**Why Not Better Auth OAuth?**
- Medium uses API tokens (not OAuth2)
- Better Auth's `socialProviders` only works for OAuth providers
- We reuse Better Auth's database structure but handle auth flow manually

**Implementation Pattern**:
```typescript
// Custom auth service (not using authClient.signIn.social)
const mediumAuthService = createMediumAuthService({ apiBasePath });

// Add account with integration token
await mediumAuthService.addAccount(integrationToken);

// But uses Better Auth DB structure:
// account {
//   providerId: 'medium',
//   accessToken: encryptedToken,
//   userId: currentUser.id
// }
```

**Comparison with Other Integrations**:
- **Reddit/X/Discord/Instagram/Facebook/LinkedIn (OAuth)**: Use `authClient.signIn.social()` → Better Auth handles OAuth2 flow
- **DevTo/BuyMeACoffee/Medium (API Key/Token)**: Custom form → Validate key/token → Store in Better Auth DB manually
- **Bluesky (AT Protocol)**: Custom AT Protocol flow → App password auth, store token in Better Auth DB manually

## Medium API Overview

- **Authentication**: API Token (in request header: `Authorization: Bearer <token>`)
- **Base URL**: `https://api.medium.com/v1`
- **Documentation**: https://github.com/Medium/medium-api-docs
- **API Token Generation**: Created via Medium Settings (if available) - Currently restricted
- **Status**: New integrations not currently permitted by Medium

## Authentication Method

Medium uses **OAuth2-style API tokens** (similar to OAuth but simpler):
- Single access token (no refresh token needed)
- Tokens don't expire (unless revoked)
- Bearer token authentication

## API Capabilities - What's Possible

**⚠️ IMPORTANT**: Medium has restricted access to their official API. New integration tokens are not being issued. The capabilities listed below assume API access is available.

### ✅ Read Operations (If API Access Available)

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Get Published Posts** | `GET /v1/users/{userId}/publications/{publicationId}/posts` | ⚠️ Limited | Can retrieve published posts if API access granted |
| **Get Single Article** | `GET /v1/posts/{postId}` | ⚠️ Limited | Get specific post by ID |
| **Get User Profile** | `GET /v1/me` | ⚠️ Limited | Get authenticated user's profile |
| **Get Publications** | `GET /v1/users/{userId}/publications` | ⚠️ Limited | Get user's publications/collections |

### ✅ Write Operations (If API Access Available)

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Create Post** | `POST /v1/users/{userId}/posts` | ⚠️ Limited | Create new post (HTML or Markdown) |
| **Create Post in Publication** | `POST /v1/publications/{publicationId}/posts` | ⚠️ Limited | Publish to specific publication |
| **Upload Image** | `POST /v1/images` | ⚠️ Limited | Upload images for posts |

### ❌ Not Available

| Operation | Status | Notes |
|-----------|--------|-------|
| **Get Drafts** | ❌ No | Medium API does not provide draft access |
| **Get Comments** | ❌ No | Cannot retrieve comments via API |
| **Update Post** | ❌ No | Cannot edit posts after publishing |
| **Delete Post** | ❌ No | Cannot delete posts via API |
| **Analytics/Views** | ❌ No | No analytics endpoints |
| **Reading List** | ❌ No | Cannot access reading list |

### 📝 Alternative: RSS Feed Access

Since API access is restricted, **RSS feeds** can be used for read-only access:

| Operation | Method | Status | Notes |
|-----------|--------|--------|-------|
| **Get Public Posts** | RSS Feed | ✅ Yes | `https://medium.com/feed/@username` |
| **Publication Posts** | RSS Feed | ✅ Yes | `https://medium.com/feed/publication-name` |

**RSS Feed Limitations:**
- Only public posts (no drafts)
- Typically last 10 posts only
- Read-only (no write operations)
- No authentication needed

### 🔍 Limitations & Alternatives

1. **No Draft Access**: Cannot read or manage drafts via API
2. **No Comments**: Comments system not accessible via API
3. **No Updates**: Cannot edit posts after publishing
4. **RSS Alternative**: Use RSS feeds for read-only access to public posts
5. **API Restrictions**: New API access not available - must use existing tokens or wait

### 📋 Post Creation Details

**If API Access Available:**
- Can publish posts as HTML or Markdown
- Can set published status (draft vs published)
- Can add to publications
- Can upload images
- Cannot edit after publishing (must delete and repost)

## Implementation Plan

### Phase 1: Types & Platform Config

**Update**: `src/types.ts`

Add Medium to platform types:

```typescript
export type Platform = 'reddit' | 'x' | 'devto' | 'bluesky' | 'buymeacoffee' | 'discord' | 'instagram' | 'facebook' | 'linkedin' | 'medium';

export interface MediumAccount extends BaseAccount {
  providerId: 'medium';
  accountId: string; // Medium user ID
  accessToken: string; // Encrypted integration token
  username?: string;
  name?: string;
  profileImageUrl?: string;
}

export type Account = RedditAccount | XAccount | DevToAccount | BlueskyAccount | BuyMeACoffeeAccount | DiscordAccount | InstagramAccount | FacebookAccount | LinkedInAccount | MediumAccount;
```

Add platform config:

```typescript
export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  // ... existing platforms
  medium: {
    id: 'medium',
    name: 'Medium',
    authType: 'apikey', // API token authentication
    callbackPath: '/app/integrations/medium',
  },
};
```

Add permissions (API tokens don't have scopes, but we document capabilities):

```typescript
export const MEDIUM_PERMISSIONS: Permission[] = [
  { id: 'read', label: 'Read data', description: 'Read profile and posts (Required)', required: true, default: true },
  { id: 'write', label: 'Publish posts', description: 'Create and publish posts (If API access available)', default: true },
];

export const PLATFORM_PERMISSIONS: Record<Platform, Permission[]> = {
  // ... existing
  medium: MEDIUM_PERMISSIONS,
};
```

Add features:

```typescript
export const PLATFORM_FEATURES: Record<Platform, PlatformFeature[]> = {
  // ... existing
  medium: [
    { text: 'API token authentication' },
    { text: 'Secure token storage' },
    { text: 'Publish articles and posts' },
    { text: 'Post to publications' },
    { text: 'Upload images' },
    { text: '⚠️ API access currently restricted - new tokens not available' },
  ],
};
```

Add platform colors:

```typescript
export const PLATFORM_COLORS: Record<Platform, { primary: string; bg: string; hover: string }> = {
  // ... existing
  medium: { primary: '#00AB6C', bg: 'rgba(0, 171, 108, 0.1)', hover: '#008055' },
};
```

**New File**: `src/services/medium/types.ts`

```typescript
export interface MediumUser {
  id: string;
  username: string;
  name: string;
  url: string;
  imageUrl: string;
}

export interface MediumPublication {
  id: string;
  name: string;
  description: string;
  url: string;
  imageUrl: string;
}

export interface MediumPost {
  id?: string;
  title: string;
  contentFormat: 'html' | 'markdown';
  content: string;
  tags?: string[];
  publishStatus?: 'draft' | 'public' | 'unlisted';
  canonicalUrl?: string;
  license?: 'all-rights-reserved' | 'cc-40-by' | 'cc-40-by-sa' | 'cc-40-by-nd' | 'cc-40-by-nc' | 'cc-40-by-nc-nd' | 'cc-40-by-nc-sa' | 'cc-40-zero' | 'public-domain';
  notifyFollowers?: boolean;
  publishedAt?: number;
  url?: string;
}
```

### Phase 2: Auth Service

**New File**: `src/services/medium/auth.ts`

```typescript
import type { MediumAccount } from '../../types';
import {
  getCachedAccounts,
  cacheAccounts,
  clearAccountCache,
  isCacheValid,
  ACCOUNT_CACHE_TTL,
} from '../../utils/cache';
import { ApiKeyError, ConnectionError } from '../../utils/errors';
import type { MediumUser } from './types';

// ============================================================================
// Service Factory
// ============================================================================

export interface MediumAuthServiceConfig {
  apiBasePath?: string;
}

export const createMediumAuthService = (config: MediumAuthServiceConfig = {}) => {
  const { apiBasePath = '' } = config;

  return {
    /**
     * Validate integration token by fetching user profile from Medium
     */
    validateToken: async (token: string): Promise<MediumUser | null> => {
      try {
        const response = await fetch('https://api.medium.com/v1/me', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          return null;
        }

        const data = await response.json();
        return data.data;
      } catch {
        return null;
      }
    },

    /**
     * Add a new Medium account with integration token
     * This validates the token and stores it via the API route
     */
    addAccount: async (integrationToken: string): Promise<MediumAccount> => {
      const response = await fetch(`${apiBasePath}/api/auth/medium/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ integrationToken }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ApiKeyError('medium', error.error || 'Failed to add Medium account');
      }

      // Clear cache to force refresh
      await clearAccountCache('medium');

      return response.json();
    },

    /**
     * Connect Medium account (same as addAccount for API token auth)
     */
    connect: async (integrationToken: string): Promise<MediumAccount> => {
      return mediumAuthService.addAccount(integrationToken);
    },

    /**
     * Get connected Medium accounts with IndexedDB caching
     */
    getAccounts: async (forceRefresh = false): Promise<MediumAccount[]> => {
      // Check IndexedDB cache first
      if (!forceRefresh) {
        try {
          const cached = await getCachedAccounts('medium');
          if (cached && isCacheValid(cached.cachedAt, ACCOUNT_CACHE_TTL)) {
            // Only use cache if it has accounts (don't cache empty arrays)
            if (cached.accounts && cached.accounts.length > 0) {
              return cached.accounts as MediumAccount[];
            }
          }
        } catch {
          // Continue to fetch from API
        }
      }

      // Fetch from API
      const response = await fetch(`${apiBasePath}/api/auth/medium/accounts`);
      if (response.ok) {
        const accounts = await response.json();
        try {
          // Only cache if we have accounts (don't cache empty arrays)
          if (accounts && accounts.length > 0) {
            await cacheAccounts('medium', accounts);
          } else {
            // Clear any stale cache if we got empty array
            await clearAccountCache('medium');
          }
        } catch {
          // Cache failure is non-fatal
        }
        return accounts;
      }
      return [];
    },

    /**
     * Remove a Medium account
     */
    removeAccount: async (accountId: string): Promise<void> => {
      const response = await fetch(`${apiBasePath}/api/auth/medium/accounts?accountId=${accountId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ConnectionError('medium', error.error || 'Failed to remove account');
      }

      await clearAccountCache('medium');
    },

    /**
     * Disconnect a Medium account (alias for removeAccount)
     */
    disconnect: async (accountId: string): Promise<void> => {
      return mediumAuthService.removeAccount(accountId);
    },

    /**
     * Clear the account cache
     */
    clearCache: async (): Promise<void> => {
      await clearAccountCache('medium');
    },
  };
};

// Default instance
let mediumAuthService: ReturnType<typeof createMediumAuthService>;

export const initMediumAuthService = (config: MediumAuthServiceConfig = {}) => {
  mediumAuthService = createMediumAuthService(config);
  return mediumAuthService;
};

export const getMediumAuthService = () => {
  if (!mediumAuthService) {
    throw new Error('Medium auth service not initialized. Use IntegrationProvider.');
  }
  return mediumAuthService;
};

export { mediumAuthService };
```

### Phase 3: API Service (Optional - for future use)

**New File**: `src/services/medium/api.ts` (optional, for API operations)

This would contain methods for:
- Getting user profile
- Getting publications
- Creating posts
- Uploading images
- etc.

This can be implemented later as needed.

### Phase 4: Export from Index

**Update**: `src/index.ts`

Add Medium exports:

```typescript
export {
  createMediumAuthService,
  initMediumAuthService,
  getMediumAuthService,
  type MediumAuthServiceConfig,
} from './services/medium/auth';
export type { MediumUser, MediumPublication, MediumPost } from './services/medium/types';
```

### Phase 5: Integration Provider Updates

**Update**: `src/components/IntegrationProvider.tsx`

Add Medium service initialization:

```typescript
// In IntegrationProvider initialization
if (config.platforms?.includes('medium')) {
  initMediumAuthService({
    apiBasePath: config.apiBasePath,
  });
}
```

## Files Summary

### New Files (3)

1. `packages/better-auth-connect/specs/medium-integration.md` - This spec
2. `packages/better-auth-connect/src/services/medium/auth.ts` - Auth service
3. `packages/better-auth-connect/src/services/medium/types.ts` - TypeScript types

### Files to Modify (3)

1. `packages/better-auth-connect/src/types.ts` - Add Medium platform types, config, permissions, features
2. `packages/better-auth-connect/src/index.ts` - Export Medium service
3. `packages/better-auth-connect/src/components/IntegrationProvider.tsx` - Initialize Medium service

### Optional Future Files

1. `packages/better-auth-connect/src/services/medium/api.ts` - API service for Medium operations
2. `packages/better-auth-connect/src/services/medium/index.ts` - Service exports

## Backend API Routes Required

The following API routes need to be implemented in the consuming application:

### `POST /api/auth/medium/accounts`

Creates a new Medium account connection.

**Request Body:**
```json
{
  "integrationToken": "your-integration-token-here"
}
```

**Response:**
```json
{
  "id": "account-id",
  "userId": "user-id",
  "providerId": "medium",
  "accountId": "medium-user-id",
  "accessToken": "encrypted-token",
  "username": "username",
  "name": "User Name",
  "profileImageUrl": "https://..."
}
```

**Implementation Notes:**
1. Validate token by calling Medium API (`GET /v1/me`)
2. Get user profile using the token
3. Encrypt token before storage
4. Store account in Better Auth database with `providerId = 'medium'`
5. Return account object

### `GET /api/auth/medium/accounts`

Returns all connected Medium accounts for the current user.

**Response:**
```json
[
  {
    "id": "account-id",
    "userId": "user-id",
    "providerId": "medium",
    "accountId": "medium-user-id",
    "accessToken": "hidden",
    "username": "username",
    "name": "User Name",
    "profileImageUrl": "https://..."
  }
]
```

### `DELETE /api/auth/medium/accounts?accountId=xxx`

Removes a Medium account connection.

**Response:** 200 OK

### `POST /api/medium/validate`

Validates an integration token by fetching the user profile.

**Request Body:**
```json
{
  "token": "integration-token-to-validate"
}
```

**Response:**
```json
{
  "id": "user-id",
  "username": "username",
  "name": "User Name",
  "url": "https://medium.com/@username",
  "imageUrl": "https://..."
}
```

**Implementation Notes:**
1. Call Medium API with token: `GET https://api.medium.com/v1/me`
2. Return profile if valid, error if invalid

## Environment Variables Needed

```env
# Encryption key for tokens (can reuse from Dev.to/BuyMeACoffee)
ENCRYPTION_KEY=your-secure-encryption-key-here
```

No client ID/secret needed (unlike OAuth providers).

## Security Considerations

**Token Encryption**:
- Store integration tokens encrypted in database
- Use environment variable for encryption key
- Decrypt only when needed for API calls

**Token Validation**:
- Always validate token with Medium API before storing
- Handle invalid/revoked tokens gracefully
- Show clear error messages

**API Access Restrictions**:
- Medium has restricted API access
- New integration tokens not currently available
- Show clear warnings in UI about API status
- Consider alternative approaches (RSS feeds)

## Medium API Endpoints Reference

- `GET /v1/me` - Get authenticated user profile
- `GET /v1/users/{userId}/publications` - Get user's publications
- `POST /v1/users/{userId}/posts` - Create post under user
- `POST /v1/publications/{publicationId}/posts` - Create post under publication
- `POST /v1/images` - Upload image

All requests require `Authorization: Bearer <token>` header.

## API Access Restrictions

**Current Status**: Medium has restricted access to their official API. New integration tokens are not being issued.

**Options**:
1. **Wait for API Access**: Monitor Medium's status for when API access is restored
2. **Alternative Services**: Use third-party services that provide Medium integration (unofficial)
3. **RSS Import**: Use Medium's RSS feeds for read-only content import
4. **Future-Proof Implementation**: Build the integration structure now, ready for when API access is available

## Alternative Approaches

Since Medium's API is restricted, consider:

1. **RSS Feed Integration**: Medium provides RSS feeds for publications
   - Read-only access to published content
   - No authentication required
   - Can import/display Medium articles

2. **Third-Party Services**: Services like MediumAPI (unofficial)
   - Provide Medium integration via their own API
   - May require subscription
   - Unofficial, use at own risk

3. **Future-Proof Design**: Build the structure now
   - Ready for when Medium reopens API access
   - Can switch between approaches
   - Maintains consistent user experience

## Implementation Verification

When building the integration, ensure these features work correctly:

- [ ] Add Medium account with valid integration token (when available)
- [ ] Validate token before storing
- [ ] Reject invalid tokens
- [ ] List connected accounts
- [ ] Remove account
- [ ] Encrypt/decrypt tokens correctly
- [ ] Fetch user profile
- [ ] Fetch user publications
- [ ] Create post (if API access available)
- [ ] Create post in publication (if API access available)
- [ ] Upload image (if API access available)
- [ ] Handle API errors gracefully
- [ ] Clear cache on add/remove
- [ ] Show API restriction warnings in UI

## Implementation Notes

1. **API Availability**: Since Medium's API is restricted, consider:
   - Building a "coming soon" placeholder UI
   - Implementing the structure but disabling the feature
   - Providing clear messaging about API status

2. **Token Format**: Medium integration tokens are typically:
   - Long alphanumeric strings
   - Single-use authentication tokens
   - Don't expire unless revoked

3. **Publications**: Medium users can have publications they write for:
   - Need to fetch publications list
   - Allow user to select publication when posting
   - Posts can be under user or publication

4. **Content Format**: Medium supports:
   - HTML format
   - Markdown format (converted on Medium's side)
   - Recommend supporting both for flexibility

---

## Notes

- Medium API tokens don't expire (unlike OAuth tokens)
- No refresh token flow needed
- Users can have multiple tokens (different accounts/publications)
- API access is currently restricted - implementation may need to wait or use alternatives
- Medium uses a simple Bearer token authentication (simpler than full OAuth)
- **Follows DevTo/BuyMeACoffee pattern** (API key/token authentication, not OAuth)
- Uses `addAccount()`, `getAccounts()`, `removeAccount()` (not `connect()`, `signIn()`, `getSession()`)
- No OAuth flow - manual token input like DevTo/BuyMeACoffee
- ⚠️ **Important**: Medium API access is currently restricted - new tokens not available



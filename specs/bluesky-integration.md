# Bluesky Integration Specification

## Overview

Bluesky integration uses **AT Protocol authentication**. Bluesky is a decentralized social media platform built on the AT Protocol, emphasizing user control, interoperability, and open standards. The API is well-documented and actively developed.

## Better Auth Connect Architecture

**Type**: AT Protocol (Custom - Not Standard OAuth)

**Integration Approach**:
- ⚠️ **Custom Authentication Required**: AT Protocol is not standard OAuth2
- ✅ **Uses Better Auth Database Structure**: Store session tokens in Better Auth's `account` table
- ❌ **NOT using Better Auth OAuth Flow**: Must implement custom AT Protocol authentication
- ✅ **Follows Storage Pattern**: Uses `providerId = 'bluesky'`, stores session token in `accessToken` field
- ✅ **Service Pattern**: Follows `better-auth-connect` service factory pattern (similar to DevTo API key flow)

**Why Not Better Auth OAuth?**
- Bluesky uses AT Protocol (not OAuth2)
- Better Auth's `socialProviders` only works for OAuth2 providers
- Must implement custom authentication flow for AT Protocol
- We reuse Better Auth's database structure for consistency

**Implementation Pattern**:
```typescript
// Custom AT Protocol auth service (not using authClient.signIn.social)
const blueskyAuthService = createBlueskyAuthService({ apiBasePath });

// Connect with app password
await blueskyAuthService.connect(handle, appPassword);

// Creates session via AT Protocol:
// POST /com.atproto.server.createSession
// Returns JWT session token

// Store in Better Auth DB structure:
// account {
//   providerId: 'bluesky',
//   accessToken: sessionToken,
//   accountId: did,
//   userId: currentUser.id
// }
```

**Comparison with Other Integrations**:
- **Reddit/X**: Use `authClient.signIn.social()` → Better Auth handles OAuth2 flow
- **DevTo**: Custom API key flow → Validates key, stores via API route
- **Bluesky**: Custom AT Protocol flow → App password auth, store token in Better Auth DB manually

## Bluesky API Overview

- **Authentication**: AT Protocol (App Password or OAuth-style)
- **Base URL**: `https://bsky.social/xrpc` (or custom PDS server)
- **Documentation**: https://docs.bsky.app/
- **Protocol**: AT Protocol (ATProto)
- **Authentication Methods**:
  - App Password (recommended for bots)
  - OAuth-style flow (for user apps)
  - Session tokens (JWT-based)

## API Capabilities - What's Possible

This section details what operations can be performed with the Bluesky API:

### ✅ Read Operations

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Get User Profile** | `GET /com.atproto.identity.resolveHandle` | ✅ Yes | Resolve handle to DID (Decentralized ID) |
| **Get Profile** | `GET /app.bsky.actor.getProfile` | ✅ Yes | Get user profile (display name, bio, avatar) |
| **Get Profile View** | `GET /app.bsky.actor.getProfiles` | ✅ Yes | Get multiple profiles |
| **Get User Posts (Author Feed)** | `GET /app.bsky.feed.getAuthorFeed` | ✅ Yes | Get posts by a specific user |
| **Get Timeline** | `GET /app.bsky.feed.getTimeline` | ✅ Yes | Get home timeline (posts from followed accounts) |
| **Get Custom Feed** | `GET /app.bsky.feed.getFeed` | ✅ Yes | Get posts from a custom feed (algorithm) |
| **Get Single Post** | `GET /app.bsky.feed.getPostThread` | ✅ Yes | Get post with full thread context |
| **Get Post Thread** | `GET /app.bsky.feed.getPostThread` | ✅ Yes | Get post and replies (thread view) |
| **Get Replies** | `GET /app.bsky.feed.getPostThread` | ✅ Yes | Get replies to a post |
| **Get Likes** | `GET /app.bsky.feed.getLikes` | ✅ Yes | Get users who liked a post |
| **Get Reposts** | `GET /app.bsky.feed.getRepostedBy` | ✅ Yes | Get users who reposted |
| **Get Followers** | `GET /app.bsky.graph.getFollowers` | ✅ Yes | Get user's followers |
| **Get Following** | `GET /app.bsky.graph.getFollows` | ✅ Yes | Get users that a user follows |
| **Get Lists** | `GET /app.bsky.graph.getLists` | ✅ Yes | Get user's lists (mute lists, etc.) |
| **Get Notifications** | `GET /app.bsky.notification.listNotifications` | ✅ Yes | Get user notifications |
| **Search** | `GET /app.bsky.actor.searchActors` | ✅ Yes | Search for users |
| **Search Posts** | `GET /app.bsky.feed.searchPosts` | ✅ Yes | Search for posts (if available) |

### ✅ Write Operations

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Create Post** | `POST /com.atproto.repo.createRecord` | ✅ Yes | Create new post (skeet) |
| **Edit Post** | `POST /com.atproto.repo.putRecord` | ✅ Yes | Edit existing post |
| **Delete Post** | `POST /com.atproto.repo.deleteRecord` | ✅ Yes | Delete a post |
| **Like Post** | `POST /com.atproto.repo.createRecord` | ✅ Yes | Like a post |
| **Unlike Post** | `POST /com.atproto.repo.deleteRecord` | ✅ Yes | Remove like |
| **Repost** | `POST /com.atproto.repo.createRecord` | ✅ Yes | Repost (quote or simple repost) |
| **Remove Repost** | `POST /com.atproto.repo.deleteRecord` | ✅ Yes | Remove repost |
| **Reply to Post** | `POST /com.atproto.repo.createRecord` | ✅ Yes | Reply to a post (thread) |
| **Follow User** | `POST /com.atproto.repo.createRecord` | ✅ Yes | Follow a user |
| **Unfollow User** | `POST /com.atproto.repo.deleteRecord` | ✅ Yes | Unfollow a user |
| **Update Profile** | `POST /com.atproto.repo.putRecord` | ✅ Yes | Update display name, bio, avatar |
| **Upload Image** | `POST /com.atproto.repo.uploadBlob` | ✅ Yes | Upload image blob |
| **Upload Video** | `POST /com.atproto.repo.uploadBlob` | ✅ Yes | Upload video blob |
| **Create List** | `POST /com.atproto.repo.createRecord` | ✅ Yes | Create mute/moderation list |
| **Block User** | `POST /com.atproto.repo.createRecord` | ✅ Yes | Block a user |
| **Unblock User** | `POST /com.atproto.repo.deleteRecord` | ✅ Yes | Unblock a user |

### ⚠️ Limited/Partial Support

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Edit Reply** | `POST /com.atproto.repo.putRecord` | ⚠️ Yes | Can edit, but threading context may be affected |
| **Search Posts** | Various | ⚠️ Limited | Search functionality varies by PDS |
| **Bookmarks** | Various | ⚠️ Limited | Bookmarks may be PDS-specific |

### ❌ Not Available

| Operation | Status | Notes |
|-----------|--------|-------|
| **Drafts** | ❌ No | No native draft support in protocol |
| **Scheduled Posts** | ❌ No | No built-in scheduling (must implement externally) |
| **Edit Replies** | ⚠️ Limited | Can edit but threading may break |
| **Delete Replies** | ✅ Yes | Can delete (but breaks thread) |

### 📝 Post Operations Details

**Creating Posts:**
- Posts are called "skeets" in Bluesky community
- Can include text (up to 300 characters by default, configurable)
- Can include images (up to 4 images)
- Can include videos (if supported by PDS)
- Can include links (auto-embedded)
- Can include mentions (@username)
- Can include hashtags
- Can reply to other posts (creates thread)
- Can quote repost (repost with comment)

**Post Types:**
- **Text Post**: Simple text with optional media
- **Image Post**: Up to 4 images with captions
- **Video Post**: Video with caption (PDS-dependent)
- **Link Post**: Link with preview card
- **Reply**: Post that replies to another post
- **Quote Repost**: Repost with your own comment

**Content Format:**
- Text: Plain text with UTF-8 support
- Rich text: Uses facets for mentions, links, tags
- Images: JPEG, PNG, GIF (WebP may be supported)
- Videos: MP4, MOV (varies by PDS)
- Max text length: 300 characters (can be 8000+ with app.bsky.feed.post lexicon update)

**Editing Posts:**
- ✅ Can edit post content after publishing
- ✅ Can edit text, images, facets
- ⚠️ Editing a reply may affect thread context
- ✅ Changes are reflected immediately

**Deleting Posts:**
- ✅ Can delete any post you created
- ⚠️ Deleting a reply breaks the thread
- ✅ Deletion is permanent

### 🔄 Interactions & Engagement

**Likes:**
- ✅ Can like any post
- ✅ Can unlike
- ✅ Can see who liked a post
- ✅ Like count is public

**Reposts:**
- ✅ Can repost (simple repost)
- ✅ Can quote repost (repost with comment)
- ✅ Can remove repost
- ✅ Can see who reposted

**Replies:**
- ✅ Can reply to any post
- ✅ Replies form threads
- ✅ Can reply to replies (nested threads)
- ✅ Can edit replies
- ✅ Can delete replies (breaks thread)

**Follows:**
- ✅ Can follow any user
- ✅ Can unfollow
- ✅ Can see followers/following lists
- ✅ Follow counts are public

### 🖼️ Media Upload

**Image Upload:**
1. Upload blob: `POST /com.atproto.repo.uploadBlob`
   - Returns blob reference (CID)
2. Include in post: Reference blob in post record
3. Multiple images: Array of image blobs (up to 4)

**Video Upload:**
- Similar process to images
- Larger file sizes
- May require transcoding (PDS-dependent)
- Not all PDS instances support video

**Blob Storage:**
- Blobs stored via Content-Addressed Storage (IPFS-like)
- Referenced by CID (Content Identifier)
- Immutable (changes require new upload)

### 📊 Feeds & Algorithms

**Feed Types:**
- **Timeline**: Home feed (posts from followed accounts)
- **Author Feed**: Posts from specific user
- **Custom Feeds**: Algorithm-based feeds
- **List Feeds**: Posts from users in a list

**Custom Feeds:**
- Bluesky supports custom algorithmic feeds
- Feeds can be created by anyone
- Users can subscribe to custom feeds
- Feeds use custom algorithms (can be self-hosted)

**Algorithm Control:**
- Users can choose their feed algorithm
- Multiple feeds can be followed
- Default algorithm can be overridden

### 🔍 Limitations

1. **Character Limit**: Default 300 characters (extensible)
2. **Image Limit**: Max 4 images per post
3. **Video Support**: Varies by PDS (Personal Data Server)
4. **Rate Limits**: Defined by PDS, typically generous
5. **Search**: Search capabilities vary by PDS
6. **No Drafts**: Must implement draft storage externally
7. **No Scheduling**: Must implement scheduling externally
8. **Decentralized**: Behavior may vary between PDS instances

### 🔐 Authentication Details

**App Password Method (Recommended for Bots):**
1. User creates app password in Bluesky settings
2. Use handle + app password for authentication
3. Get session token (JWT)
4. Use session token for API requests

**OAuth-style Flow (For User Apps):**
1. Redirect to Bluesky authorization
2. User grants permissions
3. Receive authorization code
4. Exchange for access token
5. Use access token for API requests

**Session Tokens:**
- JWT-based
- Can be refreshed
- Stored securely after authentication

## Implementation Plan

### Phase 1: Types & Platform Config

**Update**: `src/types.ts`

Add Bluesky to platform types:

```typescript
export type Platform = 'reddit' | 'x' | 'devto' | 'bluesky';

export interface BlueskyAccount extends BaseAccount {
  providerId: 'bluesky';
  accountId: string; // Bluesky DID (Decentralized ID)
  accessToken: string; // Session token (JWT)
  handle?: string; // @username.bsky.social
  displayName?: string;
  avatar?: string;
}

export type Account = RedditAccount | XAccount | DevToAccount | BlueskyAccount;
```

Add platform config:

```typescript
export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  // ... existing platforms
  bluesky: {
    id: 'bluesky',
    name: 'Bluesky',
    authType: 'apikey', // Custom auth (app password), similar to DevTo
    callbackPath: '/app/integrations/bluesky',
  },
};
```

Add permissions (Bluesky doesn't have OAuth scopes, but we can document capabilities):

```typescript
export const BLUESKY_PERMISSIONS: Permission[] = [
  // AT Protocol doesn't use OAuth scopes, but we document capabilities
  { id: 'read', label: 'Read content', description: 'Read posts, profiles, and feeds', required: true, default: true },
  { id: 'write', label: 'Write content', description: 'Create and edit posts', default: true },
  { id: 'interact', label: 'Interact', description: 'Like, repost, and reply to posts', default: true },
];

export const PLATFORM_PERMISSIONS: Record<Platform, Permission[]> = {
  // ... existing
  bluesky: BLUESKY_PERMISSIONS,
};
```

Add features:

```typescript
export const PLATFORM_FEATURES: Record<Platform, PlatformFeature[]> = {
  // ... existing
  bluesky: [
    { text: 'AT Protocol authentication (App Password)' },
    { text: 'Secure token storage' },
    { text: 'Multi-account support' },
    { text: 'Read and create posts (skeets)' },
    { text: 'Upload images and media' },
    { text: 'Edit and delete posts' },
  ],
};
```

Add platform colors:

```typescript
export const PLATFORM_COLORS: Record<Platform, { primary: string; bg: string; hover: string }> = {
  // ... existing
  bluesky: { primary: '#00A8E8', bg: 'rgba(0, 168, 232, 0.1)', hover: '#0099D6' },
};
```

**New File**: `src/services/bluesky/types.ts`

```typescript
export interface BlueskyUser {
  did: string;
  handle: string;
  displayName?: string;
  description?: string;
  avatar?: string;
  followersCount?: number;
  followsCount?: number;
  postsCount?: number;
  createdAt?: string;
}

export interface BlueskyPost {
  uri: string;
  cid: string;
  author: {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
  };
  record: {
    text: string;
    createdAt: string;
    embed?: {
      images?: Array<{
        image: { ref: { link: string } };
        alt: string;
      }>;
      external?: {
        uri: string;
        title: string;
        description: string;
        thumb?: string;
      };
    };
    reply?: {
      root: { uri: string; cid: string };
      parent: { uri: string; cid: string };
    };
  };
  replyCount?: number;
  repostCount?: number;
  likeCount?: number;
  indexedAt: string;
}

export interface BlueskyCreatePost {
  text: string;
  embed?: {
    images?: Array<{
      image: string; // Blob reference
      alt: string;
    }>;
    external?: {
      uri: string;
      title: string;
      description: string;
      thumb?: string;
    };
  };
  reply?: {
    root: { uri: string; cid: string };
    parent: { uri: string; cid: string };
  };
  facets?: Array<{
    index: { byteStart: number; byteEnd: number };
    features: Array<{
      $type: string;
      tag?: string;
      uri?: string;
      did?: string;
    }>;
  }>;
}

export interface BlueskyBlob {
  ref: {
    $link: string;
  };
  mimeType: string;
  size: number;
}
```

### Phase 2: Auth Service

**New File**: `src/services/bluesky/auth.ts`

```typescript
import type { BlueskyAccount, Session } from '../../types';
import {
  getCachedAccounts,
  cacheAccounts,
  clearAccountCache,
  isCacheValid,
  isTokenExpired,
  ACCOUNT_CACHE_TTL,
} from '../../utils/cache';
import { ConnectionError, SessionError } from '../../utils/errors';
import type { BlueskyUser } from './types';

// ============================================================================
// In-Memory Session Cache
// ============================================================================

let sessionPromise: Promise<Session | null> | null = null;
let sessionCache: { data: Session | null; timestamp: number } | null = null;
const SESSION_CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

// ============================================================================
// Service Factory
// ============================================================================

export interface BlueskyAuthServiceConfig {
  apiBasePath?: string;
  pdsUrl?: string; // Personal Data Server URL (default: https://bsky.social)
}

export const createBlueskyAuthService = (config: BlueskyAuthServiceConfig = {}) => {
  const { apiBasePath = '', pdsUrl = 'https://bsky.social' } = config;

  return {
    /**
     * Validate app password by creating a session
     */
    validateAppPassword: async (handle: string, appPassword: string): Promise<BlueskyUser | null> => {
      try {
        const response = await fetch(`${pdsUrl}/xrpc/com.atproto.server.createSession`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            identifier: handle,
            password: appPassword,
          }),
        });

        if (!response.ok) {
          return null;
        }

        const session = await response.json();
        // Fetch profile to return user info
        const profileResponse = await fetch(
          `${pdsUrl}/xrpc/app.bsky.actor.getProfile?actor=${session.did}`,
          {
            headers: {
              Authorization: `Bearer ${session.accessJwt}`,
            },
          }
        );

        if (!profileResponse.ok) {
          return null;
        }

        return await profileResponse.json();
      } catch {
        return null;
      }
    },

    /**
     * Add a new Bluesky account with app password
     * This validates the credentials and stores the session token via the API route
     */
    addAccount: async (handle: string, appPassword: string): Promise<BlueskyAccount> => {
      const response = await fetch(`${apiBasePath}/api/auth/bluesky/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ handle, appPassword }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ConnectionError('bluesky', error.error || 'Failed to add Bluesky account');
      }

      // Clear cache to force refresh
      await clearAccountCache('bluesky');

      return response.json();
    },

    /**
     * Connect Bluesky account (same as addAccount for app password auth)
     */
    connect: async (handle: string, appPassword: string): Promise<BlueskyAccount> => {
      return blueskyAuthService.addAccount(handle, appPassword);
    },

    /**
     * Get connected Bluesky accounts with IndexedDB caching
     */
    getAccounts: async (forceRefresh = false): Promise<BlueskyAccount[]> => {
      // Check IndexedDB cache first
      if (!forceRefresh) {
        try {
          const cached = await getCachedAccounts('bluesky');
          if (cached && isCacheValid(cached.cachedAt, ACCOUNT_CACHE_TTL)) {
            // Verify tokens haven't expired
            const allTokensValid = cached.accounts.every((acc) => !isTokenExpired(acc));
            if (allTokensValid) {
              return cached.accounts as BlueskyAccount[];
            }
          }
        } catch {
          // Continue to fetch from API
        }
      }

      // Fetch from API
      const response = await fetch(`${apiBasePath}/api/auth/bluesky/accounts`);
      if (response.ok) {
        const accounts = await response.json();
        try {
          await cacheAccounts('bluesky', accounts);
        } catch {
          // Cache failure is non-fatal
        }
        return accounts;
      }
      return [];
    },

    /**
     * Remove a Bluesky account
     */
    removeAccount: async (accountId: string): Promise<void> => {
      const response = await fetch(`${apiBasePath}/api/auth/bluesky/accounts?accountId=${accountId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ConnectionError('bluesky', error.error || 'Failed to remove account');
      }

      await clearAccountCache('bluesky');
    },

    /**
     * Disconnect a Bluesky account (alias for removeAccount)
     */
    disconnect: async (accountId: string): Promise<void> => {
      return blueskyAuthService.removeAccount(accountId);
    },

    /**
     * Refresh session token (if needed)
     */
    refreshSession: async (refreshToken: string): Promise<{ accessJwt: string; refreshJwt: string }> => {
      const response = await fetch(`${pdsUrl}/xrpc/com.atproto.server.refreshSession`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) {
        throw new SessionError('Failed to refresh Bluesky session');
      }

      return response.json();
    },

    /**
     * Clear the account cache
     */
    clearCache: async (): Promise<void> => {
      await clearAccountCache('bluesky');
    },
  };
};

// Default instance
let blueskyAuthService: ReturnType<typeof createBlueskyAuthService>;

export const initBlueskyAuthService = (config: BlueskyAuthServiceConfig = {}) => {
  blueskyAuthService = createBlueskyAuthService(config);
  return blueskyAuthService;
};

export const getBlueskyAuthService = () => {
  if (!blueskyAuthService) {
    throw new Error('Bluesky auth service not initialized. Use IntegrationProvider.');
  }
  return blueskyAuthService;
};

export { blueskyAuthService };
```

### Phase 3: API Service (Optional - for future use)

**New File**: `src/services/bluesky/api.ts` (optional, for post operations)

This would contain methods for:
- Creating posts
- Editing posts
- Deleting posts
- Getting timeline
- Getting profile
- Uploading media
- etc.

This can be implemented later as needed.

### Phase 4: Export from Index

**Update**: `src/index.ts`

Add Bluesky exports:

```typescript
export {
  createBlueskyAuthService,
  initBlueskyAuthService,
  getBlueskyAuthService,
  type BlueskyAuthServiceConfig,
} from './services/bluesky/auth';
export type { BlueskyUser, BlueskyPost, BlueskyCreatePost, BlueskyBlob } from './services/bluesky/types';
```

**Update**: `src/services/index.ts` (if it exists)

Add Bluesky service exports.

### Phase 5: Integration Provider Updates

**Update**: `src/components/IntegrationProvider.tsx`

Add Bluesky service initialization:

```typescript
// In IntegrationProvider initialization
if (config.platforms?.includes('bluesky')) {
  initBlueskyAuthService({
    apiBasePath: config.apiBasePath,
    pdsUrl: config.blueskyPdsUrl, // Optional custom PDS
  });
}
```

## Files Summary

### New Files (3)

1. `packages/better-auth-connect/specs/bluesky-integration.md` - This spec
2. `packages/better-auth-connect/src/services/bluesky/auth.ts` - Auth service
3. `packages/better-auth-connect/src/services/bluesky/types.ts` - TypeScript types

### Files to Modify (3)

1. `packages/better-auth-connect/src/types.ts` - Add Bluesky platform types, config, permissions, features
2. `packages/better-auth-connect/src/index.ts` - Export Bluesky service
3. `packages/better-auth-connect/src/components/IntegrationProvider.tsx` - Initialize Bluesky service

### Optional Future Files

1. `packages/better-auth-connect/src/services/bluesky/api.ts` - API service for post operations
2. `packages/better-auth-connect/src/services/bluesky/index.ts` - Service exports

## Environment Variables Needed

```env
# Bluesky doesn't require client ID/secret for app password method
# But may need for OAuth if implemented
BLUESKY_PDS_URL=https://bsky.social  # Optional, defaults to public PDS
```

## PDS (Personal Data Server)

Bluesky is decentralized - users can host their own PDS:
- Default: `bsky.social` (public PDS)
- Custom PDS: User-controlled server
- API endpoints are the same, just different base URL

## Backend API Routes Required

The following API routes need to be implemented in the consuming application:

### `POST /api/auth/bluesky/accounts`

Creates a new Bluesky account connection.

**Request Body:**
```json
{
  "handle": "username.bsky.social",
  "appPassword": "xxxx-xxxx-xxxx-xxxx"
}
```

**Response:**
```json
{
  "id": "account-id",
  "userId": "user-id",
  "providerId": "bluesky",
  "accountId": "did:plc:...",
  "accessToken": "jwt-session-token",
  "refreshToken": "refresh-token",
  "handle": "username.bsky.social",
  "displayName": "Display Name",
  "avatar": "https://..."
}
```

**Implementation Notes:**
1. Validate handle and app password by calling `POST /com.atproto.server.createSession`
2. Get user profile using the session token
3. Store account in Better Auth database with `providerId = 'bluesky'`
4. Return account object

### `GET /api/auth/bluesky/accounts`

Returns all connected Bluesky accounts for the current user.

**Response:**
```json
[
  {
    "id": "account-id",
    "userId": "user-id",
    "providerId": "bluesky",
    "accountId": "did:plc:...",
    "accessToken": "jwt-session-token",
    "refreshToken": "refresh-token",
    "handle": "username.bsky.social",
    "displayName": "Display Name",
    "avatar": "https://..."
  }
]
```

### `DELETE /api/auth/bluesky/accounts?accountId=xxx`

Removes a Bluesky account connection.

**Response:** 200 OK

## Implementation Verification

When building the integration, ensure these features work correctly:

- [ ] App password authentication works correctly
- [ ] Session creation works correctly
- [ ] Session refresh works correctly
- [ ] Get connected accounts
- [ ] Disconnect account
- [ ] Account caching works
- [ ] Token expiration detection works
- [ ] Error handling is proper
- [ ] IntegrationProvider initializes service correctly

## Future Enhancements

1. **API Service**: Full API service for post operations (create, edit, delete posts)
2. **OAuth Flow**: Support for OAuth-style flow (if Bluesky adds it)
3. **Custom PDS**: Better support for custom PDS instances
4. **Media Upload**: Helper methods for image/video upload
5. **Feed Operations**: Timeline and feed fetching
6. **Thread Support**: Better thread/reply handling
7. **Search**: User and post search capabilities

---

## Notes

- Bluesky uses AT Protocol (not OAuth2)
- Decentralized architecture (PDS-based)
- Posts are called "skeets"
- Character limit: 300 by default (can be extended)
- Can edit posts after publishing
- No native drafts or scheduling
- Open protocol - well-documented
- Active development - features added regularly
- App password method is simplest for integration
- Service follows same pattern as DevTo (API key auth) but with app password




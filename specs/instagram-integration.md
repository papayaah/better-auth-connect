# Instagram Integration Specification

## Overview

Instagram integration uses **OAuth2 authentication via Meta Graph API**. Instagram requires Business or Creator accounts (personal accounts cannot connect). The integration uses Meta's unified Graph API, which also provides access to Facebook features.

## Better Auth Connect Architecture

**Type**: OAuth2 via Meta Graph API (Better Auth Native - Similar to Reddit/X/Discord)

**Integration Approach**:
- ✅ **Uses Better Auth OAuth Flow**: Configure in `socialProviders` (as Facebook provider), use `authClient.signIn.social()`
- ✅ **Uses Better Auth Token Management**: Automatic token storage, refresh, and revocation
- ✅ **Follows Reddit/X/Discord Pattern**: Same implementation pattern as existing OAuth integrations
- ✅ **Service Pattern**: Follows `better-auth-connect` service factory pattern (same as Reddit/X/Discord)

**Note**: Instagram uses Facebook OAuth (Meta Graph API), so it uses the same `facebook` provider in Better Auth with Instagram-specific scopes.

**Implementation Pattern**:
```typescript
// Custom auth service using Better Auth OAuth
const instagramAuthService = createInstagramAuthService({ authClient, apiBasePath });

// Connect with OAuth flow
await instagramAuthService.connect(instagramScopes);

// Better Auth handles:
// - OAuth redirect flow
// - Token exchange
// - Token storage in DB
// - Token refresh (long-lived tokens)
```

**Why Better Auth?**
- Instagram uses standard OAuth2 via Meta Graph API
- Better Auth handles OAuth flow and token management
- Same pattern as Reddit/X/Discord - consistent implementation
- Automatic token refresh (important for long-lived tokens)

**Comparison with Other Integrations**:
- **Reddit/X/Discord/Instagram (OAuth)**: Use `authClient.signIn.social()` → Better Auth handles OAuth2 flow
- **DevTo/BuyMeACoffee (API Key)**: Custom form → Validate key/token → Store in Better Auth DB manually
- **Bluesky (AT Protocol)**: Custom AT Protocol flow → App password auth, store token in Better Auth DB manually

## Instagram API Overview

- **Authentication**: OAuth2 via Meta Graph API
- **Base URL**: `https://graph.instagram.com` / `https://graph.facebook.com`
- **Documentation**: https://developers.facebook.com/docs/instagram-api
- **Developer Portal**: https://developers.facebook.com/
- **Account Requirements**: Business or Creator Instagram accounts only
- **OAuth Endpoints**:
  - Authorization: `https://www.facebook.com/v{version}/dialog/oauth`
  - Token: `https://graph.facebook.com/v{version}/oauth/access_token`

## Authentication Method

Instagram uses **OAuth2 Authorization Code Flow via Meta Graph API**:
- User redirects to Meta authorization page
- User grants permissions (scopes)
- Callback with authorization code
- Exchange code for access token and refresh token
- Long-lived tokens available (60 days, can be refreshed)
- Tokens stored in Better Auth database

**Important Notes:**
- Requires Facebook App setup in Meta Developers
- Instagram account must be Business or Creator type
- Account must be connected to a Facebook Page
- Short-lived tokens (1 hour) can be exchanged for long-lived (60 days)

## API Capabilities - What's Possible

This section details what operations can be performed with the Instagram Graph API:

### ✅ Read Operations

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Get User Profile** | `GET /{ig-user-id}` | ✅ Yes | Get Instagram Business/Creator account info |
| **Get User Media** | `GET /{ig-user-id}/media` | ✅ Yes | Get all posts (photos, videos, carousels) |
| **Get Single Media** | `GET /{media-id}` | ✅ Yes | Get specific post details |
| **Get Media Insights** | `GET /{media-id}/insights` | ✅ Yes | Get engagement metrics (requires permissions) |
| **Get Stories** | `GET /{ig-user-id}/stories` | ✅ Yes | Get active stories (24-hour lifespan) |
| **Get Story Insights** | `GET /{story-id}/insights` | ✅ Yes | Get story engagement metrics |
| **Get Reels** | `GET /{ig-user-id}/media?media_type=REELS` | ✅ Yes | Get user's reels |
| **Get Comments** | `GET /{media-id}/comments` | ✅ Yes | Get comments on a post |
| **Get Comment Replies** | `GET /{comment-id}/replies` | ✅ Yes | Get replies to a comment |
| **Get Hashtag Info** | `GET /ig_hashtag_search` | ✅ Yes | Search and get hashtag info |
| **Get User Insights** | `GET /{ig-user-id}/insights` | ✅ Yes | Account-level analytics |

### ✅ Write Operations

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Create Photo Post** | `POST /{ig-user-id}/media` + `POST /{ig-user-id}/media_publish` | ✅ Yes | Upload and publish photo (2-step process) |
| **Create Video Post** | `POST /{ig-user-id}/media` + `POST /{ig-user-id}/media_publish` | ✅ Yes | Upload and publish video (2-step process + status checks) |
| **Create Carousel Post** | `POST /{ig-user-id}/media` + `POST /{ig-user-id}/media_publish` | ✅ Yes | Multiple photos/videos in one post |
| **Create Reel** | `POST /{ig-user-id}/media` + `POST /{ig-user-id}/media_publish` | ✅ Yes | Upload and publish reel |
| **Create Story** | `POST /{ig-user-id}/media` + `POST /{ig-user-id}/media_publish` | ✅ Yes | Create story (expires in 24 hours) |
| **Reply to Comment** | `POST /{comment-id}/replies` | ✅ Yes | Reply to a comment |
| **Hide/Unhide Comment** | `POST /{comment-id}?hide=true/false` | ✅ Yes | Moderate comments |

### ⚠️ Limited/Partial Support

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Schedule Posts** | Various | ⚠️ Limited | Requires Facebook Creator Studio API or third-party |
| **Edit Post Caption** | `POST /{media-id}` | ⚠️ Limited | Can update caption, but limited editing |
| **Delete Post** | `DELETE /{media-id}` | ⚠️ Limited | Some media types cannot be deleted via API |
| **Direct Messages** | Various | ⚠️ Limited | Limited DM capabilities, mainly for business messaging |

### ❌ Not Available

| Operation | Status | Notes |
|-----------|--------|-------|
| **Edit Post Image/Video** | ❌ No | Cannot change media after posting |
| **Delete Comments** | ❌ No | Cannot delete comments, only hide them |
| **Edit Comments** | ❌ No | Cannot edit comments |
| **IGTV Posts** | ❌ Deprecated | IGTV merged into regular video posts |
| **Shopping Tags** | ❌ Limited | Requires special permissions and catalog setup |
| **DMs (Personal)** | ❌ No | Personal direct messages not accessible |
| **Live Videos** | ❌ No | Cannot create or manage live streams via API |

### 📝 Media Operations Details

**Creating Posts - Multi-Step Process:**

1. **Container Creation** (`POST /{ig-user-id}/media`):
   - Create media container with:
     - Image URL or caption
     - Media type (IMAGE, VIDEO, CAROUSEL, REELS, STORY)
     - Location, hashtags, mentions
   - Returns container ID

2. **Status Check** (for videos/reels):
   - Poll `GET /{container-id}?fields=status_code` until ready
   - Videos must be processed before publishing

3. **Publish** (`POST /{ig-user-id}/media_publish`):
   - Publish the container to Instagram
   - Returns published media ID

**Media Types Supported:**
- **IMAGE**: Single photo
- **VIDEO**: Single video (up to 60 seconds for feed, longer for reels)
- **CAROUSEL**: Multiple photos/videos in one post (up to 10 items)
- **REELS**: Short-form video (up to 90 seconds)
- **STORY**: Photo/video that expires in 24 hours

**Content Requirements:**
- Images: JPEG, PNG
- Videos: MP4, MOV
- Aspect ratios: 1:1 (square), 4:5 (portrait), 16:9 (landscape)
- Max file sizes: Varies by type

### 📊 Insights & Analytics

**Available Metrics:**
- **Media Insights**: Reach, impressions, engagement, saves, video views
- **Story Insights**: Reach, impressions, replies, exits, taps
- **Account Insights**: Followers, profile views, website clicks
- **Reel Insights**: Plays, likes, comments, shares, saves

**Requirements:**
- Business/Creator account
- `instagram_manage_insights` permission
- Account must be connected to a Facebook Page

### 💬 Comments Management

**Comment Operations:**
- ✅ Read all comments on posts
- ✅ Read replies to comments
- ✅ Reply to comments
- ✅ Hide/unhide comments (moderation)
- ❌ Cannot delete comments
- ❌ Cannot edit comments

### 🔍 Limitations

1. **Account Type Required**: Only Business or Creator accounts (not personal)
2. **Facebook Page Required**: Account must be linked to a Facebook Page
3. **Multi-Step Upload**: Posts require container creation → status check → publish
4. **Rate Limits**: Strict rate limits (varies by endpoint)
   - Default: 200 requests/hour per user
   - Can increase with app review
5. **Content Restrictions**: Must comply with Instagram Community Guidelines
6. **Video Processing**: Videos must be processed before publishing (can take time)
7. **Story Lifespan**: Stories expire after 24 hours automatically
8. **No Edit After Publish**: Cannot change media, only caption
9. **Deletion Restrictions**: Some media types cannot be deleted via API

### 📋 Required Permissions (Scopes)

| Permission | Description | Required For |
|------------|-------------|--------------|
| `instagram_basic` | Basic profile info | Minimum requirement |
| `instagram_manage_comments` | Read and moderate comments | Comment management |
| `instagram_manage_insights` | Access analytics | Insights/metrics |
| `instagram_content_publish` | Publish posts | Creating posts |
| `pages_read_engagement` | Read page engagement | Connected Facebook Page |
| `pages_manage_posts` | Manage page posts | Publishing (if using Page) |

## Implementation Plan

### Phase 1: Types & Platform Config

**Update**: `src/types.ts`

Add Instagram to platform types:

```typescript
export type Platform = 'reddit' | 'x' | 'devto' | 'bluesky' | 'buymeacoffee' | 'discord' | 'instagram';

export interface InstagramAccount extends BaseAccount {
  providerId: 'instagram' | 'facebook'; // Uses Facebook OAuth
  accountId: string; // Instagram User ID (IG User ID)
  accessToken: string;
  refreshToken: string | null;
  accessTokenExpiresAt: Date | string | null;
  scope: string;
  username?: string;
  accountType?: 'BUSINESS' | 'CREATOR';
  connectedPageId?: string; // Facebook Page ID
}

export type Account = RedditAccount | XAccount | DevToAccount | BlueskyAccount | BuyMeACoffeeAccount | DiscordAccount | InstagramAccount;
```

Add platform config:

```typescript
export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  // ... existing platforms
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    authType: 'oauth',
    defaultScopes: ['instagram_basic', 'instagram_manage_comments', 'instagram_content_publish'],
    callbackPath: '/app/integrations/instagram',
  },
};
```

Add permissions:

```typescript
export const INSTAGRAM_PERMISSIONS: Permission[] = [
  { id: 'instagram_basic', label: 'Basic profile', description: 'Access basic profile information (Required)', required: true, default: true },
  { id: 'instagram_manage_comments', label: 'Manage comments', description: 'Read and moderate comments', default: true },
  { id: 'instagram_manage_insights', label: 'View insights', description: 'Access analytics and metrics', default: false },
  { id: 'instagram_content_publish', label: 'Publish content', description: 'Create and publish posts', default: true },
  { id: 'pages_read_engagement', label: 'Read page engagement', description: 'Read Facebook Page engagement', default: false },
];

export const PLATFORM_PERMISSIONS: Record<Platform, Permission[]> = {
  // ... existing
  instagram: INSTAGRAM_PERMISSIONS,
};
```

Add features:

```typescript
export const PLATFORM_FEATURES: Record<Platform, PlatformFeature[]> = {
  // ... existing
  instagram: [
    { text: 'OAuth2 authentication via Meta Graph API' },
    { text: 'Secure token storage' },
    { text: 'Automatic token refresh (long-lived tokens)' },
    { text: 'Multi-account support' },
    { text: 'Create and publish posts (photos, videos, reels, stories)' },
    { text: 'Manage comments and engagement' },
    { text: 'Access insights and analytics' },
  ],
};
```

Add platform colors:

```typescript
export const PLATFORM_COLORS: Record<Platform, { primary: string; bg: string; hover: string }> = {
  // ... existing
  instagram: { primary: '#E4405F', bg: 'rgba(228, 64, 95, 0.1)', hover: '#C13584' },
};
```

**New File**: `src/services/instagram/types.ts`

```typescript
export interface InstagramUser {
  id: string;
  username: string;
  account_type: 'BUSINESS' | 'CREATOR';
  media_count?: number;
}

export interface InstagramMedia {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REELS';
  media_url?: string;
  permalink: string;
  caption?: string;
  timestamp: string;
  username: string;
  like_count?: number;
  comments_count?: number;
  thumbnail_url?: string;
}

export interface InstagramContainer {
  id: string;
  status_code: 'IN_PROGRESS' | 'FINISHED' | 'ERROR';
  status: string;
}

export interface InstagramInsights {
  impressions?: number;
  reach?: number;
  engagement?: number;
  saved?: number;
  video_views?: number;
}

export interface InstagramComment {
  id: string;
  text: string;
  username: string;
  timestamp: string;
  like_count?: number;
  replies?: InstagramComment[];
}

export interface InstagramCreateMedia {
  image_url?: string;
  video_url?: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REELS' | 'STORY';
  location_id?: string;
  user_tags?: Array<{ username: string; x: number; y: number }>;
  product_tags?: Array<{ product_id: string; x: number; y: number }>;
}
```

### Phase 2: Auth Service

**New File**: `src/services/instagram/auth.ts`

```typescript
import type { AuthClient, InstagramAccount, Session } from '../../types';
import {
  getCachedAccounts,
  cacheAccounts,
  clearAccountCache,
  isCacheValid,
  isTokenExpired,
  ACCOUNT_CACHE_TTL,
} from '../../utils/cache';
import { ConnectionError, SessionError } from '../../utils/errors';

// ============================================================================
// In-Memory Session Cache
// ============================================================================

let sessionPromise: Promise<Session | null> | null = null;
let sessionCache: { data: Session | null; timestamp: number } | null = null;
const SESSION_CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

// ============================================================================
// Service Factory
// ============================================================================

export interface InstagramAuthServiceConfig {
  authClient: AuthClient;
  apiBasePath?: string;
  callbackURL?: string;
}

export const createInstagramAuthService = (config: InstagramAuthServiceConfig) => {
  const { authClient, apiBasePath = '', callbackURL = '/app/integrations/instagram' } = config;

  return {
    /**
     * Connect Instagram account
     * - If user is logged in: links Instagram to existing account
     * - If user is not logged in: signs in with Instagram (creates new user if needed)
     */
    connect: async (scopes: string[] = ['instagram_basic', 'instagram_manage_comments', 'instagram_content_publish']) => {
      try {
        const session = await instagramAuthService.getSession();

        if (session?.user) {
          // User is logged in - link the account
          await authClient.linkSocial({
            provider: 'facebook', // Instagram uses Facebook OAuth
            callbackURL,
            scopes,
          });
        } else {
          // User not logged in - sign in with Instagram
          await authClient.signIn.social({
            provider: 'facebook', // Instagram uses Facebook OAuth
            callbackURL,
            scopes,
          });
        }
      } catch (error) {
        throw new ConnectionError('instagram', error instanceof Error ? error.message : undefined);
      }
    },

    /**
     * Sign in with Instagram (always creates new session)
     */
    signIn: async (scopes: string[] = ['instagram_basic', 'instagram_manage_comments', 'instagram_content_publish']) => {
      try {
        await authClient.signIn.social({
          provider: 'facebook', // Instagram uses Facebook OAuth
          callbackURL,
          scopes,
        });
      } catch (error) {
        throw new ConnectionError('instagram', error instanceof Error ? error.message : undefined);
      }
    },

    /**
     * Sign out
     */
    signOut: async () => {
      await authClient.signOut();
      sessionPromise = null;
      sessionCache = null;
    },

    /**
     * Get the current session with in-memory caching
     */
    getSession: async (): Promise<Session | null> => {
      // Check valid cached session
      if (sessionCache && Date.now() - sessionCache.timestamp < SESSION_CACHE_DURATION) {
        return sessionCache.data;
      }

      // Reuse in-flight request
      if (sessionPromise) {
        return sessionPromise;
      }

      // Create new request
      sessionPromise = authClient
        .getSession()
        .then((result) => {
          const session = result?.data || null;
          sessionCache = {
            data: session,
            timestamp: Date.now(),
          };
          sessionPromise = null;
          return session;
        })
        .catch((error) => {
          sessionPromise = null;
          throw new SessionError(error instanceof Error ? error.message : undefined);
        });

      return sessionPromise;
    },

    /**
     * Get connected Instagram accounts with IndexedDB caching
     */
    getAccounts: async (forceRefresh = false): Promise<InstagramAccount[]> => {
      // Check IndexedDB cache first
      if (!forceRefresh) {
        try {
          const cached = await getCachedAccounts('instagram');
          if (cached && isCacheValid(cached.cachedAt, ACCOUNT_CACHE_TTL)) {
            // Verify tokens haven't expired
            const allTokensValid = cached.accounts.every((acc) => !isTokenExpired(acc));
            if (allTokensValid) {
              return cached.accounts as InstagramAccount[];
            }
          }
        } catch {
          // Continue to fetch from API
        }
      }

      // Fetch from API
      const response = await fetch(`${apiBasePath}/api/auth/instagram/accounts`);
      if (response.ok) {
        const accounts = await response.json();
        try {
          await cacheAccounts('instagram', accounts);
        } catch {
          // Cache failure is non-fatal
        }
        return accounts;
      }
      return [];
    },

    /**
     * Disconnect an Instagram account
     */
    disconnect: async (accountId: string): Promise<void> => {
      const response = await fetch(`${apiBasePath}/api/auth/instagram/accounts?accountId=${accountId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ConnectionError('instagram', error.error || 'Failed to disconnect account');
      }

      await clearAccountCache('instagram');
    },

    /**
     * Exchange short-lived token for long-lived token
     */
    exchangeLongLivedToken: async (shortLivedToken: string): Promise<{ access_token: string; expires_in: number }> => {
      const response = await fetch(`${apiBasePath}/api/instagram/exchange-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: shortLivedToken }),
      });

      if (!response.ok) {
        throw new ConnectionError('instagram', 'Failed to exchange token');
      }

      return response.json();
    },

    /**
     * Refresh long-lived token
     */
    refreshLongLivedToken: async (longLivedToken: string): Promise<{ access_token: string; expires_in: number }> => {
      const response = await fetch(`${apiBasePath}/api/instagram/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: longLivedToken }),
      });

      if (!response.ok) {
        throw new ConnectionError('instagram', 'Failed to refresh token');
      }

      return response.json();
    },

    /**
     * Clear the account cache
     */
    clearCache: async () => {
      await clearAccountCache('instagram');
    },
  };
};

// Default instance (requires initialization via IntegrationProvider)
let instagramAuthService: ReturnType<typeof createInstagramAuthService>;

export const initInstagramAuthService = (config: InstagramAuthServiceConfig) => {
  instagramAuthService = createInstagramAuthService(config);
  return instagramAuthService;
};

export const getInstagramAuthService = () => {
  if (!instagramAuthService) {
    throw new Error('Instagram auth service not initialized. Use IntegrationProvider.');
  }
  return instagramAuthService;
};

export { instagramAuthService };
```

### Phase 3: API Service (Optional - for future use)

**New File**: `src/services/instagram/api.ts` (optional, for API operations)

This would contain methods for:
- Getting account info
- Getting media
- Creating media containers
- Publishing media
- Getting comments
- Managing comments
- Getting insights
- etc.

This can be implemented later as needed.

### Phase 4: Export from Index

**Update**: `src/index.ts`

Add Instagram exports:

```typescript
export {
  createInstagramAuthService,
  initInstagramAuthService,
  getInstagramAuthService,
  type InstagramAuthServiceConfig,
} from './services/instagram/auth';
export type {
  InstagramUser,
  InstagramMedia,
  InstagramContainer,
  InstagramInsights,
  InstagramComment,
  InstagramCreateMedia,
} from './services/instagram/types';
```

### Phase 5: Integration Provider Updates

**Update**: `src/components/IntegrationProvider.tsx`

Add Instagram service initialization:

```typescript
// In IntegrationProvider initialization
if (config.platforms?.includes('instagram')) {
  initInstagramAuthService({
    authClient: config.authClient,
    apiBasePath: config.apiBasePath,
    callbackURL: '/app/integrations/instagram',
  });
}
```

## Files Summary

### New Files (3)

1. `packages/better-auth-connect/specs/instagram-integration.md` - This spec
2. `packages/better-auth-connect/src/services/instagram/auth.ts` - Auth service
3. `packages/better-auth-connect/src/services/instagram/types.ts` - TypeScript types

### Files to Modify (3)

1. `packages/better-auth-connect/src/types.ts` - Add Instagram platform types, config, permissions, features
2. `packages/better-auth-connect/src/index.ts` - Export Instagram service
3. `packages/better-auth-connect/src/components/IntegrationProvider.tsx` - Initialize Instagram service

### Optional Future Files

1. `packages/better-auth-connect/src/services/instagram/api.ts` - API service for Instagram operations
2. `packages/better-auth-connect/src/services/instagram/index.ts` - Service exports

## Backend API Routes Required

The following API routes need to be implemented in the consuming application:

### `GET /api/auth/instagram/accounts`

Returns all connected Instagram accounts for the current user.

**Response:**
```json
[
  {
    "id": "account-id",
    "userId": "user-id",
    "providerId": "instagram",
    "accountId": "ig-user-id",
    "accessToken": "hidden",
    "refreshToken": "hidden",
    "accessTokenExpiresAt": "2024-01-01T00:00:00Z",
    "scope": "instagram_basic,instagram_manage_comments",
    "username": "username",
    "accountType": "BUSINESS",
    "connectedPageId": "page-id"
  }
]
```

### `DELETE /api/auth/instagram/accounts?accountId=xxx`

Removes an Instagram account connection.

**Response:** 200 OK

### `POST /api/instagram/exchange-token`

Exchanges a short-lived token (1 hour) for a long-lived token (60 days).

**Request Body:**
```json
{
  "token": "short-lived-access-token"
}
```

**Response:**
```json
{
  "access_token": "long-lived-token",
  "expires_in": 5184000
}
```

### `POST /api/instagram/refresh-token`

Refreshes a long-lived token (can be refreshed indefinitely).

**Request Body:**
```json
{
  "token": "long-lived-access-token"
}
```

**Response:**
```json
{
  "access_token": "refreshed-token",
  "expires_in": 5184000
}
```

## Better Auth Configuration Required

The consuming application needs to configure Facebook (for Instagram) in Better Auth's `socialProviders`:

```typescript
// In Better Auth configuration
socialProviders: {
  // ... other providers
  facebook: {
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    scope: ['instagram_basic', 'instagram_manage_comments', 'instagram_manage_insights', 'instagram_content_publish'],
  },
}
```

**Note**: Instagram uses Facebook OAuth, so you configure the `facebook` provider with Instagram-specific scopes.

## Environment Variables Needed

```env
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

## Redirect URI Configuration

In Meta Developers Portal (Facebook App):
- Development: `http://localhost:3000/api/auth/callback/facebook`
- Production: `https://yourdomain.com/api/auth/callback/facebook`

Better Auth automatically constructs the callback URL as:
`{baseURL}/api/auth/callback/facebook`

## Instagram Setup Requirements

1. **Create Facebook App** in Meta Developers Portal
2. **Add Instagram Graph API Product** to your app
3. **Link Instagram Business/Creator Account** to a Facebook Page
4. **Configure OAuth Redirect URI** in app settings
5. **Request Permissions** (scopes) during OAuth flow

## Security Considerations

**Token Management:**
- Better Auth handles OAuth token storage and refresh
- Short-lived tokens (1 hour) should be exchanged for long-lived (60 days)
- Long-lived tokens can be refreshed indefinitely
- Tokens automatically refreshed when expired

**Rate Limits:**
- Instagram has strict rate limits (200 requests/hour default)
- Implement rate limit handling in service layer
- Cache responses when appropriate
- Handle rate limit errors gracefully

**Permissions:**
- Request minimal scopes needed
- Clearly explain what each permission allows
- Allow users to review permissions before connecting

**Account Requirements:**
- Only Business or Creator accounts can connect
- Account must be linked to a Facebook Page
- Verify account type before allowing connection

## Implementation Verification

When building the integration, ensure these features work correctly:

- [ ] Create Facebook App in Meta Developers
- [ ] Configure Instagram Graph API product
- [ ] Link Instagram Business/Creator account to Facebook Page
- [ ] OAuth flow works correctly
- [ ] Token exchange (short-lived → long-lived) works correctly
- [ ] Token refresh works correctly
- [ ] List connected accounts
- [ ] Get user profile
- [ ] Get user media
- [ ] Create photo post (2-step process)
- [ ] Create video post (with status checking)
- [ ] Get comments
- [ ] Reply to comment
- [ ] Hide/unhide comment
- [ ] Get insights/metrics
- [ ] Handle rate limits gracefully
- [ ] Disconnect/revocation works correctly
- [ ] Clear cache on disconnect

## Future Enhancements

1. **API Service**: Full API service for Instagram operations (media, comments, insights)
2. **Reels Creation**: Full reel upload and publishing
3. **Stories**: Story creation and management
4. **Carousel Posts**: Multi-image/video carousels
5. **Scheduling**: Post scheduling (via Creator Studio API or third-party)
6. **Analytics Dashboard**: Comprehensive insights visualization
7. **Comment Moderation**: Advanced moderation tools
8. **Hashtag Research**: Hashtag performance and suggestions
9. **Shopping Tags**: Product tagging (requires catalog setup)

---

## Notes

- Instagram requires Business or Creator accounts (not personal)
- Account must be linked to a Facebook Page
- Uses Meta Graph API (same as Facebook) - configured as `facebook` provider in Better Auth
- Multi-step upload process for posts (container → status check → publish)
- Long-lived tokens last 60 days and can be refreshed indefinitely
- Rate limits are strict (200 requests/hour default)
- Video posts require status polling before publishing
- Stories expire automatically after 24 hours
- **Follows Reddit/X/Discord pattern** (OAuth2 authentication)
- Uses `connect()`, `signIn()`, `getSession()` (not `addAccount()` like API key platforms)
- Uses Facebook OAuth provider with Instagram-specific scopes



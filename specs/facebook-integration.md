# Facebook Integration Specification

## Overview

Facebook integration uses **OAuth2 authentication via Meta Graph API**. Facebook's Graph API is one of the most comprehensive social media APIs, providing access to user profiles, pages, groups, posts, events, messenger, and more.

## Better Auth Connect Architecture

**Type**: OAuth2 via Meta Graph API (Better Auth Native - Similar to Reddit/X/Discord/Instagram)

**Integration Approach**:
- ✅ **Uses Better Auth OAuth Flow**: Configure in `socialProviders`, use `authClient.signIn.social()`
- ✅ **Uses Better Auth Token Management**: Automatic token storage, refresh, and revocation
- ✅ **Follows Reddit/X/Discord/Instagram Pattern**: Same implementation pattern as existing OAuth integrations
- ✅ **Service Pattern**: Follows `better-auth-connect` service factory pattern (same as Reddit/X/Discord/Instagram)

**Implementation Pattern**:
```typescript
// Custom auth service using Better Auth OAuth
const facebookAuthService = createFacebookAuthService({ authClient, apiBasePath });

// Connect with OAuth flow
await facebookAuthService.connect(scopes);

// Better Auth handles:
// - OAuth redirect flow
// - Token exchange (short-lived → long-lived)
// - Token storage in DB
// - Token refresh (long-lived tokens can be refreshed indefinitely)
```

**Why Better Auth?**
- Facebook uses standard OAuth2 via Meta Graph API
- Better Auth handles OAuth flow and token management
- Same pattern as Reddit/X/Discord/Instagram - consistent implementation
- Automatic token refresh (critical for 60-day long-lived tokens)

**Special Considerations**:
- Facebook tokens can be exchanged for long-lived (60 days)
- Long-lived tokens can be refreshed indefinitely
- Page access tokens are separate from user tokens (handled separately)

**Comparison with Other Integrations**:
- **Reddit/X/Discord/Instagram/Facebook (OAuth)**: Use `authClient.signIn.social()` → Better Auth handles OAuth2 flow
- **DevTo/BuyMeACoffee (API Key)**: Custom form → Validate key/token → Store in Better Auth DB manually
- **Bluesky (AT Protocol)**: Custom AT Protocol flow → App password auth, store token in Better Auth DB manually

## Facebook API Overview

- **Authentication**: OAuth2 via Meta Graph API
- **Base URL**: `https://graph.facebook.com/v{version}`
- **Documentation**: https://developers.facebook.com/docs/graph-api
- **Developer Portal**: https://developers.facebook.com/
- **API Version**: Currently v19.0+ (versions deprecated after 2 years)
- **OAuth Endpoints**:
  - Authorization: `https://www.facebook.com/v{version}/dialog/oauth`
  - Token: `https://graph.facebook.com/v{version}/oauth/access_token`

## Authentication Method

Facebook uses **OAuth2 Authorization Code Flow via Meta Graph API**:
- User redirects to Facebook authorization page
- User grants permissions (scopes)
- Callback with authorization code
- Exchange code for access token
- Short-lived tokens (1-2 hours) can be exchanged for long-lived (60 days)
- Long-lived tokens can be refreshed indefinitely
- Tokens stored in Better Auth database

## API Capabilities - What's Possible

This section details what operations can be performed with the Facebook Graph API:

### ✅ Read Operations - User

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Get User Profile** | `GET /me` or `GET /{user-id}` | ✅ Yes | Get user's profile info (name, picture, email) |
| **Get User Posts** | `GET /me/posts` or `GET /{user-id}/posts` | ✅ Yes | Get user's timeline posts |
| **Get User Photos** | `GET /me/photos` | ✅ Yes | Get user's photos |
| **Get User Videos** | `GET /me/videos` | ✅ Yes | Get user's videos |
| **Get User Friends** | `GET /me/friends` | ⚠️ Limited | Limited access (only mutual friends or app users) |
| **Get User Likes** | `GET /me/likes` | ✅ Yes | Get pages/items user liked |
| **Get User Events** | `GET /me/events` | ✅ Yes | Get events user is attending/hosting |
| **Get User Groups** | `GET /me/groups` | ✅ Yes | Get groups user is member of |
| **Get User Pages** | `GET /me/accounts` | ✅ Yes | Get Facebook Pages user manages |

### ✅ Read Operations - Pages

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Get Page Info** | `GET /{page-id}` | ✅ Yes | Get page details (name, about, category) |
| **Get Page Posts** | `GET /{page-id}/posts` | ✅ Yes | Get all posts on page |
| **Get Page Photos** | `GET /{page-id}/photos` | ✅ Yes | Get page photos |
| **Get Page Videos** | `GET /{page-id}/videos` | ✅ Yes | Get page videos |
| **Get Page Events** | `GET /{page-id}/events` | ✅ Yes | Get events created by page |
| **Get Page Insights** | `GET /{page-id}/insights` | ✅ Yes | Get analytics/metrics |
| **Get Page Comments** | `GET /{post-id}/comments` | ✅ Yes | Get comments on page posts |
| **Get Page Messages** | `GET /{page-id}/conversations` | ✅ Yes | Get Messenger conversations |
| **Get Page Reviews** | `GET /{page-id}/ratings` | ✅ Yes | Get page reviews/ratings |
| **Get Page Feed** | `GET /{page-id}/feed` | ✅ Yes | Get page feed (posts + others' posts) |

### ✅ Read Operations - Groups

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Get Group Info** | `GET /{group-id}` | ✅ Yes | Get group details |
| **Get Group Posts** | `GET /{group-id}/feed` | ✅ Yes | Get group posts (with permissions) |
| **Get Group Members** | `GET /{group-id}/members` | ⚠️ Limited | Limited by group privacy settings |
| **Get Group Events** | `GET /{group-id}/events` | ✅ Yes | Get events in group |

### ✅ Read Operations - Posts & Comments

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Get Single Post** | `GET /{post-id}` | ✅ Yes | Get post details |
| **Get Post Comments** | `GET /{post-id}/comments` | ✅ Yes | Get all comments on post |
| **Get Comment Replies** | `GET /{comment-id}/comments` | ✅ Yes | Get replies to comment |
| **Get Post Reactions** | `GET /{post-id}/reactions` | ✅ Yes | Get likes/reactions (like, love, haha, etc.) |
| **Get Post Shares** | `GET /{post-id}/sharedposts` | ⚠️ Limited | Limited access |
| **Get Post Insights** | `GET /{post-id}/insights` | ✅ Yes | Get post metrics (for pages) |

### ✅ Write Operations - Posts

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Create Post (User)** | `POST /me/feed` | ✅ Yes | Post to user's timeline |
| **Create Post (Page)** | `POST /{page-id}/feed` | ✅ Yes | Post to page |
| **Create Post (Group)** | `POST /{group-id}/feed` | ✅ Yes | Post to group (with permissions) |
| **Create Photo Post** | `POST /me/photos` or `POST /{page-id}/photos` | ✅ Yes | Upload and post photo |
| **Create Video Post** | `POST /me/videos` or `POST /{page-id}/videos` | ✅ Yes | Upload and post video |
| **Edit Post** | `POST /{post-id}` | ✅ Yes | Update post message |
| **Delete Post** | `DELETE /{post-id}` | ✅ Yes | Delete a post |

### ✅ Write Operations - Comments

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Create Comment** | `POST /{post-id}/comments` | ✅ Yes | Comment on a post |
| **Reply to Comment** | `POST /{comment-id}/comments` | ✅ Yes | Reply to a comment |
| **Edit Comment** | `POST /{comment-id}` | ✅ Yes | Edit comment text |
| **Delete Comment** | `DELETE /{comment-id}` | ✅ Yes | Delete a comment |
| **Hide Comment** | `POST /{comment-id}` | ✅ Yes | Hide comment (for pages) |
| **Like Comment** | `POST /{comment-id}/likes` | ✅ Yes | Like a comment |

### ✅ Write Operations - Reactions

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Like Post** | `POST /{post-id}/likes` | ✅ Yes | Like a post |
| **Unlike Post** | `DELETE /{post-id}/likes` | ✅ Yes | Remove like |
| **React to Post** | `POST /{post-id}/reactions` | ✅ Yes | React with emoji (love, haha, wow, sad, angry) |
| **Remove Reaction** | `DELETE /{post-id}/reactions` | ✅ Yes | Remove reaction |

### ✅ Write Operations - Pages

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Create Page Post** | `POST /{page-id}/feed` | ✅ Yes | Post as page |
| **Update Page Info** | `POST /{page-id}` | ✅ Yes | Update page details |
| **Upload Page Photo** | `POST /{page-id}/photos` | ✅ Yes | Upload photo to page |
| **Upload Page Video** | `POST /{page-id}/videos` | ✅ Yes | Upload video to page |
| **Schedule Post** | `POST /{page-id}/feed` with `scheduled_publish_time` | ✅ Yes | Schedule future post |
| **Reply to Page Message** | `POST /{conversation-id}/messages` | ✅ Yes | Reply via Messenger |

### ✅ Write Operations - Events

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Create Event** | `POST /{page-id}/events` | ✅ Yes | Create event (page must be host) |
| **Update Event** | `POST /{event-id}` | ✅ Yes | Update event details |
| **Delete Event** | `DELETE /{event-id}` | ✅ Yes | Delete event |
| **Get Event Attendees** | `GET /{event-id}/attending` | ✅ Yes | Get attendees list |
| **Get Event Interested** | `GET /{event-id}/interested` | ✅ Yes | Get interested users |

### ✅ Write Operations - Groups

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Create Group Post** | `POST /{group-id}/feed` | ✅ Yes | Post to group (with permissions) |
| **Create Group Photo** | `POST /{group-id}/photos` | ✅ Yes | Upload photo to group |
| **Comment on Group Post** | `POST /{post-id}/comments` | ✅ Yes | Comment (with permissions) |

### ⚠️ Limited/Partial Support

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Share Post** | `POST /me/feed` with `link` | ⚠️ Limited | Can share via posting, but limited native share |
| **Get Friends List** | `GET /me/friends` | ⚠️ Limited | Only mutual friends or app users |
| **Send Message (User)** | Messenger API | ⚠️ Limited | Requires Messenger Platform setup |
| **Live Videos** | Various | ⚠️ Limited | Complex setup, requires permissions |
| **Stories** | Various | ⚠️ Limited | Limited API access to stories |

### ❌ Not Available

| Operation | Status | Notes |
|-----------|--------|-------|
| **Edit Post Media** | ❌ No | Cannot change photo/video after posting |
| **Get All Friends** | ❌ Limited | Privacy restrictions limit friend list access |
| **Personal Messages (Inbox)** | ❌ Limited | Messenger API has different requirements |
| **Marketplace Posts** | ❌ Limited | Marketplace API separate, limited access |
| **Watch Videos** | ❌ Limited | Watch platform has separate API |

### 📝 Post Operations Details

**Creating Posts:**
- Can post text, links, photos, videos
- Can tag users in posts
- Can add location
- Can set privacy (public, friends, custom)
- Can schedule posts (for pages)
- Can publish immediately or save as draft (pages)

**Post Types:**
- **Text Post**: Simple text message
- **Link Post**: Share URL with preview
- **Photo Post**: Single or multiple photos
- **Video Post**: Video with caption
- **Photo Album**: Multiple photos in album

**Content Requirements:**
- Text: Unlimited length (practical limits apply)
- Photos: JPEG, PNG, GIF, BMP
- Videos: MP4, MOV, AVI
- Max file sizes: 4MB (photos), 1.75GB (videos)

**Editing Posts:**
- ✅ Can edit post message
- ✅ Can edit caption
- ❌ Cannot change media after posting
- ✅ Can delete and repost

### 💬 Comments Management

**Comment Operations:**
- ✅ Read all comments on posts
- ✅ Read replies to comments
- ✅ Create comments
- ✅ Reply to comments
- ✅ Edit comments
- ✅ Delete comments
- ✅ Hide comments (page admins)
- ✅ Like comments
- ✅ Moderate comments (pages)

### 📊 Insights & Analytics

**Available Metrics:**
- **Page Insights**: Reach, impressions, engagement, page views, followers
- **Post Insights**: Reach, impressions, engagement, reactions, comments, shares
- **Video Insights**: Views, watch time, retention
- **Event Insights**: Attendance, interest, engagement
- **Demographics**: Age, gender, location of audience

**Requirements:**
- Page admin access required
- `pages_read_insights` permission needed
- Some insights require app review

### 🔔 Messenger Integration

**Messenger Capabilities:**
- ✅ Read page messages
- ✅ Send messages as page
- ✅ Reply to conversations
- ✅ Send attachments
- ✅ Mark as read
- ✅ Get conversation list
- ⚠️ Requires Messenger Platform setup
- ⚠️ User-to-user messages limited (privacy)

### 🎉 Events Management

**Event Operations:**
- ✅ Create events (page must host)
- ✅ Update event details
- ✅ Delete events
- ✅ Get attendees/interested lists
- ✅ Get event feed/posts
- ✅ Invite users (with permissions)

### 👥 Groups Operations

**Group Capabilities:**
- ✅ Post to groups (if admin/member with permissions)
- ✅ Get group posts/feed
- ✅ Comment on group posts
- ✅ Get group info
- ⚠️ Access limited by group privacy (public, closed, secret)
- ⚠️ Need admin/moderator permissions for management

### 🔍 Limitations

1. **Privacy Settings**: Many features limited by user privacy settings
2. **Friend List**: Can only see mutual friends or app users
3. **Rate Limits**: Strict rate limits (varies by endpoint and app type)
   - Default: 200 calls/hour per user
   - Can increase with app review
4. **App Review**: Many permissions require Facebook App Review
5. **Token Expiration**: Short-lived tokens (1-2 hours) need refresh
6. **Long-lived Tokens**: 60 days, can be refreshed indefinitely
7. **Page Access**: Must have admin/editor role on page
8. **Group Access**: Limited by group privacy and permissions
9. **Messenger**: Requires separate Messenger Platform setup
10. **API Versioning**: Versions deprecated after 2 years

### 📋 Required Permissions (Scopes)

**Basic Permissions:**
- `public_profile` - Basic profile info (always available)
- `email` - User's email address

**Extended Permissions:**
- `user_posts` - Access user's posts
- `user_photos` - Access user's photos
- `user_videos` - Access user's videos
- `pages_show_list` - List pages user manages
- `pages_read_engagement` - Read page engagement
- `pages_manage_posts` - Create/edit posts on pages
- `pages_read_insights` - Read page analytics
- `pages_messaging` - Send/receive messages as page
- `publish_to_groups` - Post to groups
- `groups_access_member_info` - Access group member info
- `user_events` - Access user events
- `pages_manage_events` - Manage page events
- `publish_video` - Publish videos

**App Review Required:**
- Most extended permissions require Facebook App Review
- Must provide use case and demo
- Review process can take days/weeks

## Implementation Plan

### Phase 1: Types & Platform Config

**Update**: `src/types.ts`

Add Facebook to platform types:

```typescript
export type Platform = 'reddit' | 'x' | 'devto' | 'bluesky' | 'buymeacoffee' | 'discord' | 'instagram' | 'facebook';

export interface FacebookAccount extends BaseAccount {
  providerId: 'facebook';
  accountId: string; // Facebook User ID
  accessToken: string;
  refreshToken: string | null;
  accessTokenExpiresAt: Date | string | null;
  scope: string;
  name?: string;
  email?: string;
  profilePicture?: string;
}

export type Account = RedditAccount | XAccount | DevToAccount | BlueskyAccount | BuyMeACoffeeAccount | DiscordAccount | InstagramAccount | FacebookAccount;
```

Add platform config:

```typescript
export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  // ... existing platforms
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    authType: 'oauth',
    defaultScopes: ['public_profile', 'email', 'user_posts', 'pages_show_list', 'pages_read_engagement'],
    callbackPath: '/app/integrations/facebook',
  },
};
```

Add permissions:

```typescript
export const FACEBOOK_PERMISSIONS: Permission[] = [
  { id: 'public_profile', label: 'Public profile', description: 'Access basic profile information (Required)', required: true, default: true },
  { id: 'email', label: 'Email address', description: 'Access email address', default: true },
  { id: 'user_posts', label: 'User posts', description: 'Access your posts', default: true },
  { id: 'user_photos', label: 'User photos', description: 'Access your photos', default: false },
  { id: 'user_videos', label: 'User videos', description: 'Access your videos', default: false },
  { id: 'pages_show_list', label: 'Pages list', description: 'List pages you manage', default: true },
  { id: 'pages_read_engagement', label: 'Read page engagement', description: 'Read page engagement metrics', default: false },
  { id: 'pages_manage_posts', label: 'Manage page posts', description: 'Create and edit posts on pages (Requires App Review)', default: false },
  { id: 'pages_read_insights', label: 'Read page insights', description: 'Access page analytics (Requires App Review)', default: false },
  { id: 'publish_to_groups', label: 'Publish to groups', description: 'Post to groups (Requires App Review)', default: false },
];

export const PLATFORM_PERMISSIONS: Record<Platform, Permission[]> = {
  // ... existing
  facebook: FACEBOOK_PERMISSIONS,
};
```

Add features:

```typescript
export const PLATFORM_FEATURES: Record<Platform, PlatformFeature[]> = {
  // ... existing
  facebook: [
    { text: 'OAuth2 authentication via Meta Graph API' },
    { text: 'Secure token storage' },
    { text: 'Automatic token refresh (long-lived tokens)' },
    { text: 'Multi-account support' },
    { text: 'Create and manage posts (user, pages, groups)' },
    { text: 'Upload photos and videos' },
    { text: 'Manage comments and engagement' },
    { text: 'Access insights and analytics' },
    { text: 'Page and group management' },
  ],
};
```

Add platform colors:

```typescript
export const PLATFORM_COLORS: Record<Platform, { primary: string; bg: string; hover: string }> = {
  // ... existing
  facebook: { primary: '#1877F2', bg: 'rgba(24, 119, 242, 0.1)', hover: '#166FE5' },
};
```

**New File**: `src/services/facebook/types.ts`

```typescript
export interface FacebookUser {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
      width: number;
      height: number;
    };
  };
}

export interface FacebookPost {
  id: string;
  message?: string;
  story?: string;
  created_time: string;
  updated_time: string;
  permalink_url?: string;
  from?: {
    id: string;
    name: string;
  };
  likes?: {
    summary: {
      total_count: number;
    };
  };
  comments?: {
    summary: {
      total_count: number;
    };
  };
  shares?: {
    count: number;
  };
}

export interface FacebookPage {
  id: string;
  name: string;
  category: string;
  access_token: string; // Page access token
  picture?: {
    data: {
      url: string;
    };
  };
}

export interface FacebookComment {
  id: string;
  message: string;
  from: {
    id: string;
    name: string;
  };
  created_time: string;
  like_count?: number;
  replies?: {
    data: FacebookComment[];
  };
}

export interface FacebookCreatePost {
  message?: string;
  link?: string;
  place?: string;
  published?: boolean;
  scheduled_publish_time?: number;
  privacy?: {
    value: 'EVERYONE' | 'ALL_FRIENDS' | 'FRIENDS_OF_FRIENDS' | 'SELF' | 'CUSTOM';
  };
}

export interface FacebookInsights {
  name: string;
  period: string;
  values: Array<{
    value: number | { [key: string]: number };
    end_time: string;
  }>;
}
```

### Phase 2: Auth Service

**New File**: `src/services/facebook/auth.ts`

```typescript
import type { AuthClient, FacebookAccount, Session } from '../../types';
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

export interface FacebookAuthServiceConfig {
  authClient: AuthClient;
  apiBasePath?: string;
  callbackURL?: string;
}

export const createFacebookAuthService = (config: FacebookAuthServiceConfig) => {
  const { authClient, apiBasePath = '', callbackURL = '/app/integrations/facebook' } = config;

  return {
    /**
     * Connect Facebook account
     * - If user is logged in: links Facebook to existing account
     * - If user is not logged in: signs in with Facebook (creates new user if needed)
     */
    connect: async (scopes: string[] = ['public_profile', 'email', 'user_posts', 'pages_show_list']) => {
      try {
        const session = await facebookAuthService.getSession();

        if (session?.user) {
          // User is logged in - link the account
          await authClient.linkSocial({
            provider: 'facebook',
            callbackURL,
            scopes,
          });
        } else {
          // User not logged in - sign in with Facebook
          await authClient.signIn.social({
            provider: 'facebook',
            callbackURL,
            scopes,
          });
        }
      } catch (error) {
        throw new ConnectionError('facebook', error instanceof Error ? error.message : undefined);
      }
    },

    /**
     * Sign in with Facebook (always creates new session)
     */
    signIn: async (scopes: string[] = ['public_profile', 'email', 'user_posts', 'pages_show_list']) => {
      try {
        await authClient.signIn.social({
          provider: 'facebook',
          callbackURL,
          scopes,
        });
      } catch (error) {
        throw new ConnectionError('facebook', error instanceof Error ? error.message : undefined);
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
     * Get connected Facebook accounts with IndexedDB caching
     */
    getAccounts: async (forceRefresh = false): Promise<FacebookAccount[]> => {
      // Check IndexedDB cache first
      if (!forceRefresh) {
        try {
          const cached = await getCachedAccounts('facebook');
          if (cached && isCacheValid(cached.cachedAt, ACCOUNT_CACHE_TTL)) {
            // Verify tokens haven't expired
            const allTokensValid = cached.accounts.every((acc) => !isTokenExpired(acc));
            if (allTokensValid) {
              return cached.accounts as FacebookAccount[];
            }
          }
        } catch {
          // Continue to fetch from API
        }
      }

      // Fetch from API
      const response = await fetch(`${apiBasePath}/api/auth/facebook/accounts`);
      if (response.ok) {
        const accounts = await response.json();
        try {
          await cacheAccounts('facebook', accounts);
        } catch {
          // Cache failure is non-fatal
        }
        return accounts;
      }
      return [];
    },

    /**
     * Disconnect a Facebook account
     */
    disconnect: async (accountId: string): Promise<void> => {
      const response = await fetch(`${apiBasePath}/api/auth/facebook/accounts?accountId=${accountId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ConnectionError('facebook', error.error || 'Failed to disconnect account');
      }

      await clearAccountCache('facebook');
    },

    /**
     * Exchange short-lived token for long-lived token
     */
    exchangeLongLivedToken: async (shortLivedToken: string): Promise<{ access_token: string; expires_in: number }> => {
      const response = await fetch(`${apiBasePath}/api/facebook/exchange-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: shortLivedToken }),
      });

      if (!response.ok) {
        throw new ConnectionError('facebook', 'Failed to exchange token');
      }

      return response.json();
    },

    /**
     * Refresh long-lived token
     */
    refreshLongLivedToken: async (longLivedToken: string): Promise<{ access_token: string; expires_in: number }> => {
      const response = await fetch(`${apiBasePath}/api/facebook/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: longLivedToken }),
      });

      if (!response.ok) {
        throw new ConnectionError('facebook', 'Failed to refresh token');
      }

      return response.json();
    },

    /**
     * Clear the account cache
     */
    clearCache: async () => {
      await clearAccountCache('facebook');
    },
  };
};

// Default instance (requires initialization via IntegrationProvider)
let facebookAuthService: ReturnType<typeof createFacebookAuthService>;

export const initFacebookAuthService = (config: FacebookAuthServiceConfig) => {
  facebookAuthService = createFacebookAuthService(config);
  return facebookAuthService;
};

export const getFacebookAuthService = () => {
  if (!facebookAuthService) {
    throw new Error('Facebook auth service not initialized. Use IntegrationProvider.');
  }
  return facebookAuthService;
};

export { facebookAuthService };
```

### Phase 3: API Service (Optional - for future use)

**New File**: `src/services/facebook/api.ts` (optional, for API operations)

This would contain methods for:
- Getting user profile
- Getting posts
- Creating posts
- Getting pages
- Creating page posts
- Getting comments
- Managing comments
- Getting insights
- etc.

This can be implemented later as needed.

### Phase 4: Export from Index

**Update**: `src/index.ts`

Add Facebook exports:

```typescript
export {
  createFacebookAuthService,
  initFacebookAuthService,
  getFacebookAuthService,
  type FacebookAuthServiceConfig,
} from './services/facebook/auth';
export type {
  FacebookUser,
  FacebookPost,
  FacebookPage,
  FacebookComment,
  FacebookCreatePost,
  FacebookInsights,
} from './services/facebook/types';
```

### Phase 5: Integration Provider Updates

**Update**: `src/components/IntegrationProvider.tsx`

Add Facebook service initialization:

```typescript
// In IntegrationProvider initialization
if (config.platforms?.includes('facebook')) {
  initFacebookAuthService({
    authClient: config.authClient,
    apiBasePath: config.apiBasePath,
    callbackURL: '/app/integrations/facebook',
  });
}
```

## Files Summary

### New Files (3)

1. `packages/better-auth-connect/specs/facebook-integration.md` - This spec
2. `packages/better-auth-connect/src/services/facebook/auth.ts` - Auth service
3. `packages/better-auth-connect/src/services/facebook/types.ts` - TypeScript types

### Files to Modify (3)

1. `packages/better-auth-connect/src/types.ts` - Add Facebook platform types, config, permissions, features
2. `packages/better-auth-connect/src/index.ts` - Export Facebook service
3. `packages/better-auth-connect/src/components/IntegrationProvider.tsx` - Initialize Facebook service

### Optional Future Files

1. `packages/better-auth-connect/src/services/facebook/api.ts` - API service for Facebook operations
2. `packages/better-auth-connect/src/services/facebook/index.ts` - Service exports

## Backend API Routes Required

The following API routes need to be implemented in the consuming application:

### `GET /api/auth/facebook/accounts`

Returns all connected Facebook accounts for the current user.

**Response:**
```json
[
  {
    "id": "account-id",
    "userId": "user-id",
    "providerId": "facebook",
    "accountId": "facebook-user-id",
    "accessToken": "hidden",
    "refreshToken": "hidden",
    "accessTokenExpiresAt": "2024-01-01T00:00:00Z",
    "scope": "public_profile,email,user_posts",
    "name": "User Name",
    "email": "user@example.com",
    "profilePicture": "https://..."
  }
]
```

### `DELETE /api/auth/facebook/accounts?accountId=xxx`

Removes a Facebook account connection.

**Response:** 200 OK

### `POST /api/facebook/exchange-token`

Exchanges a short-lived token (1-2 hours) for a long-lived token (60 days).

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

### `POST /api/facebook/refresh-token`

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

The consuming application needs to configure Facebook in Better Auth's `socialProviders`:

```typescript
// In Better Auth configuration
socialProviders: {
  // ... other providers
  facebook: {
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    scope: ['public_profile', 'email', 'user_posts', 'pages_show_list', 'pages_read_engagement', 'pages_manage_posts'],
  },
}
```

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

## App Review Process

Many Facebook permissions require App Review:

1. **Submit for Review**: Provide use case, demo video, sample accounts
2. **Review Timeline**: Usually 3-7 business days
3. **Approval**: Once approved, permissions are available to all users
4. **Maintenance**: Must maintain compliance with Platform Policies

**Common Permissions Requiring Review:**
- `pages_manage_posts` - Post to pages
- `pages_read_insights` - Read analytics
- `publish_to_groups` - Post to groups
- Most extended permissions

## Security Considerations

**Token Management:**
- Better Auth handles OAuth token storage and refresh
- Short-lived tokens (1-2 hours) should be exchanged for long-lived (60 days)
- Long-lived tokens can be refreshed indefinitely
- Tokens automatically refreshed when expired

**Rate Limits:**
- Facebook has strict rate limits (200 calls/hour default)
- Implement rate limit handling in service layer
- Cache responses when appropriate
- Handle rate limit errors gracefully

**Permissions:**
- Request minimal scopes needed
- Clearly explain what each permission allows
- Allow users to review permissions before connecting
- Many permissions require App Review - plan accordingly

**Privacy:**
- Respect user privacy settings
- Friend list access is very limited
- Some data may not be accessible due to privacy restrictions

## Implementation Verification

When building the integration, ensure these features work correctly:

- [ ] Create Facebook App in Meta Developers
- [ ] Configure OAuth redirect URIs
- [ ] Basic OAuth flow works correctly
- [ ] Token exchange (short-lived → long-lived) works correctly
- [ ] Token refresh works correctly
- [ ] List connected accounts
- [ ] Get user profile
- [ ] Get user posts
- [ ] Create user post
- [ ] Get pages user manages
- [ ] Create page post
- [ ] Get page posts
- [ ] Upload photo
- [ ] Get comments
- [ ] Create comment
- [ ] Like post
- [ ] Get page insights
- [ ] Handle rate limits gracefully
- [ ] Handle different privacy settings correctly
- [ ] Disconnect/revocation works correctly
- [ ] Clear cache on disconnect

## Future Enhancements

1. **API Service**: Full API service for Facebook operations (posts, pages, groups, events)
2. **Page Management**: Full page administration features
3. **Group Management**: Post and manage groups
4. **Event Management**: Create and manage events
5. **Messenger Integration**: Messenger Platform integration
6. **Analytics Dashboard**: Comprehensive insights visualization
7. **Scheduled Posts**: Post scheduling for pages
8. **Video Upload**: Advanced video posting
9. **Live Videos**: Live streaming integration
10. **Marketplace**: Marketplace listings (if API available)
11. **Stories**: Story creation and management

---

## Notes

- Facebook uses Meta Graph API (shared with Instagram)
- Long-lived tokens last 60 days and can be refreshed indefinitely
- Page access tokens are separate from user tokens
- Most extended permissions require App Review
- Rate limits are strict (200 calls/hour default, can increase with review)
- Privacy settings affect what data is accessible
- Friend list access is very limited (privacy restrictions)
- API versions deprecated after 2 years (must migrate)
- Groups access limited by privacy (public, closed, secret)
- Messenger requires separate Messenger Platform setup
- **Follows Reddit/X/Discord/Instagram pattern** (OAuth2 authentication)
- Uses `connect()`, `signIn()`, `getSession()` (not `addAccount()` like API key platforms)



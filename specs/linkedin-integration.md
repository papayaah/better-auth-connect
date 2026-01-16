# LinkedIn Integration Specification

## Overview

LinkedIn integration uses **OAuth2 authentication with OpenID Connect (OIDC)** (similar to Reddit/X). Users authorize the application through LinkedIn's OAuth flow, and access tokens are stored securely via Better Auth. LinkedIn uses OpenID Connect (OIDC) on top of OAuth2.

## Better Auth Connect Architecture

**Type**: OAuth2 + OpenID Connect (Better Auth Native - Similar to Reddit/X/Discord/Instagram/Facebook)

**Integration Approach**:
- ✅ **Uses Better Auth OAuth Flow**: Configure in `socialProviders`, use `authClient.signIn.social()`
- ⚠️ **May Need Custom Provider**: LinkedIn uses OIDC on top of OAuth2, Better Auth may need custom handling
- ✅ **Uses Better Auth Token Management**: Automatic token storage, refresh, and revocation
- ✅ **Follows Reddit/X/Discord/Instagram/Facebook Pattern**: Same implementation pattern as existing OAuth integrations
- ✅ **Service Pattern**: Follows `better-auth-connect` service factory pattern (same as Reddit/X/Discord/Instagram/Facebook)

**Implementation Pattern**:
```typescript
// Custom auth service using Better Auth OAuth
const linkedinAuthService = createLinkedInAuthService({ authClient, apiBasePath });

// Connect with OAuth flow
await linkedinAuthService.connect(scopes);

// Better Auth handles:
// - OAuth redirect flow (may need OIDC extension)
// - Token exchange
// - Token storage in DB
// - Token refresh
```

**Potential Issues**:
- LinkedIn uses OpenID Connect (OIDC), which is OAuth2 with additional claims
- Better Auth may need custom provider configuration for OIDC
- Standard OAuth2 flow should still work for basic authentication

**Why Better Auth?**
- LinkedIn supports OAuth2 (with OIDC)
- Better Auth handles OAuth flow and token management
- Same pattern as Reddit/X/Discord/Instagram/Facebook - consistent implementation
- Automatic token refresh and management

**Comparison with Other Integrations**:
- **Reddit/X/Discord/Instagram/Facebook/LinkedIn (OAuth)**: Use `authClient.signIn.social()` → Better Auth handles OAuth2 flow
- **DevTo/BuyMeACoffee (API Key)**: Custom form → Validate key/token → Store in Better Auth DB manually
- **Bluesky (AT Protocol)**: Custom AT Protocol flow → App password auth, store token in Better Auth DB manually

## LinkedIn API Overview

- **Authentication**: OAuth2 with OpenID Connect
- **Base URL**: `https://api.linkedin.com/v2`
- **Documentation**: https://learn.microsoft.com/en-us/linkedin/
- **Developer Portal**: https://www.linkedin.com/developers/
- **OAuth Endpoints**:
  - Authorization: `https://www.linkedin.com/oauth/v2/authorization`
  - Token: `https://www.linkedin.com/oauth/v2/accessToken`

## Authentication Method

LinkedIn uses **OAuth2 Authorization Code Flow with OpenID Connect**:
- User redirects to LinkedIn authorization page
- User grants permissions (scopes)
- Callback with authorization code
- Exchange code for access token and refresh token
- Tokens stored in Better Auth database

## API Capabilities - What's Possible

This section details what operations can be performed with the LinkedIn API:

### ✅ Read Operations

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Get User Profile** | `GET /v2/me` | ✅ Yes | Get authenticated user's profile (OIDC) |
| **Get User Email** | `GET /v2/emailAddress?q=members` | ✅ Yes | Get user's email address |
| **Get Own Posts** | `GET /v2/ugcPosts?q=authors&authors=List({userUrn})` | ✅ Yes | Fetch your published posts |
| **Get Single Post** | `GET /v2/ugcPosts/{postUrn}` | ✅ Yes | Get specific post by URN |
| **Get Post Comments** | `GET /v2/comments?q=parent&parent={postUrn}` | ✅ Yes | Fetch comments on your posts |
| **Get Comment Replies** | `GET /v2/comments?q=parent&parent={commentUrn}` | ✅ Yes | Get replies to comments |
| **Get Companies/Pages** | `GET /v2/organizationalEntityAcls?q=roleAssignee` | ✅ Yes | Get companies/pages you manage |
| **Get Company Posts** | `GET /v2/ugcPosts?q=authors&authors=List({companyUrn})` | ✅ Yes | Get posts from company pages |
| **Get Company Info** | `GET /v2/organizations/{companyUrn}` | ✅ Yes | Get company page details |
| **Get Connections** | `GET /v2/networkSizes/edges?edgeType=CompanyFollowedByMember` | ⚠️ Limited | Limited access to connections |

### ✅ Write Operations

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Create Member Post** | `POST /v2/ugcPosts` | ✅ Yes | Create post on your profile |
| **Create Company Post** | `POST /v2/ugcPosts` | ✅ Yes | Create post on company page (with author URN) |
| **Create Comment** | `POST /v2/comments` | ✅ Yes | Comment on a post |
| **Create Comment Reply** | `POST /v2/comments` | ✅ Yes | Reply to a comment |
| **Upload Image** | `POST /v2/assets?action=registerUpload` + Upload | ✅ Yes | Multi-step image upload process |
| **Update Post** | `PATCH /v2/ugcPosts/{postUrn}` | ⚠️ Limited | Can update some fields (not content after publish) |
| **Delete Post** | `DELETE /v2/ugcPosts/{postUrn}` | ✅ Yes | Delete your own posts |

### ⚠️ Limited/Partial Support

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Edit Post Content** | `PATCH /v2/ugcPosts/{postUrn}` | ⚠️ Limited | Can update metadata, but content editing restricted |
| **Get Analytics** | Various endpoints | ⚠️ Limited | Limited analytics, requires specific products |
| **Video Upload** | Multi-step process | ⚠️ Limited | Complex multi-step upload process |
| **Article Publishing** | Different API | ⚠️ Limited | Uses separate article API, requires different permissions |

### ❌ Not Available

| Operation | Status | Notes |
|-----------|--------|-------|
| **Get Drafts** | ❌ No | LinkedIn API does not provide draft access |
| **Edit Comments** | ❌ No | Cannot edit comments after posting |
| **Delete Comments** | ❌ No | Cannot delete comments via API |
| **Edit Post Content After Publish** | ❌ Limited | Very limited - mostly metadata only |
| **Reading Feed** | ❌ No | Cannot access LinkedIn feed/homepage |
| **Messaging** | ❌ No | LinkedIn messaging API not available |

### 📝 Post Operations Details

**Creating Posts:**
- Can create text posts, image posts, article shares
- Can set visibility (PUBLIC, CONNECTIONS, LOGGED_IN)
- Can target specific audiences
- Can add hashtags, mentions
- Can share articles with previews
- Can post to personal profile or company pages

**Post Types Supported:**
- **Text Posts**: Simple text content
- **Image Posts**: Single or multiple images
- **Article Shares**: Share external articles with preview
- **Video Posts**: Video content (complex upload process)
- **Carousel Posts**: Multiple images in carousel format

**Updating Posts:**
- ⚠️ **Limited**: Can update some metadata
- Cannot change post content after publishing
- Can update visibility settings
- Can delete and repost if needed

**Deleting Posts:**
- ✅ Can delete your own posts
- ✅ Can delete company page posts (if you manage the page)
- ❌ Cannot delete comments

### 💬 Comments & Engagement

**Reading Comments:**
- ✅ Can read all comments on your posts
- ✅ Can read replies to comments (nested comments)
- ✅ Includes commenter profile info
- ✅ Includes engagement metrics (likes, etc.)

**Creating Comments:**
- ✅ Can comment on any post (with permissions)
- ✅ Can reply to comments
- ✅ Can include mentions
- ❌ Cannot edit after posting
- ❌ Cannot delete after posting

### 🖼️ Image Upload Process

LinkedIn uses a **multi-step image upload**:

1. **Initialize Upload**: `POST /v2/assets?action=registerUpload`
   - Returns upload URL and asset URN
2. **Upload Image**: PUT to the returned upload URL
   - Upload actual image file
3. **Use Asset URN**: Include asset URN in post content
   - Reference in `content.media.id` field

**Image Requirements:**
- Supported formats: JPEG, PNG, GIF
- Max size: Varies (typically 10MB)
- Recommended: 1200x627px for optimal display

### 📊 Analytics & Metrics

**Available Metrics (Limited):**
- Post views (if enabled)
- Engagement counts (likes, comments, shares)
- Requires specific LinkedIn products
- Limited historical data

**Not Available:**
- Detailed analytics dashboard
- Follower growth metrics
- Profile view analytics (separate API/product)
- Advanced engagement metrics

### 🔍 Limitations

1. **No Drafts**: Cannot save or retrieve draft posts
2. **Limited Editing**: Cannot edit post content after publishing
3. **Rate Limits**: Daily rate limits (varies by endpoint)
   - Profile API: 500 requests/day
   - Share API: 100 posts/day per user
   - Comment API: 100 comments/day
4. **URN Format**: Must use URN format for all IDs (e.g., `urn:li:person:xxxxx`)
5. **Product Requirements**: Some features require specific LinkedIn products to be approved
6. **No Feed Access**: Cannot read LinkedIn home feed
7. **No Messaging**: LinkedIn messaging API not available

### 🏢 Company Pages

**Company Page Operations:**
- ✅ Post on behalf of company pages (if admin)
- ✅ Get company page posts
- ✅ Get company info and details
- ⚠️ Requires `w_organization_social` scope
- ⚠️ Requires Marketing Developer Platform product approval
- ⚠️ User must be admin/editor of the page

**Getting Company Pages:**
- Query `organizationalEntityAcls` to find pages user manages
- Returns list of company URNs user has access to
- Use company URN in post `author` field to post as company

### 📋 Required Permissions (Scopes)

**Basic Permissions:**
- `openid` - OpenID Connect authentication (required)
- `profile` - Basic profile information (required)
- `email` - Email address (optional)

**Extended Permissions:**
- `w_member_social` - Create/edit member posts (required for posting)
- `w_organization_social` - Create/edit organization posts (for company pages)
- `r_liteprofile` - Read basic profile (deprecated)
- `r_fullprofile` - Read full profile (deprecated)
- `rw_company_admin` - Manage company page (for admin features)

**Product Requirements:**
- `openid`, `profile`, `email` - Sign In with LinkedIn product (usually auto-approved)
- `w_member_social` - Share on LinkedIn product (requires approval)
- `w_organization_social` - Marketing Developer Platform product (requires approval)

## Implementation Plan

### Phase 1: Types & Platform Config

**Update**: `src/types.ts`

Add LinkedIn to platform types:

```typescript
export type Platform = 'reddit' | 'x' | 'devto' | 'bluesky' | 'buymeacoffee' | 'discord' | 'instagram' | 'facebook' | 'linkedin';

export interface LinkedInAccount extends BaseAccount {
  providerId: 'linkedin';
  accountId: string; // LinkedIn user ID (URN format: urn:li:person:xxxxx)
  accessToken: string;
  refreshToken: string | null;
  accessTokenExpiresAt: Date | string | null;
  scope: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  headline?: string;
}

export type Account = RedditAccount | XAccount | DevToAccount | BlueskyAccount | BuyMeACoffeeAccount | DiscordAccount | InstagramAccount | FacebookAccount | LinkedInAccount;
```

Add platform config:

```typescript
export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  // ... existing platforms
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    authType: 'oauth',
    defaultScopes: ['openid', 'profile', 'email', 'w_member_social'],
    callbackPath: '/app/integrations/linkedin',
  },
};
```

Add permissions:

```typescript
export const LINKEDIN_PERMISSIONS: Permission[] = [
  { id: 'openid', label: 'OpenID Connect', description: 'OpenID Connect authentication (Required)', required: true, default: true },
  { id: 'profile', label: 'Profile', description: 'Access basic profile information (Required)', required: true, default: true },
  { id: 'email', label: 'Email address', description: 'Access email address', default: true },
  { id: 'w_member_social', label: 'Share on LinkedIn', description: 'Create and edit posts (Requires Product Approval)', required: false, default: true },
  { id: 'w_organization_social', label: 'Share on company pages', description: 'Post on behalf of company pages (Requires Product Approval)', default: false },
];

export const PLATFORM_PERMISSIONS: Record<Platform, Permission[]> = {
  // ... existing
  linkedin: LINKEDIN_PERMISSIONS,
};
```

Add features:

```typescript
export const PLATFORM_FEATURES: Record<Platform, PlatformFeature[]> = {
  // ... existing
  linkedin: [
    { text: 'OAuth2 authentication with OpenID Connect' },
    { text: 'Secure token storage' },
    { text: 'Automatic token refresh' },
    { text: 'Multi-account support' },
    { text: 'Create and manage posts' },
    { text: 'Post to personal profile and company pages' },
    { text: 'Upload images and media' },
    { text: 'Manage comments and engagement' },
  ],
};
```

Add platform colors:

```typescript
export const PLATFORM_COLORS: Record<Platform, { primary: string; bg: string; hover: string }> = {
  // ... existing
  linkedin: { primary: '#0A66C2', bg: 'rgba(10, 102, 194, 0.1)', hover: '#004182' },
};
```

**New File**: `src/services/linkedin/types.ts`

```typescript
export interface LinkedInUser {
  id: string; // URN format: urn:li:person:xxxxx
  firstName: {
    localized: Record<string, string>;
    preferredLocale: {
      country: string;
      language: string;
    };
  };
  lastName: {
    localized: Record<string, string>;
    preferredLocale: {
      country: string;
      language: string;
    };
  };
  headline?: string;
  profilePicture?: {
    displayImage: string;
  };
  email?: string;
}

export interface LinkedInPost {
  id?: string; // URN format: urn:li:ugcPost:xxxxx
  author: string; // URN format
  commentary: string; // Post text content
  visibility: 'PUBLIC' | 'CONNECTIONS' | 'LOGGED_IN';
  content?: {
    media?: {
      id: string; // Asset URN
    };
    article?: {
      source: string;
      title: string;
    };
  };
  distribution?: {
    feedDistribution: 'MAIN_FEED' | 'NONE';
    targetEntities?: string[];
  };
  lifecycleState?: 'PUBLISHED' | 'DRAFT';
  created?: {
    time: number;
  };
  lastModified?: {
    time: number;
  };
}

export interface LinkedInCompany {
  id: string; // URN format: urn:li:organization:xxxxx
  name: string;
  logoUrl?: string;
  description?: string;
}

export interface LinkedInComment {
  id: string; // URN format
  message: string;
  actor: string; // URN format
  created: {
    time: number;
  };
  likes?: {
    total: number;
  };
}

export interface LinkedInAsset {
  id: string; // Asset URN
  uploadUrl: string;
  uploadInstructions: {
    uploadUrl: string;
    firstByte: number;
    lastByte: number;
  };
}
```

### Phase 2: Auth Service

**New File**: `src/services/linkedin/auth.ts`

```typescript
import type { AuthClient, LinkedInAccount, Session } from '../../types';
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

export interface LinkedInAuthServiceConfig {
  authClient: AuthClient;
  apiBasePath?: string;
  callbackURL?: string;
}

export const createLinkedInAuthService = (config: LinkedInAuthServiceConfig) => {
  const { authClient, apiBasePath = '', callbackURL = '/app/integrations/linkedin' } = config;

  return {
    /**
     * Connect LinkedIn account
     * - If user is logged in: links LinkedIn to existing account
     * - If user is not logged in: signs in with LinkedIn (creates new user if needed)
     */
    connect: async (scopes: string[] = ['openid', 'profile', 'email', 'w_member_social']) => {
      try {
        const session = await linkedinAuthService.getSession();

        if (session?.user) {
          // User is logged in - link the account
          await authClient.linkSocial({
            provider: 'linkedin',
            callbackURL,
            scopes,
          });
        } else {
          // User not logged in - sign in with LinkedIn
          await authClient.signIn.social({
            provider: 'linkedin',
            callbackURL,
            scopes,
          });
        }
      } catch (error) {
        throw new ConnectionError('linkedin', error instanceof Error ? error.message : undefined);
      }
    },

    /**
     * Sign in with LinkedIn (always creates new session)
     */
    signIn: async (scopes: string[] = ['openid', 'profile', 'email', 'w_member_social']) => {
      try {
        await authClient.signIn.social({
          provider: 'linkedin',
          callbackURL,
          scopes,
        });
      } catch (error) {
        throw new ConnectionError('linkedin', error instanceof Error ? error.message : undefined);
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
     * Get connected LinkedIn accounts with IndexedDB caching
     */
    getAccounts: async (forceRefresh = false): Promise<LinkedInAccount[]> => {
      // Check IndexedDB cache first
      if (!forceRefresh) {
        try {
          const cached = await getCachedAccounts('linkedin');
          if (cached && isCacheValid(cached.cachedAt, ACCOUNT_CACHE_TTL)) {
            // Verify tokens haven't expired
            const allTokensValid = cached.accounts.every((acc) => !isTokenExpired(acc));
            if (allTokensValid) {
              return cached.accounts as LinkedInAccount[];
            }
          }
        } catch {
          // Continue to fetch from API
        }
      }

      // Fetch from API
      const response = await fetch(`${apiBasePath}/api/auth/linkedin/accounts`);
      if (response.ok) {
        const accounts = await response.json();
        try {
          await cacheAccounts('linkedin', accounts);
        } catch {
          // Cache failure is non-fatal
        }
        return accounts;
      }
      return [];
    },

    /**
     * Disconnect a LinkedIn account
     */
    disconnect: async (accountId: string): Promise<void> => {
      const response = await fetch(`${apiBasePath}/api/auth/linkedin/accounts?accountId=${accountId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ConnectionError('linkedin', error.error || 'Failed to disconnect account');
      }

      await clearAccountCache('linkedin');
    },

    /**
     * Clear the account cache
     */
    clearCache: async () => {
      await clearAccountCache('linkedin');
    },
  };
};

// Default instance (requires initialization via IntegrationProvider)
let linkedinAuthService: ReturnType<typeof createLinkedInAuthService>;

export const initLinkedInAuthService = (config: LinkedInAuthServiceConfig) => {
  linkedinAuthService = createLinkedInAuthService(config);
  return linkedinAuthService;
};

export const getLinkedInAuthService = () => {
  if (!linkedinAuthService) {
    throw new Error('LinkedIn auth service not initialized. Use IntegrationProvider.');
  }
  return linkedinAuthService;
};

export { linkedinAuthService };
```

### Phase 3: API Service (Optional - for future use)

**New File**: `src/services/linkedin/api.ts` (optional, for API operations)

This would contain methods for:
- Getting user profile
- Getting email
- Getting companies/pages
- Creating posts
- Uploading images
- Getting posts
- Managing comments
- etc.

This can be implemented later as needed.

### Phase 4: Export from Index

**Update**: `src/index.ts`

Add LinkedIn exports:

```typescript
export {
  createLinkedInAuthService,
  initLinkedInAuthService,
  getLinkedInAuthService,
  type LinkedInAuthServiceConfig,
} from './services/linkedin/auth';
export type {
  LinkedInUser,
  LinkedInPost,
  LinkedInCompany,
  LinkedInComment,
  LinkedInAsset,
} from './services/linkedin/types';
```

### Phase 5: Integration Provider Updates

**Update**: `src/components/IntegrationProvider.tsx`

Add LinkedIn service initialization:

```typescript
// In IntegrationProvider initialization
if (config.platforms?.includes('linkedin')) {
  initLinkedInAuthService({
    authClient: config.authClient,
    apiBasePath: config.apiBasePath,
    callbackURL: '/app/integrations/linkedin',
  });
}
```

## Files Summary

### New Files (3)

1. `packages/better-auth-connect/specs/linkedin-integration.md` - This spec
2. `packages/better-auth-connect/src/services/linkedin/auth.ts` - Auth service
3. `packages/better-auth-connect/src/services/linkedin/types.ts` - TypeScript types

### Files to Modify (3)

1. `packages/better-auth-connect/src/types.ts` - Add LinkedIn platform types, config, permissions, features
2. `packages/better-auth-connect/src/index.ts` - Export LinkedIn service
3. `packages/better-auth-connect/src/components/IntegrationProvider.tsx` - Initialize LinkedIn service

### Optional Future Files

1. `packages/better-auth-connect/src/services/linkedin/api.ts` - API service for LinkedIn operations
2. `packages/better-auth-connect/src/services/linkedin/index.ts` - Service exports

## Backend API Routes Required

The following API routes need to be implemented in the consuming application:

### `GET /api/auth/linkedin/accounts`

Returns all connected LinkedIn accounts for the current user.

**Response:**
```json
[
  {
    "id": "account-id",
    "userId": "user-id",
    "providerId": "linkedin",
    "accountId": "urn:li:person:xxxxx",
    "accessToken": "hidden",
    "refreshToken": "hidden",
    "accessTokenExpiresAt": "2024-01-01T00:00:00Z",
    "scope": "openid profile email w_member_social",
    "firstName": "First",
    "lastName": "Last",
    "headline": "Software Engineer",
    "profilePicture": "https://..."
  }
]
```

### `DELETE /api/auth/linkedin/accounts?accountId=xxx`

Removes a LinkedIn account connection.

**Response:** 200 OK

## Better Auth Configuration Required

The consuming application needs to configure LinkedIn in Better Auth's `socialProviders`:

```typescript
// In Better Auth configuration
socialProviders: {
  // ... other providers
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    scope: ['openid', 'profile', 'email', 'w_member_social'],
  },
}
```

**Note**: LinkedIn uses OpenID Connect (OIDC) on top of OAuth2. Better Auth may need custom provider configuration to handle OIDC properly. Check Better Auth documentation for OIDC support.

## LinkedIn Scopes Reference

LinkedIn OAuth2 scopes:

| Scope | Description | Required | Product Required |
|-------|-------------|----------|------------------|
| `openid` | OpenID Connect authentication | Yes | Sign In with LinkedIn |
| `profile` | Basic profile information | Yes | Sign In with LinkedIn |
| `email` | Email address | No | Sign In with LinkedIn |
| `w_member_social` | Create/edit member posts | Required for posting | Share on LinkedIn |
| `w_organization_social` | Create/edit organization posts | For company pages | Marketing Developer Platform |
| `r_liteprofile` | Read basic profile (deprecated) | No | Legacy |
| `r_fullprofile` | Read full profile (deprecated) | No | Legacy |
| `rw_company_admin` | Manage company page | For admin features | Marketing Developer Platform |

**Required for basic posting:**
- `openid` (required)
- `profile` (required)
- `w_member_social` (required for posting)

**Note**: `w_member_social` requires the "Share on LinkedIn" product to be approved in your LinkedIn app.

## LinkedIn Products

LinkedIn requires specific products to be approved for certain scopes:

1. **Sign In with LinkedIn**: Required for `openid`, `profile`, `email`
   - Usually auto-approved
   - Basic authentication

2. **Share on LinkedIn**: Required for `w_member_social`
   - Requires approval
   - Allows posting content on behalf of users
   - Most important for posting functionality

3. **Marketing Developer Platform**: Required for company page features
   - Requires approval
   - Allows managing company pages
   - Required for `w_organization_social`

**Application Process:**
1. Create app in LinkedIn Developer Portal
2. Request product access
3. Wait for approval (can take days/weeks)
4. Once approved, scopes become available

## Environment Variables Needed

```env
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
```

## Redirect URI Configuration

In LinkedIn Developer Portal, set redirect URI:
- Development: `http://localhost:3000/api/auth/callback/linkedin`
- Production: `https://yourdomain.com/api/auth/callback/linkedin`

Better Auth automatically constructs the callback URL as:
`{baseURL}/api/auth/callback/linkedin`

## URN Format

LinkedIn uses URN (Uniform Resource Name) format for IDs:
- User: `urn:li:person:xxxxx`
- Company: `urn:li:organization:xxxxx`
- Post: `urn:li:ugcPost:xxxxx`

When working with LinkedIn API, use URNs instead of simple IDs.

## Security Considerations

**Token Management:**
- Better Auth handles OAuth token storage and refresh
- Tokens automatically refreshed when expired
- Revocation handled via LinkedIn OAuth revoke endpoint

**Rate Limits:**
- LinkedIn has daily rate limits per application
- Different limits for different endpoints
- Implement rate limit handling in service layer
- Cache responses when appropriate
- Handle rate limit errors gracefully

**Permissions:**
- Request minimal scopes needed
- Some scopes require product approval from LinkedIn
- Clearly explain what each permission allows
- Allow users to review permissions before connecting

**Product Approval:**
- Many features require LinkedIn product approval
- Plan ahead for approval timeline
- Provide clear use case in product application

## LinkedIn API Reference

**Base URL:** `https://api.linkedin.com/v2`

**Authentication:** Include access token in request header:
```
Authorization: Bearer <access-token>
```

**Common Endpoints:**
- `GET /me` - Get authenticated user profile (OIDC)
- `GET /v2/me` - Get detailed user profile
- `GET /v2/emailAddress` - Get user's email
- `POST /v2/ugcPosts` - Create post
- `GET /v2/ugcPosts` - Get posts
- `POST /v2/assets?action=registerUpload` - Initialize image upload
- `GET /v2/organizationalEntityAcls` - Get user's companies/pages

## Rate Limits

LinkedIn uses daily rate limits:
- **Profile API**: 500 requests/day per application
- **Share API**: 100 posts/day per user
- **Company Pages**: Varies by product tier

**Handling:**
- Track daily request counts
- Implement rate limit headers checking
- Cache responses to reduce API calls
- Show user-friendly error messages

## Implementation Verification

When building the integration, ensure these features work correctly:

- [ ] Create LinkedIn app in Developer Portal
- [ ] Request "Share on LinkedIn" product access
- [ ] Wait for product approval
- [ ] Add LinkedIn provider to Better Auth config (may need custom OIDC)
- [ ] OAuth flow (connect account) works correctly
- [ ] Token refresh works correctly
- [ ] List connected accounts
- [ ] Fetch user profile
- [ ] Fetch user email
- [ ] Get companies/pages user manages
- [ ] Create post
- [ ] Upload image (multi-step process)
- [ ] Get posts
- [ ] Handle rate limits gracefully
- [ ] Disconnect/revocation works correctly
- [ ] Clear cache on disconnect

## Future Enhancements

1. **API Service**: Full API service for LinkedIn operations (posts, companies, comments)
2. **Company Pages**: Full company page management
3. **Article Publishing**: Create LinkedIn articles
4. **Analytics**: Post performance metrics
5. **Comments**: Manage post comments
6. **Hashtag Analytics**: Track hashtag performance
7. **Video Upload**: Support video posts
8. **Carousel Posts**: Multi-image carousel posts
9. **Sponsored Content**: Manage sponsored posts (Marketing API)

---

## Notes

- LinkedIn uses OpenID Connect on top of OAuth2
- Product approval required for posting functionality (`w_member_social`)
- URN format used for all entity IDs
- Rate limits are daily, not per-second
- Image upload is multi-step process
- Company page features require Marketing Developer Platform product
- LinkedIn API documentation is comprehensive but complex
- **Follows Reddit/X/Discord/Instagram/Facebook pattern** (OAuth2 authentication)
- Uses `connect()`, `signIn()`, `getSession()` (not `addAccount()` like API key platforms)
- May need custom OIDC configuration in Better Auth



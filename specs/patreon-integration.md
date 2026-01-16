# Patreon Integration Specification

## Overview

Patreon integration uses **OAuth2 authentication** (similar to Reddit/X/Discord). Users authorize the application through Patreon's OAuth flow, and access tokens are stored securely via Better Auth. Patreon's API is primarily designed for creators to manage their campaigns, members (patrons), and read posts.

## Better Auth Connect Architecture

**Type**: OAuth2 (Better Auth Native - Similar to Reddit/X/Discord/Instagram/Facebook/LinkedIn)

**Integration Approach**:
- ✅ **Uses Better Auth OAuth Flow**: Configure in `socialProviders`, use `authClient.signIn.social()`
- ✅ **Uses Better Auth Token Management**: Automatic token storage, refresh, and revocation
- ✅ **Follows Reddit/X/Discord/Instagram/Facebook/LinkedIn Pattern**: Same implementation pattern as existing OAuth integrations
- ✅ **Service Pattern**: Follows `better-auth-connect` service factory pattern (same as Reddit/X/Discord/Instagram/Facebook/LinkedIn)

**Implementation Pattern**:
```typescript
// Custom auth service using Better Auth OAuth
const patreonAuthService = createPatreonAuthService({ authClient, apiBasePath });

// Connect with OAuth flow
await patreonAuthService.connect(scopes);

// Better Auth handles:
// - OAuth redirect flow
// - Token exchange
// - Token storage in DB
// - Token refresh
```

**Why Better Auth?**
- Patreon supports standard OAuth2
- Better Auth has built-in OAuth support
- Same pattern as Reddit/X/Discord/Instagram/Facebook/LinkedIn - consistent implementation
- Automatic token refresh and management

**Comparison with Other Integrations**:
- **Reddit/X/Discord/Instagram/Facebook/LinkedIn/Patreon (OAuth)**: Use `authClient.signIn.social()` → Better Auth handles OAuth2 flow
- **DevTo/BuyMeACoffee/Medium (API Key)**: Custom form → Validate key/token → Store in Better Auth DB manually
- **Bluesky (AT Protocol)**: Custom AT Protocol flow → App password auth, store token in Better Auth DB manually

## Patreon API Overview

- **Authentication**: OAuth2
- **Base URL**: `https://www.patreon.com/api/oauth2/v2`
- **Documentation**: https://docs.patreon.com/
- **Developer Portal**: https://www.patreon.com/portal/registration/register-clients
- **OAuth Endpoints**:
  - Authorization: `https://www.patreon.com/oauth2/authorize`
  - Token: `https://www.patreon.com/api/oauth2/token`

## Authentication Method

Patreon uses **OAuth2 Authorization Code Flow**:
- User redirects to Patreon authorization page
- User grants permissions (scopes)
- Callback with authorization code
- Exchange code for access token and refresh token
- Tokens stored in Better Auth database

## API Capabilities - What's Possible

This section details what operations can be performed with the Patreon API:

### ✅ Read Operations

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Get User Identity** | `GET /identity` | ✅ Yes | Get authenticated user's profile (creator or patron) |
| **Get Campaigns** | `GET /campaigns` | ✅ Yes | Get user's campaigns (if creator) |
| **Get Campaign Details** | `GET /campaigns/{id}` | ✅ Yes | Get specific campaign details |
| **Get Campaign Posts** | `GET /campaigns/{id}/posts` | ✅ Yes | Get all posts for a campaign |
| **Get Single Post** | `GET /posts/{id}` | ✅ Yes | Get specific post by ID |
| **Get Campaign Members** | `GET /campaigns/{id}/members` | ✅ Yes | Get all members (patrons) for a campaign |
| **Get Single Member** | `GET /members/{id}` | ✅ Yes | Get specific member details |
| **Get Member Address** | `GET /members/{id}?include=address` | ✅ Yes | Get member shipping address (requires scope) |
| **Get Benefits** | `GET /campaigns/{id}/benefits` | ✅ Yes | Get campaign benefits/tiers |
| **Get Goals** | `GET /campaigns/{id}/goals` | ✅ Yes | Get campaign funding goals |
| **Get Pledges** | `GET /members/{id}/pledges` | ✅ Yes | Get member's pledge information |

### ⚠️ Limited/Partial Support

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Update Campaign** | Various | ⚠️ Limited | Limited campaign management via API |
| **Update Member Status** | Various | ⚠️ Limited | Limited member management capabilities |

### ❌ Not Available

| Operation | Status | Notes |
|-----------|--------|-------|
| **Create Post** | ❌ No | Patreon API does not support creating posts programmatically |
| **Edit Post** | ❌ No | Cannot edit posts via API |
| **Delete Post** | ❌ No | Cannot delete posts via API |
| **Publish Post** | ❌ No | Cannot publish posts via API |
| **Create Campaign** | ❌ No | Campaign creation must be done via Patreon website |
| **Manage Benefits** | ❌ Limited | Limited benefit management via API |
| **Send Messages** | ❌ No | Cannot send messages to patrons via API |

### 📝 Post Operations Details

**Reading Posts:**
- ✅ Can read all posts from campaigns
- ✅ Can read specific posts by ID
- ✅ Includes post content, images, attachments
- ✅ Includes post metadata (published date, visibility, etc.)
- ✅ Can filter by campaign
- ❌ Cannot create, edit, or delete posts

**Post Content:**
- Posts include text content
- Posts can have images and attachments
- Posts have visibility settings (public, patron-only, tier-specific)
- Posts can be scheduled (but scheduling must be done via Patreon website)

**Limitations:**
- **No Write Operations**: Patreon API is read-only for posts
- Posts must be created manually via Patreon website
- Cannot programmatically publish content
- Alternative: Use automation tools (Zapier, Pipedream) for cross-posting

### 👥 Member (Patron) Operations

**Reading Members:**
- ✅ Can read all members (patrons) for a campaign
- ✅ Can read specific member details
- ✅ Includes pledge amount, tier, status
- ✅ Can access member addresses (with proper scope)
- ✅ Can see pledge history
- ✅ Can see member benefits

**Member Data:**
- Member name and profile info
- Pledge amount and currency
- Membership tier/benefit level
- Pledge status (active, declined, etc.)
- Last charge date
- Lifetime pledge amount
- Shipping address (if scope granted)

**Member Management:**
- ⚠️ Limited management capabilities
- Cannot create or delete members (handled by Patreon)
- Cannot modify pledges directly
- Can view and export member data

### 🎯 Campaign Operations

**Reading Campaigns:**
- ✅ Can read user's campaigns
- ✅ Can read campaign details
- ✅ Can read campaign goals
- ✅ Can read campaign benefits/tiers
- ✅ Can read campaign earnings (if creator)

**Campaign Data:**
- Campaign name and description
- Campaign URL and vanity
- Earnings information
- Member count
- Goals and milestones
- Benefits/tiers structure

**Campaign Management:**
- ⚠️ Limited - Most campaign management must be done via Patreon website
- Cannot create campaigns via API
- Limited ability to update campaign settings

### 🔍 Limitations

1. **No Post Creation**: Cannot create, edit, or delete posts via API
2. **Read-Only for Content**: API is primarily for reading data, not managing content
3. **Campaign Creation**: Must create campaigns via Patreon website
4. **Rate Limits**: Patreon has rate limits (varies by endpoint and tier)
5. **Scope Requirements**: Different scopes needed for different data access
6. **Address Access**: Requires special scope (`campaigns.members.address`)
7. **Creator vs Patron**: Different permissions based on user role

### 📋 Required Permissions (Scopes)

**Basic Permissions:**
- `identity` - Basic user identity (required)
- `identity[email]` - User email address (optional)
- `identity.memberships` - User's memberships (optional)

**Extended Permissions:**
- `campaigns` - Campaign information (for creators)
- `campaigns.posts` - Read campaign posts (for reading posts)
- `campaigns.members` - Read campaign members (for creators)
- `campaigns.members.address` - Member addresses (for shipping, requires special approval)
- `campaigns.webhook` - Webhook management (for webhooks)

**Recommended scopes for basic integration:**
- `identity` (required)
- `campaigns` (if creator)
- `campaigns.posts` (to read posts)

**Note**: `campaigns.members.address` requires special approval and is only available for creators who need shipping addresses.

## Implementation Plan

### Phase 1: Types & Platform Config

**Update**: `src/types.ts`

Add Patreon to platform types:

```typescript
export type Platform = 'reddit' | 'x' | 'devto' | 'bluesky' | 'buymeacoffee' | 'discord' | 'instagram' | 'facebook' | 'linkedin' | 'medium' | 'patreon';

export interface PatreonAccount extends BaseAccount {
  providerId: 'patreon';
  accountId: string; // Patreon user ID
  accessToken: string;
  refreshToken: string | null;
  accessTokenExpiresAt: Date | string | null;
  scope: string;
  username?: string;
  fullName?: string;
  email?: string;
  imageUrl?: string;
  isCreator?: boolean;
  isPatron?: boolean;
}

export type Account = RedditAccount | XAccount | DevToAccount | BlueskyAccount | BuyMeACoffeeAccount | DiscordAccount | InstagramAccount | FacebookAccount | LinkedInAccount | MediumAccount | PatreonAccount;
```

Add platform config:

```typescript
export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  // ... existing platforms
  patreon: {
    id: 'patreon',
    name: 'Patreon',
    authType: 'oauth',
    defaultScopes: ['identity', 'campaigns', 'campaigns.posts'],
    callbackPath: '/app/integrations/patreon',
  },
};
```

Add permissions:

```typescript
export const PATREON_PERMISSIONS: Permission[] = [
  { id: 'identity', label: 'Identity', description: 'Access basic user information (Required)', required: true, default: true },
  { id: 'identity[email]', label: 'Email address', description: 'Access email address', default: true },
  { id: 'campaigns', label: 'Campaigns', description: 'Access campaign information (For creators)', default: true },
  { id: 'campaigns.posts', label: 'Read posts', description: 'Read campaign posts', default: true },
  { id: 'campaigns.members', label: 'Read members', description: 'Read campaign members/patrons (For creators)', default: false },
  { id: 'campaigns.members.address', label: 'Member addresses', description: 'Access patron shipping addresses (Requires Special Approval)', default: false },
];

export const PLATFORM_PERMISSIONS: Record<Platform, Permission[]> = {
  // ... existing
  patreon: PATREON_PERMISSIONS,
};
```

Add features:

```typescript
export const PLATFORM_FEATURES: Record<Platform, PlatformFeature[]> = {
  // ... existing
  patreon: [
    { text: 'OAuth2 authentication' },
    { text: 'Secure token storage' },
    { text: 'Automatic token refresh' },
    { text: 'Multi-account support' },
    { text: 'Read campaign posts and members' },
    { text: 'Manage campaigns and patrons' },
    { text: '⚠️ Read-only API - cannot create posts' },
  ],
};
```

Add platform colors:

```typescript
export const PLATFORM_COLORS: Record<Platform, { primary: string; bg: string; hover: string }> = {
  // ... existing
  patreon: { primary: '#F96854', bg: 'rgba(249, 104, 84, 0.1)', hover: '#E85A47' },
};
```

**New File**: `src/services/patreon/types.ts`

```typescript
export interface PatreonIdentity {
  id: string;
  type: 'user';
  attributes: {
    email?: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    image_url?: string;
    thumb_url?: string;
    url?: string;
    vanity?: string;
    created?: string;
    about?: string;
    facebook_id?: string;
    twitter?: string;
    youtube?: string;
    is_email_verified?: boolean;
  };
  relationships?: {
    campaigns?: {
      data: Array<{ id: string; type: string }>;
    };
  };
}

export interface PatreonCampaign {
  id: string;
  type: 'campaign';
  attributes: {
    created_at?: string;
    creation_name?: string;
    currency?: string;
    display_patron_goals?: boolean;
    earnings_visibility?: string;
    image_small_url?: string;
    image_url?: string;
    is_charged_immediately?: boolean;
    is_monthly?: boolean;
    is_nsfw?: boolean;
    main_video_embed?: string;
    main_video_url?: string;
    name?: string;
    one_liner?: string;
    patron_count?: number;
    pay_per_name?: string;
    pledge_url?: string;
    published_at?: string;
    summary?: string;
    thanks_embed?: string;
    thanks_msg?: string;
    thanks_video_url?: string;
    url?: string;
    vanity?: string;
  };
}

export interface PatreonPost {
  id: string;
  type: 'post';
  attributes: {
    title?: string;
    content?: string;
    created_at?: string;
    edited_at?: string;
    is_paid?: boolean;
    is_public?: boolean;
    published_at?: string;
    url?: string;
    embed?: {
      url?: string;
      subject?: string;
      description?: string;
    };
    image?: {
      url?: string;
      width?: number;
      height?: number;
    };
    patron_count?: number;
    patron_currency?: string;
    min_cents_pledged_to_view?: number;
    comment_count?: number;
    like_count?: number;
  };
  relationships?: {
    campaign?: {
      data: { id: string; type: string };
    };
    user?: {
      data: { id: string; type: string };
    };
  };
}

export interface PatreonMember {
  id: string;
  type: 'member';
  attributes: {
    full_name?: string;
    is_follower?: boolean;
    last_charge_date?: string;
    last_charge_status?: string;
    lifetime_support_cents?: number;
    currently_entitled_amount_cents?: number;
    patron_status?: string;
    pledge_relationship_start?: string;
    will_pay_amount_cents?: number;
  };
  relationships?: {
    address?: {
      data: { id: string; type: string } | null;
    };
    campaign?: {
      data: { id: string; type: string };
    };
    currently_entitled_tiers?: {
      data: Array<{ id: string; type: string }>;
    };
    user?: {
      data: { id: string; type: string };
    };
  };
}
```

### Phase 2: Auth Service

**New File**: `src/services/patreon/auth.ts`

```typescript
import type { AuthClient, PatreonAccount, Session } from '../../types';
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

export interface PatreonAuthServiceConfig {
  authClient: AuthClient;
  apiBasePath?: string;
  callbackURL?: string;
}

export const createPatreonAuthService = (config: PatreonAuthServiceConfig) => {
  const { authClient, apiBasePath = '', callbackURL = '/app/integrations/patreon' } = config;

  return {
    /**
     * Connect Patreon account
     * - If user is logged in: links Patreon to existing account
     * - If user is not logged in: signs in with Patreon (creates new user if needed)
     */
    connect: async (scopes: string[] = ['identity', 'campaigns', 'campaigns.posts']) => {
      try {
        const session = await patreonAuthService.getSession();

        if (session?.user) {
          // User is logged in - link the account
          await authClient.linkSocial({
            provider: 'patreon',
            callbackURL,
            scopes,
          });
        } else {
          // User not logged in - sign in with Patreon
          await authClient.signIn.social({
            provider: 'patreon',
            callbackURL,
            scopes,
          });
        }
      } catch (error) {
        throw new ConnectionError('patreon', error instanceof Error ? error.message : undefined);
      }
    },

    /**
     * Sign in with Patreon (always creates new session)
     */
    signIn: async (scopes: string[] = ['identity', 'campaigns', 'campaigns.posts']) => {
      try {
        await authClient.signIn.social({
          provider: 'patreon',
          callbackURL,
          scopes,
        });
      } catch (error) {
        throw new ConnectionError('patreon', error instanceof Error ? error.message : undefined);
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
     * Get connected Patreon accounts with IndexedDB caching
     */
    getAccounts: async (forceRefresh = false): Promise<PatreonAccount[]> => {
      // Check IndexedDB cache first
      if (!forceRefresh) {
        try {
          const cached = await getCachedAccounts('patreon');
          if (cached && isCacheValid(cached.cachedAt, ACCOUNT_CACHE_TTL)) {
            // Verify tokens haven't expired
            const allTokensValid = cached.accounts.every((acc) => !isTokenExpired(acc));
            if (allTokensValid) {
              return cached.accounts as PatreonAccount[];
            }
          }
        } catch {
          // Continue to fetch from API
        }
      }

      // Fetch from API
      const response = await fetch(`${apiBasePath}/api/auth/patreon/accounts`);
      if (response.ok) {
        const accounts = await response.json();
        try {
          await cacheAccounts('patreon', accounts);
        } catch {
          // Cache failure is non-fatal
        }
        return accounts;
      }
      return [];
    },

    /**
     * Disconnect a Patreon account
     */
    disconnect: async (accountId: string): Promise<void> => {
      const response = await fetch(`${apiBasePath}/api/auth/patreon/accounts?accountId=${accountId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ConnectionError('patreon', error.error || 'Failed to disconnect account');
      }

      await clearAccountCache('patreon');
    },

    /**
     * Clear the account cache
     */
    clearCache: async () => {
      await clearAccountCache('patreon');
    },
  };
};

// Default instance (requires initialization via IntegrationProvider)
let patreonAuthService: ReturnType<typeof createPatreonAuthService>;

export const initPatreonAuthService = (config: PatreonAuthServiceConfig) => {
  patreonAuthService = createPatreonAuthService(config);
  return patreonAuthService;
};

export const getPatreonAuthService = () => {
  if (!patreonAuthService) {
    throw new Error('Patreon auth service not initialized. Use IntegrationProvider.');
  }
  return patreonAuthService;
};

export { patreonAuthService };
```

### Phase 3: API Service (Optional - for future use)

**New File**: `src/services/patreon/api.ts` (optional, for API operations)

This would contain methods for:
- Getting user identity
- Getting campaigns
- Getting posts
- Getting members
- etc.

This can be implemented later as needed.

### Phase 4: Export from Index

**Update**: `src/index.ts`

Add Patreon exports:

```typescript
export {
  createPatreonAuthService,
  initPatreonAuthService,
  getPatreonAuthService,
  type PatreonAuthServiceConfig,
} from './services/patreon/auth';
export type {
  PatreonIdentity,
  PatreonCampaign,
  PatreonPost,
  PatreonMember,
} from './services/patreon/types';
```

### Phase 5: Integration Provider Updates

**Update**: `src/components/IntegrationProvider.tsx`

Add Patreon service initialization:

```typescript
// In IntegrationProvider initialization
if (config.platforms?.includes('patreon')) {
  initPatreonAuthService({
    authClient: config.authClient,
    apiBasePath: config.apiBasePath,
    callbackURL: '/app/integrations/patreon',
  });
}
```

## Files Summary

### New Files (3)

1. `packages/better-auth-connect/specs/patreon-integration.md` - This spec
2. `packages/better-auth-connect/src/services/patreon/auth.ts` - Auth service
3. `packages/better-auth-connect/src/services/patreon/types.ts` - TypeScript types

### Files to Modify (3)

1. `packages/better-auth-connect/src/types.ts` - Add Patreon platform types, config, permissions, features
2. `packages/better-auth-connect/src/index.ts` - Export Patreon service
3. `packages/better-auth-connect/src/components/IntegrationProvider.tsx` - Initialize Patreon service

### Optional Future Files

1. `packages/better-auth-connect/src/services/patreon/api.ts` - API service for Patreon operations
2. `packages/better-auth-connect/src/services/patreon/index.ts` - Service exports

## Backend API Routes Required

The following API routes need to be implemented in the consuming application:

### `GET /api/auth/patreon/accounts`

Returns all connected Patreon accounts for the current user.

**Response:**
```json
[
  {
    "id": "account-id",
    "userId": "user-id",
    "providerId": "patreon",
    "accountId": "patreon-user-id",
    "accessToken": "hidden",
    "refreshToken": "hidden",
    "accessTokenExpiresAt": "2024-01-01T00:00:00Z",
    "scope": "identity campaigns campaigns.posts",
    "username": "username",
    "fullName": "Full Name",
    "email": "email@example.com",
    "imageUrl": "https://...",
    "isCreator": true,
    "isPatron": false
  }
]
```

### `DELETE /api/auth/patreon/accounts?accountId=xxx`

Removes a Patreon account connection.

**Response:** 200 OK

## Better Auth Configuration Required

The consuming application needs to configure Patreon in Better Auth's `socialProviders`:

```typescript
// In Better Auth configuration
socialProviders: {
  // ... other providers
  patreon: {
    clientId: process.env.PATREON_CLIENT_ID,
    clientSecret: process.env.PATREON_CLIENT_SECRET,
    scope: ['identity', 'campaigns', 'campaigns.posts', 'campaigns.members'],
  },
}
```

## Patreon Scopes Reference

Patreon OAuth2 scopes:

| Scope | Description | Required | Use Case |
|-------|-------------|----------|----------|
| `identity` | Basic user identity | Yes | Get user profile |
| `identity[email]` | User email address | No | Get user email |
| `identity.memberships` | User's memberships | No | Get user's patron memberships |
| `campaigns` | Campaign information | For creators | Get campaign details |
| `campaigns.posts` | Read campaign posts | For reading posts | Get posts from campaigns |
| `campaigns.members` | Read campaign members | For creators | Get patron list |
| `campaigns.members.address` | Member addresses | For shipping | Get patron shipping addresses (requires special approval) |
| `campaigns.webhook` | Webhook management | For webhooks | Manage webhooks |

**Recommended scopes for basic integration:**
- `identity` (required)
- `campaigns` (if creator)
- `campaigns.posts` (to read posts)

**Note**: `campaigns.members.address` requires special approval and is only available for creators who need shipping addresses.

## Environment Variables Needed

```env
PATREON_CLIENT_ID=your-patreon-client-id
PATREON_CLIENT_SECRET=your-patreon-client-secret
```

## Redirect URI Configuration

In Patreon Developer Portal, set redirect URI:
- Development: `http://localhost:3000/api/auth/callback/patreon`
- Production: `https://yourdomain.com/api/auth/callback/patreon`

Better Auth automatically constructs the callback URL as:
`{baseURL}/api/auth/callback/patreon`

## Security Considerations

**Token Management:**
- Better Auth handles OAuth token storage and refresh
- Tokens automatically refreshed when expired
- Revocation handled via Patreon OAuth revoke endpoint

**Rate Limits:**
- Patreon has rate limits (varies by endpoint and API tier)
- Implement rate limit handling in service layer
- Cache responses when appropriate
- Handle rate limit errors gracefully

**Permissions:**
- Request minimal scopes needed
- Some scopes require special approval (address access)
- Clearly explain what each permission allows
- Different permissions for creators vs patrons

## Patreon API Reference

**Base URL:** `https://www.patreon.com/api/oauth2/v2`

**Authentication:** Include access token in request header:
```
Authorization: Bearer <access-token>
```

**Common Endpoints:**
- `GET /identity` - Get authenticated user profile
- `GET /campaigns` - Get user's campaigns
- `GET /campaigns/{id}` - Get campaign details
- `GET /campaigns/{id}/posts` - Get campaign posts
- `GET /posts/{id}` - Get specific post
- `GET /campaigns/{id}/members` - Get campaign members
- `GET /members/{id}` - Get member details

**Includes and Fields:**
Patreon API supports `include` and `fields` query parameters:
- `include`: Related resources to include (e.g., `include=address,user`)
- `fields`: Specific fields to return (e.g., `fields[member]=full_name,is_follower`)

## Rate Limits

Patreon uses rate limits that vary by:
- API endpoint
- User tier (free vs paid API access)
- Application type

**Handling:**
- Check rate limit headers
- Implement exponential backoff
- Cache responses to reduce API calls
- Show user-friendly error messages

## Important Limitations

**No Post Creation:**
- ⚠️ **Critical**: Patreon API does not support creating posts
- Posts must be created via Patreon website
- Cannot automate post publishing
- Alternative: Use automation tools (Zapier, Pipedream) for cross-posting

**Read-Only API:**
- API is primarily for reading data
- Limited write operations
- Campaign management must be done via website

**Use Cases:**
- Analytics and reporting
- Member management and export
- Reading posts (for display/aggregation)
- Integration with other platforms (via third-party tools)

## Implementation Verification

When building the integration, ensure these features work correctly:

- [ ] Create Patreon app in Developer Portal
- [ ] Add Patreon provider to Better Auth config
- [ ] OAuth flow (connect account) works correctly
- [ ] Token refresh works correctly
- [ ] List connected accounts
- [ ] Fetch user identity
- [ ] Fetch user campaigns (if creator)
- [ ] Fetch campaign posts
- [ ] Fetch campaign members (with proper scope)
- [ ] Handle rate limits gracefully
- [ ] Disconnect/revocation works correctly
- [ ] Clear cache on disconnect
- [ ] Display read-only warning in UI

## Future Enhancements

1. **API Service**: Full API service for Patreon operations (campaigns, posts, members)
2. **Webhook Support**: Receive webhooks for events (new members, posts, etc.)
3. **Analytics Dashboard**: Visualize campaign statistics
4. **Member Export**: Export patron lists with addresses
5. **Post Aggregation**: Aggregate Patreon posts with other platforms
6. **Automation Integration**: Guide users to Zapier/Pipedream for automation
7. **Address Management**: Manage shipping addresses (with proper scope)
8. **Earnings Tracking**: Track campaign earnings over time

---

## Notes

- Patreon API is **read-only for posts** - cannot create/edit/delete posts
- API is primarily designed for creators to manage campaigns and members
- Different scopes required for different data access
- Address access requires special approval
- Posts must be created via Patreon website
- Consider using automation tools (Zapier, Pipedream) for cross-posting workflows
- API supports includes and fields for efficient data fetching
- Rate limits vary by endpoint and API tier
- **Follows Reddit/X/Discord/Instagram/Facebook/LinkedIn pattern** (OAuth2 authentication)
- Uses `connect()`, `signIn()`, `getSession()` (not `addAccount()` like API key platforms)



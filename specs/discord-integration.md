# Discord Integration Specification

## Overview

Discord integration uses **OAuth2 authentication** (similar to Reddit/X). Users authorize the application through Discord's OAuth flow, and access tokens are stored securely via Better Auth.

## Better Auth Connect Architecture

**Type**: OAuth2 (Better Auth Native - Similar to Reddit/X)

**Integration Approach**:
- ✅ **Uses Better Auth OAuth Flow**: Configure in `socialProviders`, use `authClient.signIn.social()`
- ✅ **Uses Better Auth Token Management**: Automatic token storage, refresh, and revocation
- ✅ **Follows Reddit/X Pattern**: Same implementation pattern as existing OAuth integrations
- ✅ **Service Pattern**: Follows `better-auth-connect` service factory pattern (same as Reddit/X)

**Implementation Pattern**:
```typescript
// Custom auth service using Better Auth OAuth
const discordAuthService = createDiscordAuthService({ authClient, apiBasePath });

// Connect with OAuth flow
await discordAuthService.connect(scopes);

// Better Auth handles:
// - OAuth redirect flow
// - Token exchange
// - Token storage in DB
// - Token refresh
```

**Why Better Auth?**
- Discord supports standard OAuth2
- Better Auth has built-in OAuth support
- Same pattern as Reddit/X - consistent implementation
- Automatic token refresh and management

**Comparison with Other Integrations**:
- **Reddit/X/Discord (OAuth)**: Use `authClient.signIn.social()` → Better Auth handles OAuth2 flow
- **DevTo/BuyMeACoffee (API Key)**: Custom form → Validate key/token → Store in Better Auth DB manually
- **Bluesky (AT Protocol)**: Custom AT Protocol flow → App password auth, store token in Better Auth DB manually

## Discord API Overview

- **Authentication**: OAuth2
- **Base URL**: `https://discord.com/api/v10`
- **Documentation**: https://discord.com/developers/docs
- **Developer Portal**: https://discord.com/developers/applications
- **OAuth Endpoints**:
  - Authorization: `https://discord.com/api/oauth2/authorize`
  - Token: `https://discord.com/api/oauth2/token`

## Authentication Method

Discord uses **OAuth2 Authorization Code Flow**:
- User redirects to Discord authorization page
- User grants permissions (scopes)
- Callback with authorization code
- Exchange code for access token and refresh token
- Tokens stored in Better Auth database

## API Capabilities - What's Possible

This section details what operations can be performed with the Discord API:

### ✅ Read Operations

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Get User Profile** | `GET /users/@me` | ✅ Yes | Get authenticated user's profile |
| **Get User Guilds** | `GET /users/@me/guilds` | ✅ Yes | List all servers (guilds) user is in |
| **Get Guild Channels** | `GET /guilds/{guildId}/channels` | ✅ Yes | List all channels in a server |
| **Get Channel Messages** | `GET /channels/{channelId}/messages` | ✅ Yes | Fetch message history (up to 100 messages) |
| **Get Single Message** | `GET /channels/{channelId}/messages/{messageId}` | ✅ Yes | Get specific message by ID |
| **Get Channel** | `GET /channels/{channelId}` | ✅ Yes | Get channel details |
| **Get Guild Members** | `GET /guilds/{guildId}/members` | ✅ Yes | List server members (with permissions) |
| **Get Guild** | `GET /guilds/{guildId}` | ✅ Yes | Get server details |
| **Get Message Reactions** | `GET /channels/{channelId}/messages/{messageId}/reactions/{emoji}` | ✅ Yes | Get users who reacted with emoji |

### ✅ Write Operations

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Send Message** | `POST /channels/{channelId}/messages` | ✅ Yes | Send message to channel (requires bot or webhook) |
| **Edit Message** | `PATCH /channels/{channelId}/messages/{messageId}` | ✅ Yes | Edit your own messages |
| **Delete Message** | `DELETE /channels/{channelId}/messages/{messageId}` | ✅ Yes | Delete your own messages |
| **Add Reaction** | `PUT /channels/{channelId}/messages/{messageId}/reactions/{emoji}/@me` | ✅ Yes | Add reaction to message |
| **Remove Reaction** | `DELETE /channels/{channelId}/messages/{messageId}/reactions/{emoji}/@me` | ✅ Yes | Remove your reaction |
| **Create Thread** | `POST /channels/{channelId}/messages/{messageId}/threads` | ✅ Yes | Create thread from message |
| **Join Thread** | `PUT /channels/{channelId}/thread-members/@me` | ✅ Yes | Join a thread |

### ⚠️ Limited/Partial Support

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Send DM** | `POST /users/@me/channels` + `POST /channels/{id}/messages` | ⚠️ Limited | Requires bot, OAuth users limited |
| **Upload File** | `POST /channels/{channelId}/messages` | ⚠️ Limited | Files must be <25MB, requires bot for large files |
| **Manage Server** | Various endpoints | ⚠️ Limited | Most server management requires bot permissions |

### ❌ Not Available via User OAuth

| Operation | Status | Notes |
|-----------|--------|-------|
| **Delete Others' Messages** | ❌ No | Can only delete your own messages |
| **Edit Others' Messages** | ❌ No | Can only edit your own messages |
| **Manage Server Settings** | ❌ Limited | Most settings require bot with admin permissions |
| **Bulk Delete Messages** | ❌ No | Requires bot permissions |
| **Create Invites** | ⚠️ Limited | Limited via OAuth, easier with bot |

### 📝 Message Operations Details

**Reading Messages:**
- Can fetch up to 100 messages at a time
- Supports pagination (before/after message IDs)
- Can filter by user, mentions, etc.
- Includes full message content, embeds, attachments
- Can read message history (limited by Discord retention)

**Sending Messages:**
- ⚠️ **Important**: User OAuth tokens have limited message sending
- Better to use **Discord Bots** or **Webhooks** for sending
- Webhooks provide higher rate limits for posting
- Can include text, embeds, files, mentions

**Message Editing:**
- Can only edit your own messages
- Edits are tracked (shows "edited" in UI)
- Can edit content, embeds, attachments

**Threads:**
- Can create threads from messages
- Can read thread messages
- Threads behave like channels for messaging

### 🔍 Limitations

1. **Rate Limits**: Strict rate limits (varies by endpoint)
   - Global: 50 requests/second
   - Per-route: Varies (messages: 5 per 5 seconds)
   - Per-resource: Per channel, per guild, etc.

2. **User OAuth vs Bot Tokens**:
   - User tokens: Limited write operations
   - Bot tokens: Full server management, higher limits
   - Webhooks: Best for one-way posting

3. **File Size Limits**:
   - Regular messages: 25MB max
   - Premium servers: 50MB max
   - Videos: 500MB max (via special endpoints)

4. **Message History**:
   - Discord retains messages indefinitely (unless deleted)
   - Can fetch historical messages with pagination
   - Limited by rate limits for large histories

5. **Permissions Required**:
   - Reading messages: `messages.read` or bot with `VIEW_CHANNEL`
   - Sending messages: Bot with `SEND_MESSAGES` or webhook
   - Reading members: `guilds.members.read` or bot with `VIEW_MEMBERS`

## Implementation Plan

### Phase 1: Types & Platform Config

**Update**: `src/types.ts`

Add Discord to platform types:

```typescript
export type Platform = 'reddit' | 'x' | 'devto' | 'bluesky' | 'buymeacoffee' | 'discord';

export interface DiscordAccount extends BaseAccount {
  providerId: 'discord';
  accountId: string; // Discord user ID
  accessToken: string;
  refreshToken: string | null;
  accessTokenExpiresAt: Date | string | null;
  scope: string;
  username?: string;
  discriminator?: string;
  avatar?: string;
}

export type Account = RedditAccount | XAccount | DevToAccount | BlueskyAccount | BuyMeACoffeeAccount | DiscordAccount;
```

Add platform config:

```typescript
export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  // ... existing platforms
  discord: {
    id: 'discord',
    name: 'Discord',
    authType: 'oauth',
    defaultScopes: ['identify', 'guilds', 'messages.read'],
    callbackPath: '/app/integrations/discord',
  },
};
```

Add permissions:

```typescript
export const DISCORD_PERMISSIONS: Permission[] = [
  { id: 'identify', label: 'Access identity', description: 'Access username and avatar (Required)', required: true, default: true },
  { id: 'email', label: 'Access email', description: 'Access email address', default: false },
  { id: 'guilds', label: 'Access guilds', description: 'Access server (guild) list', default: true },
  { id: 'guilds.join', label: 'Join guilds', description: 'Join servers on behalf of user', default: false },
  { id: 'guilds.members.read', label: 'Read members', description: 'Read guild member list', default: false },
  { id: 'messages.read', label: 'Read messages', description: 'Read messages in channels', default: true },
  { id: 'bot', label: 'Bot permissions', description: 'Add bot to server (different use case)', default: false },
];

export const PLATFORM_PERMISSIONS: Record<Platform, Permission[]> = {
  // ... existing
  discord: DISCORD_PERMISSIONS,
};
```

Add features:

```typescript
export const PLATFORM_FEATURES: Record<Platform, PlatformFeature[]> = {
  // ... existing
  discord: [
    { text: 'OAuth2 authentication' },
    { text: 'Secure token storage' },
    { text: 'Automatic token refresh' },
    { text: 'Multi-account support' },
    { text: 'Read and send messages' },
    { text: 'Access servers and channels' },
  ],
};
```

Add platform colors:

```typescript
export const PLATFORM_COLORS: Record<Platform, { primary: string; bg: string; hover: string }> = {
  // ... existing
  discord: { primary: '#5865F2', bg: 'rgba(88, 101, 242, 0.1)', hover: '#4752C4' },
};
```

**New File**: `src/services/discord/types.ts`

```typescript
export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email?: string;
  verified?: boolean;
  mfa_enabled?: boolean;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features?: string[];
}

export interface DiscordChannel {
  id: string;
  name: string;
  type: number; // 0: text, 2: voice, 4: category, etc.
  guild_id?: string;
  position?: number;
  topic?: string;
  nsfw?: boolean;
}

export interface DiscordMessage {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
  };
  channel_id: string;
  timestamp: string;
  edited_timestamp?: string;
  attachments?: Array<{
    id: string;
    filename: string;
    url: string;
    size: number;
    content_type?: string;
  }>;
  embeds?: Array<{
    title?: string;
    description?: string;
    url?: string;
    color?: number;
  }>;
  reactions?: Array<{
    emoji: { name: string; id?: string };
    count: number;
  }>;
}
```

### Phase 2: Auth Service

**New File**: `src/services/discord/auth.ts`

```typescript
import type { AuthClient, DiscordAccount, Session } from '../../types';
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

export interface DiscordAuthServiceConfig {
  authClient: AuthClient;
  apiBasePath?: string;
  callbackURL?: string;
}

export const createDiscordAuthService = (config: DiscordAuthServiceConfig) => {
  const { authClient, apiBasePath = '', callbackURL = '/app/integrations/discord' } = config;

  return {
    /**
     * Connect Discord account
     * - If user is logged in: links Discord to existing account
     * - If user is not logged in: signs in with Discord (creates new user if needed)
     */
    connect: async (scopes: string[] = ['identify', 'guilds', 'messages.read']) => {
      try {
        const session = await discordAuthService.getSession();

        if (session?.user) {
          // User is logged in - link the account
          await authClient.linkSocial({
            provider: 'discord',
            callbackURL,
            scopes,
          });
        } else {
          // User not logged in - sign in with Discord
          await authClient.signIn.social({
            provider: 'discord',
            callbackURL,
            scopes,
          });
        }
      } catch (error) {
        throw new ConnectionError('discord', error instanceof Error ? error.message : undefined);
      }
    },

    /**
     * Sign in with Discord (always creates new session)
     */
    signIn: async (scopes: string[] = ['identify', 'guilds', 'messages.read']) => {
      try {
        await authClient.signIn.social({
          provider: 'discord',
          callbackURL,
          scopes,
        });
      } catch (error) {
        throw new ConnectionError('discord', error instanceof Error ? error.message : undefined);
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
     * Get connected Discord accounts with IndexedDB caching
     */
    getAccounts: async (forceRefresh = false): Promise<DiscordAccount[]> => {
      // Check IndexedDB cache first
      if (!forceRefresh) {
        try {
          const cached = await getCachedAccounts('discord');
          if (cached && isCacheValid(cached.cachedAt, ACCOUNT_CACHE_TTL)) {
            // Verify tokens haven't expired
            const allTokensValid = cached.accounts.every((acc) => !isTokenExpired(acc));
            if (allTokensValid) {
              return cached.accounts as DiscordAccount[];
            }
          }
        } catch {
          // Continue to fetch from API
        }
      }

      // Fetch from API
      const response = await fetch(`${apiBasePath}/api/auth/discord/accounts`);
      if (response.ok) {
        const accounts = await response.json();
        try {
          await cacheAccounts('discord', accounts);
        } catch {
          // Cache failure is non-fatal
        }
        return accounts;
      }
      return [];
    },

    /**
     * Disconnect a Discord account
     */
    disconnect: async (accountId: string): Promise<void> => {
      const response = await fetch(`${apiBasePath}/api/auth/discord/accounts?accountId=${accountId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ConnectionError('discord', error.error || 'Failed to disconnect account');
      }

      await clearAccountCache('discord');
    },

    /**
     * Clear the account cache
     */
    clearCache: async () => {
      await clearAccountCache('discord');
    },
  };
};

// Default instance (requires initialization via IntegrationProvider)
let discordAuthService: ReturnType<typeof createDiscordAuthService>;

export const initDiscordAuthService = (config: DiscordAuthServiceConfig) => {
  discordAuthService = createDiscordAuthService(config);
  return discordAuthService;
};

export const getDiscordAuthService = () => {
  if (!discordAuthService) {
    throw new Error('Discord auth service not initialized. Use IntegrationProvider.');
  }
  return discordAuthService;
};

export { discordAuthService };
```

### Phase 3: API Service (Optional - for future use)

**New File**: `src/services/discord/api.ts` (optional, for API operations)

This would contain methods for:
- Getting user profile
- Getting guilds
- Getting channels
- Getting messages
- Sending messages
- etc.

This can be implemented later as needed.

### Phase 4: Export from Index

**Update**: `src/index.ts`

Add Discord exports:

```typescript
export {
  createDiscordAuthService,
  initDiscordAuthService,
  getDiscordAuthService,
  type DiscordAuthServiceConfig,
} from './services/discord/auth';
export type { DiscordUser, DiscordGuild, DiscordChannel, DiscordMessage } from './services/discord/types';
```

### Phase 5: Integration Provider Updates

**Update**: `src/components/IntegrationProvider.tsx`

Add Discord service initialization:

```typescript
// In IntegrationProvider initialization
if (config.platforms?.includes('discord')) {
  initDiscordAuthService({
    authClient: config.authClient,
    apiBasePath: config.apiBasePath,
    callbackURL: '/app/integrations/discord',
  });
}
```

## Files Summary

### New Files (3)

1. `packages/better-auth-connect/specs/discord-integration.md` - This spec
2. `packages/better-auth-connect/src/services/discord/auth.ts` - Auth service
3. `packages/better-auth-connect/src/services/discord/types.ts` - TypeScript types

### Files to Modify (3)

1. `packages/better-auth-connect/src/types.ts` - Add Discord platform types, config, permissions, features
2. `packages/better-auth-connect/src/index.ts` - Export Discord service
3. `packages/better-auth-connect/src/components/IntegrationProvider.tsx` - Initialize Discord service

### Optional Future Files

1. `packages/better-auth-connect/src/services/discord/api.ts` - API service for Discord operations
2. `packages/better-auth-connect/src/services/discord/index.ts` - Service exports

## Backend API Routes Required

The following API routes need to be implemented in the consuming application:

### `GET /api/auth/discord/accounts`

Returns all connected Discord accounts for the current user.

**Response:**
```json
[
  {
    "id": "account-id",
    "userId": "user-id",
    "providerId": "discord",
    "accountId": "discord-user-id",
    "accessToken": "hidden",
    "refreshToken": "hidden",
    "accessTokenExpiresAt": "2024-01-01T00:00:00Z",
    "scope": "identify guilds messages.read",
    "username": "username",
    "discriminator": "1234",
    "avatar": "https://..."
  }
]
```

### `DELETE /api/auth/discord/accounts?accountId=xxx`

Removes a Discord account connection.

**Response:** 200 OK

**Implementation Notes:**
1. Verify account ownership
2. Optionally revoke token via Discord OAuth revoke endpoint
3. Delete from Better Auth database
4. Return success

## Better Auth Configuration Required

The consuming application needs to configure Discord in Better Auth's `socialProviders`:

```typescript
// In Better Auth configuration
socialProviders: {
  // ... other providers
  discord: {
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    scope: ['identify', 'guilds', 'messages.read', 'guilds.members.read'],
  },
}
```

## Discord Scopes Reference

Common Discord OAuth2 scopes:

| Scope | Description | Required |
|-------|-------------|----------|
| `identify` | Access username, avatar, discriminator | Yes |
| `email` | Access email address | No |
| `guilds` | Access guild (server) list | Recommended |
| `guilds.join` | Join guilds on behalf of user | No |
| `guilds.members.read` | Read guild member list | No |
| `messages.read` | Read messages in channels | Optional |
| `bot` | Add bot to server (different use case) | No |
| `connections` | Access linked third-party accounts | No |

**Recommended scopes for basic integration:**
- `identify` (required)
- `guilds` (to list servers)
- `messages.read` (to read messages)

## Environment Variables Needed

```env
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
```

## Redirect URI Configuration

In Discord Developer Portal, set redirect URI:
- Development: `http://localhost:3000/api/auth/callback/discord`
- Production: `https://yourdomain.com/api/auth/callback/discord`

Better Auth automatically constructs the callback URL as:
`{baseURL}/api/auth/callback/discord`

## Security Considerations

**Token Management:**
- Better Auth handles OAuth token storage and refresh
- Tokens automatically refreshed when expired
- Revocation handled via Discord OAuth revoke endpoint

**Rate Limits:**
- Discord has strict rate limits
- Implement rate limit handling in service layer
- Cache responses when appropriate
- Handle 429 (Too Many Requests) errors gracefully

**Permissions:**
- Request minimal scopes needed
- Clearly explain what each permission allows
- Allow users to review permissions before connecting

## Discord API Reference

**Base URL:** `https://discord.com/api/v10`

**Authentication:** Include access token in request header:
```
Authorization: Bearer <access-token>
```

**Common Endpoints:**
- `GET /users/@me` - Get authenticated user profile
- `GET /users/@me/guilds` - Get user's guilds (servers)
- `GET /guilds/{guildId}/channels` - Get guild channels
- `GET /channels/{channelId}/messages` - Get channel messages
- `POST /channels/{channelId}/messages` - Send message to channel
- `GET /guilds/{guildId}/members` - Get guild members

## Rate Limits

Discord uses a combination of:
- **Global rate limits**: Across all endpoints
- **Per-route rate limits**: Specific to each endpoint
- **Per-resource rate limits**: Per channel, per guild, etc.

**Handling:**
- Check `X-RateLimit-*` headers
- Implement exponential backoff
- Cache responses to reduce API calls
- Use webhooks for sending messages (higher limits)

## Implementation Verification

When building the integration, ensure these features work correctly:

- [ ] Configure Discord app in Developer Portal
- [ ] Add Discord provider to Better Auth config
- [ ] OAuth flow (connect account) works correctly
- [ ] Token refresh works correctly
- [ ] List connected accounts
- [ ] Fetch user profile
- [ ] Fetch user guilds
- [ ] Fetch guild channels
- [ ] Read channel messages
- [ ] Handle rate limits gracefully
- [ ] Disconnect/revocation works correctly
- [ ] Clear cache on disconnect

## Future Enhancements

1. **API Service**: Full API service for Discord operations (messages, guilds, channels)
2. **Bot Integration**: Support Discord bot functionality
3. **Webhooks**: Use webhooks for sending messages (higher rate limits)
4. **Reactions**: Add/remove reactions to messages
5. **Threads**: Support Discord threads and forums
6. **Voice Channels**: Support voice channel interactions
7. **Rich Embeds**: Create rich message embeds
8. **Slash Commands**: Support Discord slash commands (bot feature)

---

## Notes

- Discord tokens expire but refresh automatically with Better Auth
- Rate limits are strict - implement caching and backoff
- Some features require bot permissions (different from user OAuth)
- Discord API v10 is the current version (check for updates)
- Webhooks provide alternative way to send messages with higher limits
- **Follows Reddit/X pattern** (OAuth2 authentication)
- Uses `connect()`, `signIn()`, `getSession()` (not `addAccount()` like API key platforms)




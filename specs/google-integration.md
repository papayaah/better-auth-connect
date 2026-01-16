# Google Integration Specification

## Overview

Google integration uses **OAuth2 authentication** (similar to Reddit/X/Discord). Users authorize the application through Google's OAuth flow to access various Google services (YouTube, Blogger, Drive, Gmail, Photos, etc.). Access tokens are stored securely via Better Auth.

## Better Auth Connect Architecture

**Type**: OAuth2 (Better Auth Native - Similar to Reddit/X/Discord)

**Integration Approach**:
- ✅ **Uses Better Auth OAuth Flow**: Configure in `socialProviders`, use `authClient.signIn.social()`
- ✅ **Uses Better Auth Token Management**: Automatic token storage, refresh, and revocation
- ✅ **Follows Reddit/X/Discord Pattern**: Same implementation pattern as existing OAuth integrations
- ✅ **Service Pattern**: Follows `better-auth-connect` service factory pattern

**Implementation Pattern**:
```typescript
// Custom auth service using Better Auth OAuth
const googleAuthService = createGoogleAuthService({ authClient, apiBasePath });

// Connect with OAuth flow (specify which Google services to access)
await googleAuthService.connect(['youtube', 'blogger']);

// Better Auth handles:
// - OAuth redirect flow
// - Token exchange
// - Token storage in DB
// - Token refresh
```

**Why Better Auth?**
- Google supports standard OAuth2
- Better Auth has built-in OAuth support
- Same pattern as Reddit/X/Discord - consistent implementation
- Automatic token refresh and management

## Google OAuth Overview

- **Authentication**: OAuth2 Authorization Code Flow
- **Base URL**: `https://www.googleapis.com`
- **Documentation**: https://developers.google.com/identity/protocols/oauth2
- **Developer Console**: https://console.cloud.google.com
- **OAuth Endpoints**:
  - Authorization: `https://accounts.google.com/o/oauth2/v2/auth`
  - Token: `https://oauth2.googleapis.com/token`

## Available Google Services & Scopes

Google provides access to multiple services via OAuth scopes. Here are the main options for `better-auth-connect`:

### 1. YouTube API

**Use Case**: Content creators, video management, analytics

**Available Scopes**:
- `https://www.googleapis.com/auth/youtube` - Full access (upload, manage, read)
- `https://www.googleapis.com/auth/youtube.readonly` - Read-only access
- `https://www.googleapis.com/auth/youtube.upload` - Upload videos only
- `https://www.googleapis.com/auth/youtubepartner` - Manage monetization
- `https://www.googleapis.com/auth/yt-analytics.readonly` - View analytics

**API Capabilities**:
- ✅ Upload videos
- ✅ Manage playlists
- ✅ Read channel data
- ✅ View analytics
- ✅ Manage comments
- ✅ Update video metadata

**Best For**: Video content creators, YouTube channel management

---

### 2. Blogger API

**Use Case**: Blog publishing, content management

**Available Scopes**:
- `https://www.googleapis.com/auth/blogger` - Full access (read, write, manage)
- `https://www.googleapis.com/auth/blogger.readonly` - Read-only access

**API Capabilities**:
- ✅ Create blog posts
- ✅ Edit/delete posts
- ✅ Manage blog settings
- ✅ Read blog content
- ✅ Manage comments

**Best For**: Blog publishing, content creators, CMS integration

---

### 3. Google Drive API

**Use Case**: File storage, document management

**Available Scopes**:
- `https://www.googleapis.com/auth/drive` - Full access to all files
- `https://www.googleapis.com/auth/drive.readonly` - Read-only access
- `https://www.googleapis.com/auth/drive.metadata` - View and manage metadata only
- `https://www.googleapis.com/auth/drive.appdata` - Access app-specific data

**API Capabilities**:
- ✅ Upload/download files
- ✅ Create folders
- ✅ Share files
- ✅ Manage file metadata
- ✅ Search files
- ⚠️ **Note**: Full drive scope is considered high-risk

**Best For**: File storage, document management, backup solutions

---

### 4. Gmail API

**Use Case**: Email sending, email management

**Available Scopes**:
- `https://mail.google.com/` - Full access (read, send, delete, manage)
- `https://www.googleapis.com/auth/gmail.readonly` - Read-only access
- `https://www.googleapis.com/auth/gmail.compose` - Send emails only
- `https://www.googleapis.com/auth/gmail.modify` - Read and write (modify labels, messages)
- `https://www.googleapis.com/auth/gmail.metadata` - Read metadata only

**API Capabilities**:
- ✅ Send emails
- ✅ Read emails
- ✅ Manage labels
- ✅ Search emails
- ✅ Manage drafts
- ⚠️ **Note**: Full Gmail scope is considered high-risk and requires app verification

**Best For**: Email automation, email marketing, notification systems

---

### 5. Google Photos API

**Use Case**: Photo management, media library

**Available Scopes**:
- `https://www.googleapis.com/auth/photoslibrary` - Full access (read, upload, manage)
- `https://www.googleapis.com/auth/photoslibrary.readonly` - Read-only access
- `https://www.googleapis.com/auth/photoslibrary.appendonly` - Upload only (can't view existing)

**API Capabilities**:
- ✅ Upload photos/videos
- ✅ Read photo library
- ✅ Manage albums
- ✅ Search photos
- ✅ Share photos

**Best For**: Photo management, media libraries, backup solutions

---

### 6. Basic Profile (Always Included)

**Scopes**:
- `https://www.googleapis.com/auth/userinfo.profile` - Basic profile (name, picture)
- `https://www.googleapis.com/auth/userinfo.email` - Email address

**Note**: These are typically included automatically with any Google OAuth flow.

---

## Recommended Service Combinations

### Option 1: Content Creator (YouTube + Blogger)
```typescript
scopes: [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/blogger',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
]
```
**Use Case**: Manage YouTube channel and blog from one place

### Option 2: Media Management (Photos + Drive)
```typescript
scopes: [
  'https://www.googleapis.com/auth/photoslibrary',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
]
```
**Use Case**: Photo backup and file management

### Option 3: Email Automation (Gmail)
```typescript
scopes: [
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
]
```
**Use Case**: Send automated emails, read notifications

### Option 4: YouTube Only (Minimal)
```typescript
scopes: [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
]
```
**Use Case**: Just upload videos, minimal permissions

---

## Implementation Plan

### Step 1: Define Google Account Type

**File**: `packages/better-auth-connect/src/types.ts`

```typescript
export type Platform = 'reddit' | 'x' | 'devto' | 'google';

export interface GoogleAccount extends BaseAccount {
  providerId: 'google';
  email?: string;
  name?: string;
  picture?: string;
  services?: string[]; // ['youtube', 'blogger', 'drive', 'gmail', 'photos']
}

export type Account = RedditAccount | XAccount | DevToAccount | GoogleAccount;
```

### Step 2: Create Google Auth Service

**File**: `packages/better-auth-connect/src/services/google/auth.ts`

```typescript
export interface GoogleAuthServiceConfig {
  authClient: AuthClient;
  apiBasePath?: string;
  callbackURL?: string;
}

export const createGoogleAuthService = (config: GoogleAuthServiceConfig) => {
  const { authClient, apiBasePath = '', callbackURL = '/app/integrations/google' } = config;

  return {
    /**
     * Connect Google account with specified services
     * @param services - Array of Google services: 'youtube', 'blogger', 'drive', 'gmail', 'photos'
     */
    connect: async (services: string[] = ['youtube']) => {
      // Map services to OAuth scopes
      const scopes = mapServicesToScopes(services);
      
      const session = await googleAuthService.getSession();
      
      if (session?.user) {
        // User is logged in - link the account
        await authClient.linkSocial({
          provider: 'google',
          callbackURL,
          scopes,
        });
      } else {
        // User not logged in - sign in with Google
        await authClient.signIn.social({
          provider: 'google',
          callbackURL,
          scopes,
        });
      }
    },
    
    // ... other methods (getAccounts, disconnect, etc.)
  };
};
```

### Step 3: Add Platform Config

**File**: `packages/better-auth-connect/src/types.ts`

```typescript
export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  // ... existing platforms
  google: {
    id: 'google',
    name: 'Google',
    authType: 'oauth',
    defaultScopes: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/youtube.readonly',
    ],
    callbackPath: '/app/integrations/google',
  },
};
```

### Step 4: Better Auth Configuration (Consuming App)

**File**: `v2/src/lib/auth.ts` (or your app's auth config)

```typescript
export const auth = betterAuth({
  // ... existing config
  socialProviders: {
    // ... existing providers
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/blogger',
        // Add other scopes as needed
      ],
    },
  },
});
```

### Step 5: Backend API Routes (Consuming App)

**File**: `v2/src/app/api/auth/google/accounts/route.ts`

```typescript
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { account } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  const accounts = await db
    .select()
    .from(account)
    .where(
      and(
        eq(account.userId, session.user.id),
        eq(account.providerId, 'google')
      )
    );
  
  return NextResponse.json(accounts);
}

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const accountId = request.nextUrl.searchParams.get("accountId");
  
  await db
    .delete(account)
    .where(
      and(
        eq(account.id, accountId),
        eq(account.userId, session.user.id),
        eq(account.providerId, 'google')
      )
    );
  
  return NextResponse.json({ success: true });
}
```

---

## Service Selection UI

Since Google has multiple services, you may want to provide a UI for users to select which services they want to connect:

```typescript
// Example: Service selection component
const googleServices = [
  { id: 'youtube', label: 'YouTube', description: 'Upload and manage videos' },
  { id: 'blogger', label: 'Blogger', description: 'Publish blog posts' },
  { id: 'drive', label: 'Google Drive', description: 'Access files' },
  { id: 'gmail', label: 'Gmail', description: 'Send emails' },
  { id: 'photos', label: 'Google Photos', description: 'Manage photos' },
];

// User selects services, then:
await googleAuthService.connect(['youtube', 'blogger']);
```

---

## Security Considerations

### High-Risk Scopes

Some Google scopes are considered **high-risk** and require:
- **App Verification**: Google may require app verification for sensitive scopes
- **Privacy Policy**: Must provide privacy policy URL
- **Terms of Service**: Must provide terms of service URL
- **OAuth Consent Screen**: Must configure consent screen in Google Cloud Console

**High-Risk Scopes**:
- `https://mail.google.com/` (Full Gmail access)
- `https://www.googleapis.com/auth/drive` (Full Drive access)
- `https://www.googleapis.com/auth/youtube` (Full YouTube access)

**Recommendation**: Start with read-only or limited scopes, request full access only when needed.

### App Verification Process

1. **Create OAuth Consent Screen** in Google Cloud Console
2. **Add Scopes** you need
3. **Submit for Verification** (if using sensitive scopes)
4. **Wait for Approval** (can take days/weeks)
5. **Publish App** (or keep in testing mode with limited users)

---

## Rate Limits

| Service | Rate Limit | Notes |
|---------|------------|-------|
| **YouTube** | 10,000 units/day | Quota system, varies by operation |
| **Blogger** | 1,000 requests/day | Per user |
| **Drive** | 1,000 requests/100 seconds | Per user |
| **Gmail** | 1,000 requests/100 seconds | Per user |
| **Photos** | 10,000 requests/day | Per user |

**Recommendation**: Implement caching and rate limit handling in API proxy routes.

---

## Files Summary

### Better Auth Connect Package

```
packages/better-auth-connect/
├── src/
│   ├── types.ts                    # Add GoogleAccount, update Platform type
│   ├── services/
│   │   └── google/
│   │       ├── auth.ts            # createGoogleAuthService
│   │       └── types.ts            # Google-specific types
│   └── components/
│       └── IntegrationCard.tsx    # Support Google platform
```

### Consuming Application

```
v2/
├── src/
│   ├── lib/
│   │   └── auth.ts                # Add Google to socialProviders
│   └── app/
│       └── api/
│           └── auth/
│               └── google/
│                   └── accounts/
│                       └── route.ts  # GET, DELETE endpoints
```

---

## Environment Variables Needed

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Where to get**: https://console.cloud.google.com/apis/credentials

---

## Redirect URI Configuration

In Google Cloud Console, add redirect URI:
```
https://your-app.com/api/auth/callback/google
```

---

## Implementation Verification

1. ✅ Google OAuth flow works (redirect → authorize → callback)
2. ✅ Access token stored in Better Auth `account` table
3. ✅ Token refresh works automatically
4. ✅ Can fetch Google API data using stored token
5. ✅ Service selection UI works (if implemented)
6. ✅ Multiple Google services can be connected simultaneously

---

## Future Enhancements

- **Service-Specific UI**: Different UI for YouTube vs Blogger vs Drive
- **Scope Management**: Allow users to add/remove services after initial connection
- **Service Status**: Show which services are connected per account
- **API Proxies**: Create proxy routes for each Google service API
- **Analytics Integration**: YouTube Analytics, Google Analytics

---

## Summary

Google integration provides access to multiple services:
- **YouTube** - Video management and analytics
- **Blogger** - Blog publishing
- **Google Drive** - File storage
- **Gmail** - Email automation
- **Google Photos** - Photo management

**Implementation**: Follows standard OAuth2 pattern (same as Reddit/X/Discord)
**Security**: Some scopes require app verification
**Flexibility**: Users can select which services to connect



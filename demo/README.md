# Better Auth Connect Demo

This demo showcases the `@reactkits.dev/better-auth-connect` package with both mock data and real Better Auth integration.

## Running the Demo

### Mock Mode (Default)

The demo runs in mock mode by default, showing UI components without requiring a backend:

```bash
cd demo
npm install
npm run dev
```

Visit `http://localhost:5173` to see the mock demo.

### Real Auth Mode

To test with a real Better Auth backend:

1. **Set up your Better Auth backend** (see main project's `src/lib/auth.ts`)

2. **Create `.env` file**:
```bash
cp .env.example .env
```

3. **Configure Better Auth URL**:
```env
VITE_BETTER_AUTH_URL=http://localhost:3000
```

4. **Start your Better Auth backend** (make sure it's running on the configured URL)

5. **Start the demo**:
```bash
npm run dev
```

6. **Navigate to Real Auth Test**: Click "Real Auth Test" in the navigation or visit `http://localhost:5173/real-auth`

## Backend Requirements

Your Better Auth backend must have:

### 1. Better Auth Configuration

```typescript
// src/lib/auth.ts
export const auth = betterAuth({
  database: drizzleAdapter(db),
  baseURL: 'http://localhost:3000',
  socialProviders: {
    reddit: {
      clientId: process.env.REDDIT_CLIENT_ID,
      clientSecret: process.env.REDDIT_CLIENT_SECRET,
      scope: ['identity', 'read', 'submit', 'mysubreddits'],
    },
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/youtube.readonly',
      ],
    },
  },
});
```

### 2. API Routes

Create these API routes in your backend:

```
GET    /api/auth/reddit/accounts     # Get connected Reddit accounts
DELETE /api/auth/reddit/accounts     # Disconnect Reddit account

GET    /api/auth/x/accounts          # Get connected X accounts
DELETE /api/auth/x/accounts          # Disconnect X account

GET    /api/auth/google/accounts     # Get connected Google accounts
DELETE /api/auth/google/accounts     # Disconnect Google account

GET    /api/auth/devto/accounts     # Get connected Dev.to accounts
POST   /api/auth/devto/accounts      # Connect Dev.to account (with API key)
DELETE /api/auth/devto/accounts      # Disconnect Dev.to account
```

### 3. CORS Configuration

Make sure your Better Auth backend allows requests from the demo origin:

```typescript
// In your Next.js/Express app
// Allow demo origin (adjust port if needed)
trustedOrigins: [
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000',  // Your backend
]
```

### 4. Better Auth Route Handler

```typescript
// src/app/api/auth/[...all]/route.ts
import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST } = toNextJsHandler(auth);
```

## Example API Route Implementation

```typescript
// src/app/api/auth/reddit/accounts/route.ts
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { account } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const accounts = await db
    .select()
    .from(account)
    .where(
      and(
        eq(account.userId, session.user.id),
        eq(account.providerId, 'reddit')
      )
    );

  return NextResponse.json(accounts);
}

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const accountId = request.nextUrl.searchParams.get('accountId');
  
  await db
    .delete(account)
    .where(
      and(
        eq(account.id, accountId),
        eq(account.userId, session.user.id),
        eq(account.providerId, 'reddit')
      )
    );

  return NextResponse.json({ success: true });
}
```

## Testing OAuth Flow

1. Click "Connect" on any platform card
2. You'll be redirected to the OAuth provider (Reddit, X, Google)
3. Authorize the app
4. You'll be redirected back to your callback URL
5. The account should appear as connected

## Troubleshooting

### "Failed to fetch accounts"
- Make sure your backend is running
- Check that `VITE_BETTER_AUTH_URL` matches your backend URL
- Verify CORS is configured correctly
- Check browser console for detailed errors

### "OAuth redirect not working"
- Verify callback URLs match in:
  - Better Auth config (`callbackURL` in auth service)
  - OAuth provider settings (Reddit/X/Google console)
- Check that Better Auth route handler is set up correctly

### "Session not found"
- Make sure you're logged in to your Better Auth backend
- Check that session cookies are being set correctly
- Verify `baseURL` in `createAuthClient` matches your backend

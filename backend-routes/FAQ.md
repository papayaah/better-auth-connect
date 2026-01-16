# Backend Routes FAQ

## Q: What is `backend-routes` folder?

**A**: It's just an **organizational folder** I created to store route templates. It's **not deployable itself** - consumers copy files from here into their own Next.js project.

**Folder name**: You can rename it or put files anywhere - it's just for organization.

## Q: Does OAuth login/connection require backend functions?

**A**: Yes! But Better Auth provides them automatically:

### OAuth Login/Connection (Better Auth handles)

When user clicks "Connect Reddit":
1. Client calls `authClient.signIn.social({ provider: 'reddit' })`
2. Better Auth's route (`POST /api/auth/sign-in/social`) handles:
   - Redirects to Reddit OAuth page
   - Receives callback (`GET /api/auth/callback/reddit`)
   - Exchanges code for tokens (server-side)
   - Stores tokens in database
   - Creates session

**You create**: `src/app/api/auth/[...all]/route.ts` (one file)
**Better Auth provides**: All OAuth routes automatically

### Account Management (You copy templates)

- `GET /api/auth/reddit/accounts` - List accounts (you copy template)
- `DELETE /api/auth/reddit/accounts` - Disconnect (you copy template)

These are **NOT** for login - they're for managing already-connected accounts.

## Q: Can I deploy `backend-routes` folder directly?

**A**: No! The `backend-routes` folder is **not deployable**. It's just templates.

**What you do:**
1. Copy files from `backend-routes/nextjs/` 
2. Paste into your Next.js app: `src/app/api/auth/...`
3. Deploy your Next.js app
4. Routes become serverless functions automatically

## Q: Where do I deploy the backend?

**A**: You don't deploy backend separately! You deploy your **Next.js app**:

```
Your Next.js App
├── src/app/                    → Frontend pages
├── src/app/api/                → API routes (backend)
│   ├── auth/[...all]/route.ts  → Better Auth handler
│   └── auth/reddit/accounts/route.ts → Account management
└── package.json
```

**Deploy entire app** → Vercel/Netlify/etc. → API routes become serverless functions

## Q: Does this work on Vercel/Netlify?

**A**: Yes! Next.js API routes deploy as serverless functions:

- **Vercel**: `src/app/api/**/route.ts` → Serverless Functions ✅
- **Netlify**: `src/app/api/**/route.ts` → Netlify Functions ✅
- **AWS**: `src/app/api/**/route.ts` → Lambda Functions ✅

No separate backend deployment needed!

## Q: What about Supabase Edge Functions?

**A**: Supabase Edge Functions use Deno runtime, which is different:

- **Option 1**: Use Supabase PostgreSQL + deploy Next.js API routes separately
- **Option 2**: Rewrite routes for Deno/Edge runtime (more work)

**Recommended**: Use Supabase as database, deploy Next.js app with API routes to Vercel/Netlify.

## Summary

| Question | Answer |
|----------|--------|
| What is `backend-routes`? | Template folder (not deployable) |
| Folder name required? | No - just organizational |
| OAuth login needs backend? | Yes - Better Auth provides automatically |
| GET/DELETE for login? | No - for account management only |
| Where to deploy? | Deploy entire Next.js app |
| Vercel/Netlify? | ✅ Yes - API routes = serverless functions |
| Separate backend server? | ❌ No - everything in Next.js app |

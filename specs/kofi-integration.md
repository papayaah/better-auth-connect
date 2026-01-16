# Ko-fi Integration Specification

## Overview

Ko-fi integration is **limited** - Ko-fi does not provide OAuth or API key authentication. The platform only offers **webhook functionality** for receiving payment notifications. This integration focuses on webhook setup and handling payment events.

## Better Auth Connect Architecture

**Type**: Webhook Only (No Authentication API)

**Integration Approach**:
- ⚠️ **No Standard Authentication**: Ko-fi doesn't provide OAuth or API keys
- ✅ **Webhook-Based**: Receive payment notifications via webhooks
- ⚠️ **Limited Integration**: Cannot read data from Ko-fi, only receive webhook events
- ❌ **NOT using Better Auth OAuth Flow**: No OAuth available
- ❌ **NOT using Better Auth Account Storage**: No accounts to store (webhook-only)
- ⚠️ **Not a Standard better-auth-connect Integration**: This is webhook-only, no account linking

**Why No Better Auth Connect?**
- Ko-fi doesn't support OAuth2 or API key authentication
- No user accounts to link or store
- Integration is webhook-receive only
- Better Auth's account storage not applicable
- This is handled outside of better-auth-connect (webhook endpoint only)

**Implementation Pattern**:
```typescript
// Webhook endpoint to receive Ko-fi payment events
// POST /api/webhooks/kofi

// No authentication service needed
// No account storage needed
// Just webhook handler
// This is NOT part of better-auth-connect
```

**Comparison with Other Integrations**:
- **Reddit/X/Discord/Instagram/Facebook (OAuth)**: Use `authClient.signIn.social()` → Better Auth handles OAuth2 flow
- **DevTo/BuyMeACoffee (API Key)**: Custom form → Validate key/token → Store in Better Auth DB manually
- **Bluesky (AT Protocol)**: Custom AT Protocol flow → App password auth, store token in Better Auth DB manually
- **Ko-fi (Webhook Only)**: No authentication → Webhook endpoint only → Not part of better-auth-connect

## Ko-fi API Overview

- **Authentication**: None (webhook-only)
- **Webhook Documentation**: https://help.ko-fi.com/hc/en-us/articles/360004162298-Does-Ko-fi-have-an-API-or-webhook
- **Status**: Webhook functionality only - no full API available
- **Webhook URL**: Configured in Ko-fi settings

## Authentication Method

Ko-fi does **not** provide authentication:
- No OAuth2
- No API keys
- No user authentication
- Webhook secret verification only (optional)

## API Capabilities - What's Possible

**⚠️ CRITICAL LIMITATION**: Ko-fi does not have a full API. Only webhook notifications are available.

### ✅ Webhook Operations

| Operation | Endpoint | Status | Notes |
|-----------|----------|--------|-------|
| **Receive Payment Webhook** | `POST /api/webhooks/kofi` | ✅ Yes | Receive payment notifications |
| **Receive Donation Webhook** | `POST /api/webhooks/kofi` | ✅ Yes | Receive donation notifications |
| **Receive Subscription Webhook** | `POST /api/webhooks/kofi` | ✅ Yes | Receive subscription events |
| **Verify Webhook Secret** | Webhook handler | ✅ Yes | Optional secret verification |

### ❌ Not Available

| Operation | Status | Notes |
|-----------|--------|-------|
| **OAuth Authentication** | ❌ No | Ko-fi doesn't provide OAuth |
| **API Key Authentication** | ❌ No | Ko-fi doesn't provide API keys |
| **Read User Profile** | ❌ No | No API to read profile data |
| **Read Donations** | ❌ No | No API to fetch donation history |
| **Read Subscriptions** | ❌ No | No API to fetch subscriptions |
| **Create Posts** | ❌ No | No API for content creation |
| **Manage Account** | ❌ No | No API for account management |
| **Get Analytics** | ❌ No | No API for analytics data |

### 📝 Webhook Events

**Payment Events:**
- One-time donations
- Subscription payments
- Shop purchases
- Commission payments

**Webhook Payload:**
```json
{
  "message_id": "string",
  "timestamp": "string",
  "type": "Donation" | "Subscription" | "Shop Order" | "Commission",
  "from_name": "string",
  "message": "string",
  "amount": "string",
  "currency": "string",
  "url": "string",
  "email": "string",
  "is_public": boolean,
  "kofi_transaction_id": "string"
}
```

**Webhook Verification:**
- Optional webhook secret can be configured
- Verify secret in webhook handler
- Prevents unauthorized webhook calls

### 🔍 Limitations

1. **No API Access**: Cannot read any data from Ko-fi
2. **Webhook Only**: Can only receive events, cannot query data
3. **No Authentication**: No way to authenticate users or link accounts
4. **One-Way Communication**: Only receive, cannot send data to Ko-fi
5. **Manual Setup**: Users must configure webhook URL in Ko-fi settings
6. **No Account Linking**: Cannot link Ko-fi accounts to user accounts

## Key Differences from Other Platforms

| Aspect | OAuth (Reddit/X) | API Key (Dev.to/BMC) | Webhook (Ko-fi) |
|--------|------------------|---------------------|-----------------|
| Authentication | OAuth2 flow | API key input | None |
| Account Storage | Better Auth DB | Better Auth DB | None |
| Data Access | Full API | Full API | None (receive only) |
| User Linking | Yes | Yes | No |
| Read Operations | Yes | Yes | No |
| Write Operations | Yes | Limited | No |
| Webhook Events | Optional | Optional | Only method |
| better-auth-connect | ✅ Yes | ✅ Yes | ❌ No (webhook only) |

## Implementation Notes

**Important**: Ko-fi integration is **NOT** part of better-auth-connect because:
1. There's no authentication to handle
2. There are no accounts to link or store
3. It's purely a webhook endpoint

This should be implemented as a separate webhook handler in the consuming application, not as part of better-auth-connect.

### Webhook Handler (Outside better-auth-connect)

**Webhook Endpoint**: `POST /api/webhooks/kofi`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyKofiWebhook, processKofiWebhook } from '@/services/kofi/webhookService';

export async function POST(request: NextRequest) {
    try {
        // 1. Get webhook payload
        const payload = await request.json();
        
        // 2. Verify webhook secret (if configured)
        const webhookSecret = process.env.KOFI_WEBHOOK_SECRET;
        if (webhookSecret) {
            const isValid = await verifyKofiWebhook(payload, webhookSecret, request);
            if (!isValid) {
                return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
            }
        }
        
        // 3. Process webhook event
        await processKofiWebhook(payload);
        
        // 4. Return success
        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Ko-fi webhook error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
```

### Webhook Service (Outside better-auth-connect)

**New File**: `src/services/kofi/webhookService.ts`

```typescript
interface KofiWebhookPayload {
    message_id: string;
    timestamp: string;
    type: 'Donation' | 'Subscription' | 'Shop Order' | 'Commission';
    from_name: string;
    message?: string;
    amount: string;
    currency: string;
    url?: string;
    email?: string;
    is_public: boolean;
    kofi_transaction_id: string;
    verification_token?: string;
}

export const verifyKofiWebhook = async (
    payload: KofiWebhookPayload,
    secret: string,
    request: Request
): Promise<boolean> => {
    // Verify webhook secret if provided
    // Ko-fi sends verification_token in payload
    if (payload.verification_token) {
        return payload.verification_token === secret;
    }
    return true; // If no secret configured, accept all
};

export const processKofiWebhook = async (payload: KofiWebhookPayload) => {
    // Process different webhook event types
    switch (payload.type) {
        case 'Donation':
            await handleDonation(payload);
            break;
        case 'Subscription':
            await handleSubscription(payload);
            break;
        case 'Shop Order':
            await handleShopOrder(payload);
            break;
        case 'Commission':
            await handleCommission(payload);
            break;
        default:
            console.warn('Unknown Ko-fi webhook type:', payload.type);
    }
};

const handleDonation = async (payload: KofiWebhookPayload) => {
    // Store donation event
    // Notify user
    // Trigger any automation
    console.log('Ko-fi donation received:', payload);
};

const handleSubscription = async (payload: KofiWebhookPayload) => {
    // Store subscription event
    // Update subscription status
    console.log('Ko-fi subscription received:', payload);
};

const handleShopOrder = async (payload: KofiWebhookPayload) => {
    // Store shop order event
    console.log('Ko-fi shop order received:', payload);
};

const handleCommission = async (payload: KofiWebhookPayload) => {
    // Store commission event
    console.log('Ko-fi commission received:', payload);
};
```

## Types (Optional - for webhook handling)

**New File**: `src/types/kofi.ts`

```typescript
export interface KofiWebhookPayload {
    message_id: string;
    timestamp: string;
    type: 'Donation' | 'Subscription' | 'Shop Order' | 'Commission';
    from_name: string;
    message?: string;
    amount: string;
    currency: string;
    url?: string;
    email?: string;
    is_public: boolean;
    kofi_transaction_id: string;
    verification_token?: string;
}

export interface KofiDonation {
    id: string;
    fromName: string;
    amount: string;
    currency: string;
    message?: string;
    email?: string;
    timestamp: string;
    isPublic: boolean;
    transactionId: string;
}
```

## UI Component (Optional - for webhook setup guide)

Since there's no account linking, the UI component would just show:
- Webhook setup instructions
- Webhook URL to configure in Ko-fi
- Recent webhook events (if stored)
- Webhook status

This is **NOT** an IntegrationCard component like other platforms, but rather a webhook configuration guide.

## Environment Variables Needed

```env
# Optional webhook secret for verification
KOFI_WEBHOOK_SECRET=your-webhook-secret-here
```

## Security Considerations

**Webhook Verification**:
- Optional webhook secret verification
- Verify secret token in webhook payload
- Reject unauthorized webhook calls

**Webhook Secret**:
- Store in environment variable
- Never expose in client-side code
- Use for verification only

**Rate Limiting**:
- Implement rate limiting on webhook endpoint
- Prevent webhook spam
- Log all webhook events

## Ko-fi Webhook Reference

**Webhook URL Format:**
```
https://yourdomain.com/api/webhooks/kofi
```

**Webhook Events:**
- `Donation` - One-time donation received
- `Subscription` - Subscription payment received
- `Shop Order` - Shop purchase received
- `Commission` - Commission payment received

**Webhook Payload:**
- `message_id` - Unique message ID
- `timestamp` - Event timestamp
- `type` - Event type
- `from_name` - Supporter name
- `message` - Optional message
- `amount` - Payment amount
- `currency` - Currency code
- `email` - Supporter email (if public)
- `is_public` - Whether donation is public
- `kofi_transaction_id` - Transaction ID
- `verification_token` - Optional webhook secret

## Implementation Verification

When building the webhook handler, ensure these features work correctly:

- [ ] Webhook endpoint receives POST requests
- [ ] Webhook payload is parsed correctly
- [ ] Webhook secret verification works (if configured)
- [ ] Different event types are handled correctly
- [ ] Webhook events are logged/stored
- [ ] Error handling for invalid webhooks
- [ ] Rate limiting on webhook endpoint
- [ ] Webhook setup instructions are clear
- [ ] Webhook URL is displayed correctly

## Important Limitations

1. **No API Access**: Ko-fi does not provide an API
2. **Webhook Only**: Can only receive events, cannot query data
3. **No Authentication**: Cannot link user accounts
4. **No Read Operations**: Cannot fetch donation history, subscriptions, etc.
5. **Manual Setup**: Users must configure webhook in Ko-fi settings
6. **One-Way Communication**: Only receive, cannot send data
7. **Not Part of better-auth-connect**: This is a webhook-only integration, handled separately

## Alternative Approaches

Since Ko-fi has limited API access, consider:

1. **Webhook Integration Only**: Focus on receiving payment notifications
2. **Manual Data Entry**: Users manually enter donation data (not ideal)
3. **Third-Party Services**: Use services that aggregate Ko-fi data (if available)
4. **Future API**: Monitor Ko-fi for future API availability

## Future Enhancements

1. **Webhook Event Storage**: Store webhook events in database
2. **Event Dashboard**: Display webhook events in UI
3. **Automation Triggers**: Trigger actions based on webhook events
4. **Analytics**: Analyze webhook events for insights
5. **Notifications**: Notify users of new donations/subscriptions

---

## Notes

- Ko-fi does not provide OAuth or API key authentication
- Only webhook functionality is available
- Cannot read any data from Ko-fi
- Webhook setup must be done manually in Ko-fi settings
- This is a receive-only integration
- No account linking possible
- **This is NOT a better-auth-connect integration** - it's a webhook-only feature
- Consider this a limited integration compared to other platforms
- Should be implemented as a separate webhook handler, not part of better-auth-connect



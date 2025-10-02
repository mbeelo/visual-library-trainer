# API Endpoints Documentation

This document provides complete implementations for the backend API endpoints required for Stripe integration with Visual Library Trainer 2.0.

## Overview

The Visual Library Trainer requires the following backend endpoints:
- **POST** `/api/create-checkout-session` - Create Stripe checkout session
- **POST** `/api/stripe-webhook` - Handle Stripe webhooks
- **GET** `/api/user-subscription` - Get user subscription status (optional)

## 🔧 Implementation Options

### Option 1: Vercel Serverless Functions (Recommended)

Create these files in your project:

#### `api/create-checkout-session.ts`

```typescript
import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Use service key for server operations
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { priceId, userId, email } = req.body

    // Validate required fields
    if (!priceId || !userId || !email) {
      return res.status(400).json({
        error: 'Missing required fields: priceId, userId, email'
      })
    }

    // Verify user exists in database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, subscription_tier')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check if user is already pro
    if (user.subscription_tier === 'pro') {
      return res.status(400).json({ error: 'User already has pro subscription' })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/dashboard?canceled=true`,
      customer_email: email,
      client_reference_id: userId,
      metadata: {
        userId,
        email,
      },
      subscription_data: {
        metadata: {
          userId,
          email,
        },
      },
    })

    res.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
```

#### `api/stripe-webhook.ts`

```typescript
import { NextApiRequest, NextApiResponse } from 'next'
import { buffer } from 'micro'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Disable default body parser
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const buf = await buffer(req)
  const signature = req.headers['stripe-signature'] as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return res.status(400).send('Webhook signature verification failed')
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id || session.metadata?.userId

  if (!userId) {
    console.error('No user ID found in checkout session')
    return
  }

  // Update user subscription to pro
  const { error } = await supabase
    .from('users')
    .update({ subscription_tier: 'pro' })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user subscription:', error)
    throw error
  }

  console.log(`User ${userId} upgraded to pro subscription`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId

  if (!userId) {
    console.error('No user ID found in subscription metadata')
    return
  }

  const subscriptionTier = subscription.status === 'active' ? 'pro' : 'free'

  const { error } = await supabase
    .from('users')
    .update({ subscription_tier: subscriptionTier })
    .eq('id', userId)

  if (error) {
    console.error('Error updating subscription status:', error)
    throw error
  }

  console.log(`User ${userId} subscription updated to ${subscriptionTier}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId

  if (!userId) {
    console.error('No user ID found in subscription metadata')
    return
  }

  // Downgrade user to free tier
  const { error } = await supabase
    .from('users')
    .update({ subscription_tier: 'free' })
    .eq('id', userId)

  if (error) {
    console.error('Error downgrading user subscription:', error)
    throw error
  }

  console.log(`User ${userId} subscription cancelled, downgraded to free`)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Optional: Log successful payments, send confirmation emails, etc.
  console.log(`Payment succeeded for invoice: ${invoice.id}`)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Optional: Handle failed payments, send notification emails, etc.
  console.log(`Payment failed for invoice: ${invoice.id}`)

  const subscription = invoice.subscription
  if (subscription && typeof subscription === 'string') {
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription)
    const userId = stripeSubscription.metadata?.userId

    if (userId) {
      // Optionally downgrade user or send notification
      console.log(`Payment failed for user: ${userId}`)
    }
  }
}
```

#### `api/user-subscription.ts` (Optional)

```typescript
import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { userId } = req.query

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'User ID is required' })
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user subscription:', error)
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ subscriptionTier: user.subscription_tier })
  } catch (error) {
    console.error('Error in user-subscription endpoint:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
```

### Option 2: Express.js Server

#### `server.js`

```javascript
const express = require('express')
const cors = require('cors')
const Stripe = require('stripe')
const { createClient } = require('@supabase/supabase-js')

const app = express()
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Middleware
app.use(cors())

// Raw body for webhooks
app.use('/api/stripe-webhook', express.raw({ type: 'application/json' }))

// JSON for other routes
app.use(express.json())

// Create checkout session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { priceId, userId, email } = req.body

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.headers.origin}/dashboard?success=true`,
      cancel_url: `${req.headers.origin}/dashboard?canceled=true`,
      customer_email: email,
      metadata: { userId },
    })

    res.json({ sessionId: session.id })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Stripe webhook
app.post('/api/stripe-webhook', async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle events (same logic as Vercel implementation above)

  res.json({ received: true })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

## 🔧 Required Dependencies

### For Vercel/Next.js:
```bash
npm install stripe @supabase/supabase-js micro
npm install -D @types/micro
```

### For Express.js:
```bash
npm install express cors stripe @supabase/supabase-js
```

## 🔐 Environment Variables

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_... # or sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key # Not the anon key!

# Optional: Stripe Price IDs for validation
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...
```

## 🧪 Testing

### Test Checkout Session
```bash
curl -X POST http://localhost:3000/api/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "price_test_123",
    "userId": "user_123",
    "email": "test@example.com"
  }'
```

### Test Webhook Locally
```bash
# Install Stripe CLI
stripe login
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Trigger test event
stripe trigger checkout.session.completed
```

## 🚨 Security Considerations

1. **Always validate webhooks** with Stripe signature
2. **Use service key** only on backend, never expose to frontend
3. **Validate user ownership** before updating subscriptions
4. **Log important events** for debugging and audit trails
5. **Handle errors gracefully** and return appropriate status codes
6. **Rate limit** your endpoints to prevent abuse

## 📊 Monitoring & Analytics

```typescript
// Add to your webhook handlers
const analytics = {
  conversions: 0,
  revenue: 0,
  failures: 0
}

// Track successful conversions
async function trackConversion(amount: number) {
  analytics.conversions++
  analytics.revenue += amount

  // Send to your analytics service
  console.log('Conversion tracked:', { amount, total: analytics.conversions })
}
```

## 🔍 Debugging

### Common Issues:

1. **Webhook signature verification fails**
   - Check webhook secret is correct
   - Ensure raw body is sent to webhook endpoint

2. **Checkout session creation fails**
   - Verify Stripe price IDs exist
   - Check user exists in database

3. **User subscription not updating**
   - Check webhook is receiving events
   - Verify user ID in metadata
   - Check Supabase permissions

### Debug Logs:
```typescript
// Add detailed logging
console.log('Webhook event:', {
  type: event.type,
  id: event.id,
  created: event.created
})
```

Your API endpoints are now ready for production! 🚀
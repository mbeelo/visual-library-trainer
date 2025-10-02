# Visual Library Trainer 2.0 - Deployment Guide

This guide covers the complete deployment process for Visual Library Trainer 2.0, from environment setup to production launch.

## 🚀 Quick Start Checklist

- [ ] **Supabase Setup** - Database + Authentication
- [ ] **Stripe Setup** - Payment processing
- [ ] **Environment Configuration** - API keys and URLs
- [ ] **Database Schema** - Create tables and policies
- [ ] **Backend API** - Stripe webhook endpoints
- [ ] **Frontend Deployment** - Deploy to Vercel/Netlify
- [ ] **Testing** - End-to-end user flow testing
- [ ] **Launch** - DNS, monitoring, analytics

## 1. Supabase Setup

### Create New Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Wait for database to be ready (~2 minutes)
4. Note your project URL and anon key

### Database Configuration
1. Go to SQL Editor in Supabase dashboard
2. Run the database schema (see DATABASE_SCHEMA.md)
3. Set up Row Level Security policies
4. Enable Google OAuth in Authentication settings

### Authentication Setup
1. **Authentication → Settings → Auth Providers**
2. **Enable Google Provider**:
   - Get Google OAuth credentials from Google Cloud Console
   - Add your domain to authorized origins
   - Configure redirect URIs

```
Authorized JavaScript origins:
- http://localhost:5173 (development)
- https://your-domain.com (production)

Authorized redirect URIs:
- https://your-project.supabase.co/auth/v1/callback
```

## 2. Stripe Setup

### Create Stripe Account
1. Sign up at [stripe.com](https://stripe.com)
2. Complete account verification
3. Get API keys from Dashboard → Developers → API keys

### Product Configuration
1. **Products → Add Product**:
   - **Pro Monthly**: $9/month recurring
   - **Pro Yearly**: $79/year recurring
2. Note the Price IDs for your environment variables

### Webhook Configuration
1. **Developers → Webhooks → Add endpoint**
2. **Endpoint URL**: `https://your-domain.com/api/stripe-webhook`
3. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

## 3. Environment Configuration

### Copy Environment Template
```bash
cp .env.example .env
```

### Configure Variables
```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... # or pk_test_... for testing
STRIPE_SECRET_KEY=sk_live_... # or sk_test_... for testing
STRIPE_WEBHOOK_SECRET=whsec_...

# Product Price IDs
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...
```

## 4. Backend API Setup

You'll need to create API endpoints for Stripe integration. Here's the required backend structure:

### API Endpoints Required

#### `/api/create-checkout-session` (POST)
```typescript
// Example implementation for Vercel/Next.js
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { priceId, userId, email } = req.body

  try {
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
}
```

#### `/api/stripe-webhook` (POST)
```typescript
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Use service key for admin operations
)

export default async function handler(req, res) {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return res.status(400).send(`Webhook signature verification failed.`)
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object
      await updateUserSubscription(session.metadata.userId, 'pro')
      break
    case 'customer.subscription.deleted':
      const subscription = event.data.object
      await updateUserSubscription(subscription.metadata.userId, 'free')
      break
  }

  res.json({ received: true })
}

async function updateUserSubscription(userId: string, tier: 'free' | 'pro') {
  const { error } = await supabase
    .from('users')
    .update({ subscription_tier: tier })
    .eq('id', userId)

  if (error) console.error('Error updating subscription:', error)
}
```

## 5. Frontend Deployment

### Vercel Deployment (Recommended)
1. **Connect GitHub Repository**
2. **Configure Environment Variables** in Vercel dashboard
3. **Deploy**:
   ```bash
   # Or deploy manually
   npm install -g vercel
   vercel --prod
   ```

### Netlify Deployment
1. **Connect GitHub Repository**
2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Environment Variables** in Netlify dashboard

### Custom Server Deployment
```bash
# Build the project
npm run build

# Serve static files
# Upload dist/ folder to your web server
# Configure your server to serve index.html for all routes
```

## 6. Domain & SSL Setup

### Custom Domain
1. **Add CNAME record**: `your-domain.com` → `your-app.vercel.app`
2. **Update Stripe webhook URL** to use custom domain
3. **Update Google OAuth settings** with new domain
4. **Update Supabase auth settings** with new domain

### SSL Certificate
- Vercel/Netlify provide automatic SSL
- For custom servers, use Let's Encrypt or CloudFlare

## 7. Testing Checklist

### User Flow Testing
- [ ] **Anonymous Usage** - Can use app without signing up
- [ ] **Sign Up Flow** - Email and Google OAuth work
- [ ] **Image Collection** - Can add/remove images
- [ ] **Free Tier Limits** - Shows upgrade prompt at 3 images
- [ ] **Payment Flow** - Stripe checkout works
- [ ] **Subscription Management** - User becomes Pro after payment
- [ ] **Data Migration** - localStorage data migrates on login
- [ ] **Cross-Device Sync** - Data persists across devices

### Stripe Testing
Use Stripe test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **SCA Required**: `4000 0025 0000 3155`

### Performance Testing
```bash
# Build and check bundle size
npm run build
# Should be < 500KB for main bundle

# Lighthouse audit
npm install -g lighthouse
lighthouse https://your-domain.com --view
```

## 8. Production Monitoring

### Analytics Setup
```javascript
// Add to index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

### Error Monitoring
Consider adding Sentry or LogRocket for error tracking:
```bash
npm install @sentry/react
```

### Key Metrics to Track
- **Conversion Rate**: Free → Pro signups
- **Retention**: Day 7, Day 30 user return
- **Feature Usage**: Image collection usage
- **Performance**: Page load times, error rates

## 9. Launch Day Checklist

### Pre-Launch (24h before)
- [ ] All tests passing
- [ ] Stripe in live mode
- [ ] DNS propagated
- [ ] SSL certificate active
- [ ] Monitoring tools configured
- [ ] Backup plans ready

### Launch Day
- [ ] Final deployment
- [ ] Smoke test all critical paths
- [ ] Monitor error rates
- [ ] Check payment processing
- [ ] Social media announcements
- [ ] Monitor traffic and performance

### Post-Launch (24h after)
- [ ] Review error logs
- [ ] Check conversion metrics
- [ ] User feedback collection
- [ ] Performance optimization
- [ ] Plan next iteration

## 🆘 Troubleshooting

### Common Issues

**Environment Variables Not Loading**
- Check `.env` file is in project root
- Restart dev server after changes
- Verify variable names start with `VITE_` for frontend

**Supabase Connection Failed**
- Verify URL and anon key
- Check network connectivity
- Ensure project is not paused

**Stripe Checkout Not Working**
- Verify publishable key
- Check webhook URL is correct
- Test with Stripe test cards first

**Authentication Issues**
- Check OAuth redirect URLs
- Verify Google Cloud Console settings
- Check browser console for errors

### Support Resources
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Stripe Docs**: [stripe.com/docs](https://stripe.com/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)

---

## 📞 Need Help?

If you encounter issues during deployment, check:
1. Browser console for JavaScript errors
2. Supabase logs for database issues
3. Stripe dashboard for payment issues
4. Vercel/Netlify logs for deployment issues

Good luck with your launch! 🚀
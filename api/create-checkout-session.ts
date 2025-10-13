import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
})

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  try {
    const { priceId, userId, userEmail } = req.body

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' })
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `https://${process.env.VERCEL_URL || 'afterimage.app'}/app/account?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://${process.env.VERCEL_URL || 'afterimage.app'}/app/dashboard`,
      metadata: {
        userId: userId || '',
      },
      customer_email: userEmail,
      subscription_data: {
        metadata: {
          userId: userId || '',
        },
      },
    })

    return res.status(200).json({
      sessionId: session.id,
      url: session.url
    })

  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return res.status(500).json({
      error: 'Failed to create checkout session',
      details: error.message
    })
  }
}
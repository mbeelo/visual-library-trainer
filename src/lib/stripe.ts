import { loadStripe } from '@stripe/stripe-js'

const stripeKey = (import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY

if (!stripeKey) {
  throw new Error('Missing Stripe publishable key')
}

export const stripe = loadStripe(stripeKey)
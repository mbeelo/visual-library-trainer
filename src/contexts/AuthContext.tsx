import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any }>
  signOut: () => Promise<void>
  subscriptionTier: 'free' | 'pro'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'pro'>('free')

  useEffect(() => {
    // Clean stale auth tokens from URL before processing session
    if (window.location.hash && window.location.hash.includes('access_token')) {
      // Check if tokens are stale (older than 2 minutes)
      const hash = window.location.hash
      const params = new URLSearchParams(hash.substring(1))
      const expiresAt = params.get('expires_at')

      if (expiresAt) {
        const expiryTime = parseInt(expiresAt) * 1000
        const now = Date.now()
        const timeUntilExpiry = expiryTime - now

        // If tokens expire in less than 2 minutes, they're likely stale
        if (timeUntilExpiry < 120000) {
          console.log('Cleaning stale auth tokens from URL')
          window.history.replaceState({}, '', window.location.pathname)
        }
      }
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔴 Auth state change:', event, session?.user?.email || 'no user')
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setSubscriptionTier('free')
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // Not found error
        console.error('Error fetching user profile:', error)
        return
      }

      if (data) {
        setSubscriptionTier(data.subscription_tier)
      } else {
        // Create user profile if it doesn't exist
        await createUserProfile(userId)
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error)
    }
  }

  const createUserProfile = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            email: user?.email || '',
            subscription_tier: 'free'
          }
        ])

      if (error) {
        console.error('Error creating user profile:', error)
      } else {
        setSubscriptionTier('free')
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { error }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    return { error }
  }

  const signOut = async () => {
    console.log('🔴 SignOut function called!')

    // Try Supabase signOut first with a reasonable timeout
    try {
      console.log('🔴 Calling supabase.auth.signOut()...')

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('SignOut timeout after 3 seconds')), 3000)
      )

      const signOutPromise = supabase.auth.signOut()
      await Promise.race([signOutPromise, timeoutPromise])

      console.log('🔴 Supabase signOut successful!')
      // If successful, the auth state change will handle UI updates
    } catch (error) {
      console.log('🔴 Supabase signOut failed/timeout:', (error as Error).message)
      console.log('🔴 Manually clearing auth state and tokens...')

      // Manually clear ONLY Supabase auth tokens from localStorage
      // Preserve user's practice data (vlt-history, vlt-ratings, vlt-custom-lists, etc.)
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('sb-') && key.includes('auth-token')) {
          localStorage.removeItem(key)
          console.log('🔴 Removed Supabase auth token:', key)
        }
      })

      // Reset local state
      setUser(null)
      setSubscriptionTier('free')
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    subscriptionTier
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
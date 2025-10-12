import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface UserList {
  id: string
  user_id: string
  name: string
  items: string[]
  is_active: boolean
  is_custom: boolean
  original_id: string | null
  description: string | null
  creator: string | null
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  userLists: UserList[]
  listsLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any }>
  signOut: () => Promise<void>
  subscriptionTier: 'free' | 'pro'
  findListByOriginalId: (originalId: string) => UserList | undefined
  findListContainingSubject: (subject: string) => UserList | undefined
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
  const [userLists, setUserLists] = useState<UserList[]>([])
  const [listsLoading, setListsLoading] = useState(false)

  useEffect(() => {
    console.log('🔵 AuthProvider mounting, initializing auth state...')

    // Get initial session with proper error handling
    const initializeAuth = async () => {
      try {
        console.log('🔵 Getting initial session...')

        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('🔴 Error getting session:', error)
          setLoading(false)
          return
        }

        console.log('🔵 Initial session:', session?.user?.email || 'no session')
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchUserProfile(session.user.id)
        }
        setLoading(false)
      } catch (error) {
        console.error('🔴 Exception during auth initialization:', error)
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔵 Auth state change:', event, session?.user?.email || 'no user')

      // Special handling for SIGNED_OUT to prevent loops
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setSubscriptionTier('free')
        setLoading(false)
        return
      }

      setUser(session?.user ?? null)

      if (session?.user) {
        // Set loading false first, then fetch profile in background
        setLoading(false)
        fetchUserProfile(session.user.id) // Don't await - let it run in background
      } else {
        setSubscriptionTier('free')
        setLoading(false)
      }
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
        // Check if user has curated lists, create if missing
        await ensureUserCuratedLists(userId)
        // Load user lists after profile is established
        await loadUserLists(userId)
      } else {
        // Create user profile if it doesn't exist
        await createUserProfile(userId)
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error)
    }
  }

  const ensureUserCuratedLists = async (userId: string) => {
    try {
      // Check if user has any custom lists (including curated ones)
      const { data, error } = await supabase
        .from('custom_lists')
        .select('id')
        .eq('user_id', userId)
        .limit(1)

      if (error) {
        console.error('Error checking user lists:', error)

        // If the table doesn't exist, gracefully continue without database lists
        if (error.code === 'PGRST205' || error.message?.includes('table')) {
          console.log('📦 Database tables not available - using localStorage mode')
          return
        }
        return
      }

      // If no lists exist, create curated lists
      if (!data || data.length === 0) {
        console.log('🔄 No lists found for existing user, creating curated lists')
        await createUserCuratedLists(userId)
      }
    } catch (error) {
      console.error('Error in ensureUserCuratedLists:', error)
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
        // Create user-specific curated lists after profile creation
        await createUserCuratedLists(userId)
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error)
    }
  }

  const createUserCuratedLists = async (userId: string) => {
    try {
      console.log('🏗️ Creating user-specific curated lists for:', userId)

      // Import curated lists data
      const { defaultList } = await import('../data/defaultList')
      const { communityLists } = await import('../data/communityLists')

      const allCuratedLists = [defaultList, ...communityLists]

      // Create user-specific versions of each curated list
      const userLists = allCuratedLists.map(list => ({
        user_id: userId,
        name: list.name,
        items: Object.values(list.categories).flat(), // Flatten all categories into items array
        is_active: list.id === 'default', // Make default list active
        is_custom: false, // Mark as curated list, not user-created
        created_at: new Date().toISOString(),
        // Store original metadata for reconstruction
        original_id: list.id,
        description: list.description,
        creator: list.creator
      }))

      const { error } = await supabase
        .from('custom_lists')
        .insert(userLists)

      if (error) {
        console.error('❌ Error creating curated lists for user:', error)
      } else {
        console.log('✅ Successfully created', userLists.length, 'curated lists for user')
        // Load the newly created lists
        await loadUserLists(userId)
      }
    } catch (error) {
      console.error('💥 Exception in createUserCuratedLists:', error)
    }
  }

  const loadUserLists = async (userId: string) => {
    try {
      setListsLoading(true)
      console.log('🔍 Loading user lists from AuthContext for:', userId)

      const { data, error } = await supabase
        .from('custom_lists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('❌ Error loading user lists:', error)
        setUserLists([])
        return
      }

      const lists = data || []
      console.log('✅ Loaded user lists from AuthContext:', lists.length, 'lists')
      setUserLists(lists)
    } catch (error) {
      console.error('💥 Exception loading user lists:', error)
      setUserLists([])
    } finally {
      setListsLoading(false)
    }
  }

  const findListByOriginalId = (originalId: string): UserList | undefined => {
    return userLists.find(list => list.original_id === originalId)
  }

  const findListContainingSubject = (subject: string): UserList | undefined => {
    return userLists.find(list => list.items.includes(subject))
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
        if (key.startsWith('sb-') || key.includes('afterimage-auth')) {
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
    userLists,
    listsLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    subscriptionTier,
    findListByOriginalId,
    findListContainingSubject
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
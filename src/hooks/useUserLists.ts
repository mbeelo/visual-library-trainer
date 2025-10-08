import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
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

// Global cache to prevent duplicate fetches across component mounts
const listsCache: { [userId: string]: { lists: UserList[], timestamp: number } } = {}
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Global promise cache to prevent duplicate simultaneous requests
const pendingFetches: { [userId: string]: Promise<UserList[]> } = {}

export function useUserLists() {
  const { user } = useAuth()
  const [userLists, setUserLists] = useState<UserList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setUserLists([])
      setLoading(false)
      return
    }

    // Check cache first
    const cached = listsCache[user.id]
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log('🎯 Using cached user lists:', cached.lists.length, 'lists')
      setUserLists(cached.lists)
      setLoading(false)
      setError(null)
      return
    }

    // Check if already fetching for this user
    if (pendingFetches[user.id]) {
      console.log('⏳ Already fetching user lists, awaiting existing request...')
      pendingFetches[user.id]
        .then(lists => {
          setUserLists(lists)
          setLoading(false)
          setError(null)
        })
        .catch(err => {
          console.error('💥 Error from pending fetch:', err)
          setError(err instanceof Error ? err.message : 'Unknown error')
          setUserLists([])
          setLoading(false)
        })
      return
    }

    // Create new fetch promise
    const fetchPromise = (async (): Promise<UserList[]> => {
      try {
        console.log('🔍 Loading user lists from database for:', user.id)

        const { data, error: listError } = await supabase
          .from('custom_lists')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })

        if (listError) {
          console.error('❌ Error loading user lists:', listError)
          throw new Error(listError.message)
        }

        const lists = data || []
        console.log('✅ Loaded user lists:', lists.length, 'lists')

        // Cache the results
        listsCache[user.id] = {
          lists,
          timestamp: Date.now()
        }

        return lists
      } finally {
        // Clean up pending fetch
        delete pendingFetches[user.id]
      }
    })()

    // Store pending fetch
    pendingFetches[user.id] = fetchPromise

    // Handle the result for this component
    fetchPromise
      .then(lists => {
        setUserLists(lists)
        setLoading(false)
        setError(null)
      })
      .catch(err => {
        console.error('💥 Exception loading user lists:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setUserLists([])
        setLoading(false)
      })
  }, [user])

  // Helper function to find list by original_id (e.g., "default" -> actual UUID)
  const findListByOriginalId = (originalId: string): UserList | undefined => {
    return userLists.find(list => list.original_id === originalId)
  }

  // Helper function to find which list contains a subject
  const findListContainingSubject = (subject: string): UserList | undefined => {
    return userLists.find(list => list.items.includes(subject))
  }

  return {
    userLists,
    loading,
    error,
    findListByOriginalId,
    findListContainingSubject
  }
}
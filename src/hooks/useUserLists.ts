import { useState, useEffect, useRef } from 'react'
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

export function useUserLists() {
  const { user } = useAuth()
  const [userLists, setUserLists] = useState<UserList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchingRef = useRef(false)

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

    // Prevent duplicate fetches if already fetching
    if (fetchingRef.current) {
      console.log('⏳ Already fetching user lists, waiting...')
      return
    }

    const loadUserLists = async () => {
      fetchingRef.current = true
      try {
        console.log('🔍 Loading user lists from database for:', user.id)

        const { data, error: listError } = await supabase
          .from('custom_lists')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })

        if (listError) {
          console.error('❌ Error loading user lists:', listError)
          setError(listError.message)
          setUserLists([])
        } else {
          console.log('✅ Loaded user lists:', data.length, 'lists')
          const lists = data || []
          setUserLists(lists)
          setError(null)

          // Cache the results
          listsCache[user.id] = {
            lists,
            timestamp: Date.now()
          }
        }
      } catch (err) {
        console.error('💥 Exception loading user lists:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setUserLists([])
      } finally {
        setLoading(false)
        fetchingRef.current = false
      }
    }

    loadUserLists()
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
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL
const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          subscription_tier: 'free' | 'pro'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          subscription_tier?: 'free' | 'pro'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          subscription_tier?: 'free' | 'pro'
          created_at?: string
        }
      }
      image_collections: {
        Row: {
          id: string
          user_id: string
          drawing_subject: string
          image_url: string
          position: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          drawing_subject: string
          image_url: string
          position?: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          drawing_subject?: string
          image_url?: string
          position?: number
          notes?: string | null
          created_at?: string
        }
      }
      practice_sessions: {
        Row: {
          id: string
          user_id: string
          subject: string
          duration: number
          rating: number
          images_used: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          duration: number
          rating: number
          images_used?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          duration?: number
          rating?: number
          images_used?: number
          created_at?: string
        }
      }
      custom_lists: {
        Row: {
          id: string
          user_id: string
          name: string
          items: string[]
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          items: string[]
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          items?: string[]
          is_active?: boolean
          created_at?: string
        }
      }
    }
  }
}
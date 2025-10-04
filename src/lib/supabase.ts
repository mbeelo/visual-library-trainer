import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://bcdmydwsoxpzhntyiuxf.supabase.co'
const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZG15ZHdzb3hwemhudHlpdXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNzc0NDUsImV4cCI6MjA3NDk1MzQ0NX0.qfvMDPLJjybSTkUzk96JTLS8yz5HhUjNLJ_uGxM280s'

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-my-custom-header': 'visual-library-trainer',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

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
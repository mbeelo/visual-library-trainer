// Test environment variables
console.log('🔧 Environment Variable Test:')
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY)

// Test Supabase client creation
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 Creating Supabase client...')
console.log('URL:', url)
console.log('Key exists:', !!key)

if (url && key) {
  const testClient = createClient(url, key)
  console.log('✅ Supabase client created successfully')
  console.log('Client URL:', testClient.supabaseUrl)
  console.log('Client Key exists:', !!testClient.supabaseKey)
} else {
  console.error('❌ Missing environment variables')
}
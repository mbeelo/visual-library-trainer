import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database tables...')

    // Try to create users table first
    console.log('📝 Creating users table...')
    const { error: usersError } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.users (
          id uuid REFERENCES auth.users ON DELETE CASCADE,
          subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
          PRIMARY KEY (id)
        );
      `
    })

    if (usersError) {
      console.log('⚠️  Users table creation failed, trying direct approach...')
      console.log('Error:', usersError.message)
    } else {
      console.log('✅ Users table created')
    }

    // Test basic connection first
    console.log('🔍 Testing connection...')
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (error) {
      console.log('📋 Connection test result:', error.message)
      console.log('💡 This indicates tables need to be created manually.')
      console.log('')
      console.log('🛠️  Please run this SQL in your Supabase SQL Editor:')
      console.log('👉 Go to: https://bcdmydwsoxpzhntyiuxf.supabase.co/project/default/sql')
      console.log('')
      const sql = readFileSync('./supabase-setup.sql', 'utf8')
      console.log('📋 Copy and paste this SQL:')
      console.log('----------------------------------------')
      console.log(sql)
      console.log('----------------------------------------')
      console.log('')
      console.log('Then click "Run" to execute it.')
    } else {
      console.log('✅ Database connection successful!')
      console.log('🎉 Tables are ready!')
    }

  } catch (error) {
    console.error('💥 Setup failed:', error.message)
  }
}

setupDatabase()
import { createClient } from '@supabase/supabase-js'

// For server-side operations with transaction pooler
const supabaseUrl = 'https://bcdmydwsoxpzhntyiuxf.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Transaction pooler URL for better connection management
const poolerUrl = 'postgresql://postgres.bcdmydwsoxpzhntyiuxf:WzTlz4qqbDa7DoRC@aws-0-us-west-1.pooler.supabase.com:6543/postgres'

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey || '', {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    headers: {
      'x-application-name': 'visual-library-trainer-server',
    },
  },
})

// Alternative: Direct PostgreSQL connection using the pooler
export const databaseConfig = {
  connectionString: poolerUrl,
  ssl: { rejectUnauthorized: false },
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}

export default supabaseServer
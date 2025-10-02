import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database tables...')

    // Read the SQL file
    const sqlFile = join(__dirname, 'supabase-setup.sql')
    const sql = readFileSync(sqlFile, 'utf8')

    // Split into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'))

    console.log(`📝 Executing ${statements.length} SQL statements...`)

    for (const statement of statements) {
      if (statement) {
        console.log(`⚡ Executing: ${statement.substring(0, 50)}...`)
        const { error } = await supabase.rpc('exec_sql', { sql: statement })

        if (error) {
          console.error('❌ Error:', error.message)
        } else {
          console.log('✅ Success')
        }
      }
    }

    console.log('🎉 Database setup complete!')

  } catch (error) {
    console.error('💥 Setup failed:', error.message)
    process.exit(1)
  }
}

setupDatabase()
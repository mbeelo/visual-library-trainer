import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL || process.env.VITE_SUPABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL or VITE_SUPABASE_URL environment variable is required')
}

// Disable prefetch as it's not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false })
export const db = drizzle(client, { schema })
import { createClient } from '@supabase/supabase-js'

// We use the '!' to tell TypeScript we guarantee these environment variables exist
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Export a single, reusable client for the whole app
export const supabase = createClient(supabaseUrl, supabaseKey)
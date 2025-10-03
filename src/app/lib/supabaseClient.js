// lib/supabaseClient.js

import { createClient } from '@supabase/supabase-js'

// These will now correctly read the server-side variables from your .env.local file
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

// This creates the connection to your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
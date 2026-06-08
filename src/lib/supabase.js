import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || 'https://vyewyyhgbqlwigmfnefk.supabase.co'
const SUPABASE_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5ZXd5eWhnYnFsd2lnbWZuZWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MDQyOTQsImV4cCI6MjA5NjQ4MDI5NH0.HaoS3c9QlFWLE8N-3unzZDVkRDEgkhWZIMGA_g7t5wM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

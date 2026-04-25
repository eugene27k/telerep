import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server-side client with service role key — bypasses RLS. Use only in server actions / API routes.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Browser-safe client with anon key — respects RLS.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

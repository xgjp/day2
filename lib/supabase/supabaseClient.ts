// lib/supabase/supabaseClient.ts
import { createClient } from '@/lib/supabase/client';

// Create and export a singleton instance of the Supabase client
export const supabase = createClient();
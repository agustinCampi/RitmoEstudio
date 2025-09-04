import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/types/supabase'

// Se usa una variable global para evitar crear un nuevo cliente en cada renderizado
let supabase: ReturnType<typeof createSupabaseClient<Database>>;

export function createClient() {
  if (!supabase) {
    supabase = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabase;
}

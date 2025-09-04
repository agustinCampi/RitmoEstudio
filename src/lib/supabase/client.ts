import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/types/supabase'

export function createClient() {
  return createClientComponentClient<Database>();
}

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/lib/types/supabase";

export const supabase = createClientComponentClient<Database>();

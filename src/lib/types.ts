
import { type User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'teacher' | 'student';

// This combines the auth user with our public.users profile
export interface User extends SupabaseUser {
  id: string; 
  email: string;
  name: string | null;
  role: UserRole;
  user_metadata: {
    [key: string]: any;
    full_name?: string;
  }
}

// Definición centralizada para una clase de baile
export interface DanceClass {
  id: string; // uuid
  created_at: string; // timestamp with time zone
  name: string; // text
  description: string | null; // text
  teacher_id: string; // uuid, foreign key to users
  // Horarios almacenados como un array de strings. Ej: ["Lunes 10:00-11:00", "Miércoles 10:00-11:00"]
  schedule: string[];
  // Podríamos añadir campos opcionales si queremos hacer joins
  teacher_name?: string;
}

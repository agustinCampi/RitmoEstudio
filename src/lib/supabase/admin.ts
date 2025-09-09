import { createClient } from '@supabase/supabase-js';

// Importante: Este cliente SÓLO debe usarse en el lado del servidor (Server Actions, Route Handlers).
// Nunca debe exponerse al lado del cliente, ya que utiliza la clave de servicio que tiene
// control total sobre tu base de datos.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseServiceRoleKey) {
  throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY');
}

// Creamos un cliente de Supabase específico para tareas de administración.
// Este cliente bypassa todas las políticas de RLS (Row Level Security).
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    // Importante: autoRefreshToken y persistSession deben ser `false` para
    // clientes de servidor que no actúan en nombre de un usuario.
    autoRefreshToken: false,
    persistSession: false,
  },
});

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ClassForm from '@/components/class-form';
import { createClass } from '../actions';

// Función de ayuda para verificar el rol.
async function checkRole(role: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  return user?.role === role;
}

export default async function NewClassPage() {
  // CORRECCIÓN 1: Añadida la protección de ruta para administradores.
  const isAdmin = await checkRole('admin');
  if (!isAdmin) {
    redirect('/dashboard');
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // CORRECCIÓN 2: Se obtiene la lista de profesores para pasarla al formulario.
  const { data: teachers, error } = await supabase
    .from('users')
    .select('id, name')
    .eq('role', 'teacher');

  if (error) {
    console.error("Error fetching teachers for new class form:", error);
    // Se podría mostrar un error o permitir continuar con el selector vacío.
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Añadir Nueva Clase</h1>
      {/* Se pasa la lista de profesores al formulario. */}
      <ClassForm action={createClass} teachers={teachers || []} />
    </div>
  );
}

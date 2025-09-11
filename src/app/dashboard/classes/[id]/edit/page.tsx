import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import ClassForm from '@/components/class-form';
import { updateClass } from '../../actions';
import { type DanceClass } from '@/lib/types';

// Función de ayuda para verificar el rol, idéntica a otras páginas seguras.
async function checkRole(role: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  return user?.role === role;
}

export default async function EditClassPage({ params }: { params: { id: string } }) {
  // CORRECCIÓN 1: Añadida la protección de ruta para administradores.
  const isAdmin = await checkRole('admin');
  if (!isAdmin) {
    redirect('/dashboard');
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Se obtienen los datos en paralelo para mejorar el rendimiento.
  const [classResult, teachersResult] = await Promise.all([
    supabase.from('classes').select('*').eq('id', params.id).single(),
    // CORRECCIÓN 2: Se filtra para obtener solo usuarios con el rol 'teacher'.
    supabase.from('users').select('id, name').eq('role', 'teacher'),
  ]);

  const { data: danceClass, error: classError } = classResult;
  const { data: teachers, error: teachersError } = teachersResult;

  if (classError || !danceClass) {
    notFound();
  }

  if (teachersError) {
    console.error('Error fetching teachers:', teachersError);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Editar Clase</h1>
      <ClassForm 
        action={updateClass} 
        danceClass={danceClass as DanceClass}
        teachers={teachers || []} 
      />
    </div>
  );
}

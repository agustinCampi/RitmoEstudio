import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import ClassForm from '@/components/class-form';
import { updateClass } from '../../actions';
import type { DanceClass } from '../../page';

export default async function EditClassPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Para optimizar la carga, obtenemos los datos de la clase y los profesores en paralelo.
  const [classResult, teachersResult] = await Promise.all([
    supabase.from('classes').select('*').eq('id', params.id).single(),
    supabase.from('users').select('id, name'),
  ]);

  const { data: danceClass, error: classError } = classResult;
  const { data: teachers, error: teachersError } = teachersResult;

  // Si hay un error obteniendo la clase o no se encuentra, mostramos un 404.
  if (classError || !danceClass) {
    notFound();
  }

  // Si hay un error obteniendo los profesores, lo mostramos en consola.
  if (teachersError) {
    console.error('Error fetching teachers:', teachersError);
    // La página podría seguir funcionando, pero el selector de profesor estaría vacío.
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Editar Clase</h1>
      {/* 
        Pasamos todos los datos necesarios al formulario: 
        la acción, los datos de la clase y la lista de profesores.
      */}
      <ClassForm 
        action={updateClass} 
        danceClass={danceClass as DanceClass}
        teachers={teachers || []} 
      />
    </div>
  );
}

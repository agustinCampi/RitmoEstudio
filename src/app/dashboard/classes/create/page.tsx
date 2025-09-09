import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import ClassForm from '@/components/class-form';
import { createClass } from '../actions';

// Página para crear una nueva clase.
export default async function CreateClassPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Obtenemos la lista de usuarios para usarlos como profesores.
  // Por ahora, asumimos que cualquier usuario puede ser profesor.
  const { data: teachers, error } = await supabase
    .from('users')
    .select('id, name');

  if (error) {
    console.error('Error fetching teachers:', error);
    // Podríamos mostrar un mensaje de error aquí.
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Crear Nueva Clase</h1>
      {/* 
        Renderizamos el formulario, pasándole la acción de creación y la lista de profesores.
        No pasamos 'danceClass' porque es un formulario de creación, no de edición.
      */}
      <ClassForm 
        action={createClass} 
        teachers={teachers || []} 
      />
    </div>
  );
}

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { DanceClass } from '@/lib/types';

async function getClassesForUser(supabase: any, user: any) {
  if (user.role === 'teacher') {
    // Si el usuario es un profesor, busca las clases que imparte
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', user.id);
    if (error) throw new Error(error.message);
    return data as DanceClass[] || [];
  } else {
    // Si el usuario es un alumno, busca las clases en las que está inscrito
    const { data, error } = await supabase
      .from('class_enrollments')
      .select('classes (*)')
      .eq('user_id', user.id);
    if (error) throw new Error(error.message);
    // La consulta devuelve un array de objetos { classes: {...} }
    return data?.map(e => e.classes) as DanceClass[] || [];
  }
}

export default async function MyClassesPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  try {
    const userClasses = await getClassesForUser(supabase, user);

    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Mis Clases</h1>
        {userClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userClasses.map((danceClass) => (
              <div key={danceClass.id} className="border p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800">
                <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-gray-100">{danceClass.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{danceClass.description}</p>
                {/* Mostrar horarios si existen */}
                {danceClass.schedule && danceClass.schedule.length > 0 && (
                  <div className="mb-4 space-y-1">
                    {danceClass.schedule.map((slot, index) => (
                      <div key={index} className="text-sm text-gray-500 dark:text-gray-400">
                        {slot}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            {user.role === 'teacher' 
              ? 'No tienes ninguna clase asignada.' 
              : 'Aún no estás inscrito en ninguna clase.'
            }
          </p>
        )}
      </div>
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    return <p className="text-red-500">Error cargando tus clases: {errorMessage}</p>;
  }
}

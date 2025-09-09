import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TeachersTable from '@/components/teachers-table';

async function checkRole(role: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  return user?.role === role;
}

export default async function TeachersPage() {
  // Proteger la ruta en el servidor
  const isAdmin = await checkRole('admin');
  if (!isAdmin) {
    redirect('/dashboard');
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: teachers, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'teacher');

  if (error) {
    console.error('Error fetching teachers:', error);
    // Podríamos mostrar un mensaje de error aquí
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestión de Profesores</h1>
        <p className="text-muted-foreground">
          Aquí puedes añadir, editar y eliminar profesores.
        </p>
      </div>
      <TeachersTable teachers={teachers || []} />
    </div>
  );
}

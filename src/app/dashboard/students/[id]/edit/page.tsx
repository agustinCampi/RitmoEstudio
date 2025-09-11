import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import StudentForm from '@/components/student-form';
import { updateStudent } from '../../actions';

async function checkRole(role: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  return user?.role === role;
}

export default async function EditStudentPage({ params }: { params: { id: string } }) {
  // Proteger la ruta en el servidor - ESTA ES LA CORRECCIÓN CRÍTICA
  const isAdmin = await checkRole('admin');
  if (!isAdmin) {
    redirect('/dashboard');
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: student, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !student) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Editar Alumno</h1>
      <StudentForm action={updateStudent} student={student} />
    </div>
  );
}

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import TeacherForm from '@/components/teacher-form';
import { updateTeacher } from '../../actions';
import { checkRole } from '@/lib/utils';
import { redirect } from 'next/navigation';

export default async function EditTeacherPage({ params }: { params: { id: string } }) {
  // Proteger la ruta en el servidor
  const isAdmin = await checkRole('admin');
  if (!isAdmin) {
    redirect('/dashboard');
  }
  
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: teacher, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !teacher) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Editar Profesor</h1>
      <TeacherForm action={updateTeacher} teacher={teacher} />
    </div>
  );
}

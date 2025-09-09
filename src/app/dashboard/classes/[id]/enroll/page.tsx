
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { type User } from '@/lib/types';
import EnrollClientPage from './client-page';
import { enrollStudent, unenrollStudent } from '../../actions';


export default async function EnrollPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  // Redirect if not admin
  const { data: profile } = await supabase.from('users').select('role').eq('id', user!.id).single();
  if (!user || profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch class details
  const { data: danceClass, error: classError } = await supabase
    .from('classes')
    .select('name')
    .eq('id', params.id)
    .single();

  // Fetch all students
  const { data: allStudents, error: studentsError } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('role', 'student');

  // Fetch currently enrolled students for this class
  const { data: enrolled, error: enrolledError } = await supabase
    .from('class_enrollments')
    .select('user_id')
    .eq('class_id', params.id);

  if (classError || studentsError || enrolledError) {
    return <p>Error: {classError?.message || studentsError?.message || enrolledError?.message}</p>;
  }

  if (!danceClass) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Inscribir Alumnos</h1>
      <h2 className="text-lg text-gray-600 dark:text-gray-400 mb-6">Clase: {danceClass.name}</h2>
      <EnrollClientPage
        classId={params.id}
        allStudents={allStudents as User[]}
        enrolledStudents={enrolled.map(e => e.user_id)}
        enrollAction={enrollStudent}
        unenrollAction={unenrollStudent}
      />
    </div>
  );
}

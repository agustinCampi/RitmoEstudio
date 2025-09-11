import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { enrollStudent, unenrollStudent } from '../../actions';
import EnrollSelfClientPage from './enroll-self-client-page'; // Un nuevo componente cliente que crearé

export default async function EnrollSelfPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  // 1. Guard de seguridad: solo para alumnos
  if (!user) return redirect('/login');
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'student') {
    // Si no es un alumno, no debería estar aquí. Lo redirigimos al dashboard.
    return redirect('/dashboard');
  }

  // 2. Obtener detalles de la clase y el estado de la inscripción en paralelo
  const [classResult, enrollmentResult] = await Promise.all([
    supabase.from('classes').select('name, description, schedule').eq('id', params.id).single(),
    supabase.from('class_enrollments').select('class_id').eq('class_id', params.id).eq('user_id', user.id).maybeSingle(),
  ]);

  const { data: danceClass, error: classError } = classResult;
  const { data: enrollment, error: enrollmentError } = enrollmentResult;

  if (classError) {
    console.error('Enrollment page error:', classError);
    return notFound();
  }

  // 3. Renderizar la página del cliente con la información obtenida
  return (
    <EnrollSelfClientPage 
      classId={params.id}
      danceClass={danceClass}
      isEnrolled={!!enrollment} // Convertir el resultado en un booleano
      enrollAction={enrollStudent}
      unenrollAction={unenrollStudent}
    />
  );
}

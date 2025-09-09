import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { type User } from '@/lib/types';
// Asumiremos que este componente será adaptado para recibir las props correctas
import AttendanceTracker from '@/components/teacher/attendance-tracker'; 

export default async function AttendancePage({ params }: { params: { classId: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // 1. Obtener los detalles de la clase y verificar los permisos
  const { data: danceClass, error: classError } = await supabase
    .from('classes')
    .select('name, teacher_id')
    .eq('id', params.classId)
    .single();

  if (classError || !danceClass) {
    notFound(); // La clase no existe
  }

  // Lógica de seguridad: Solo el profesor de la clase o un admin pueden acceder
  const isAdmin = user.role === 'admin';
  const isClassTeacher = user.id === danceClass.teacher_id;

  if (!isAdmin && !isClassTeacher) {
    redirect('/dashboard'); // No tienes permiso para ver esta página
  }

  // 2. Obtener la lista de alumnos inscritos en esta clase
  const { data: students, error: studentsError } = await supabase
    .from('class_enrollments')
    .select('users(*)') // Usamos un JOIN implícito de Supabase
    .eq('class_id', params.classId);

  if (studentsError) {
    // Aquí podríamos mostrar un mensaje de error más amigable
    return <p>Error al cargar los alumnos: {studentsError.message}</p>;
  }

  // El resultado de la consulta con JOIN anida los perfiles de usuario
  const enrolledStudents = students.map(enrollment => enrollment.users) as User[];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pasar Lista</h1>
        <h2 className="text-lg text-gray-600 dark:text-gray-400">Clase: {danceClass.name}</h2>
      </div>
      {/* 
        Pasamos la lista REAL de estudiantes al componente cliente.
        Este componente ahora solo se encarga de la UI y de llamar a la Server Action.
      */}
      <AttendanceTracker classId={params.classId} students={enrolledStudents} />
    </div>
  );
}

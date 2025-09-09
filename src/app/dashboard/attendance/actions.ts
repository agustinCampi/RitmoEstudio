'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export type AttendanceStatus = 'present' | 'absent' | 'late';

interface SaveAttendanceParams {
  classId: string;
  studentId: string;
  status: AttendanceStatus;
  date: string; // Formato YYYY-MM-DD
}

// Acción de Servidor para guardar la asistencia de un alumno
export async function saveAttendance(params: SaveAttendanceParams) {
  const { classId, studentId, status, date } = params;
  
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'No autenticado' };
  }

  // Verificación de seguridad: Solo el profesor de la clase o un admin pueden guardar asistencia
  const { data: danceClass, error: classError } = await supabase
    .from('classes')
    .select('teacher_id')
    .eq('id', classId)
    .single();

  if (classError || !danceClass) {
    return { error: 'Clase no encontrada' };
  }

  const isAdmin = user.role === 'admin';
  const isClassTeacher = user.id === danceClass.teacher_id;

  if (!isAdmin && !isClassTeacher) {
    return { error: 'No autorizado para realizar esta acción' };
  }

  // Lógica de "Upsert": buscar un registro existente para este alumno, clase y fecha
  const { data: existingRecord, error: selectError } = await supabase
    .from('attendance_records')
    .select('id')
    .eq('class_id', classId)
    .eq('student_id', studentId)
    .eq('date', date)
    .single();

  if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = no rows found
    return { error: `Error al buscar el registro: ${selectError.message}` };
  }

  // Si existe un registro, lo actualizamos. Si no, creamos uno nuevo.
  const { error: upsertError } = await supabase
    .from('attendance_records')
    .upsert({
      id: existingRecord?.id, // Proporcionar el ID si se está actualizando
      class_id: classId,
      student_id: studentId,
      date: date,
      status: status,
    });

  if (upsertError) {
    return { error: `Error al guardar la asistencia: ${upsertError.message}` };
  }

  // Revalidar la ruta para que la UI se actualice si es necesario
  revalidatePath(`/dashboard/attendance/${classId}`);
  return { success: true };
}

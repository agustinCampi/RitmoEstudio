'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { sendClassUpdateNotification } from '@/lib/notifications';

// Helper de autorización para asegurar que solo los administradores puedan ejecutar estas acciones.
async function ensureAdmin() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.role !== 'admin') {
    throw new Error('Acción no autorizada. Se requiere rol de administrador.');
  }
  return user;
}

const FormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  teacher_id: z.string().min(1, 'Debe seleccionar un profesor'),
  schedule: z.array(z.string()).min(1, 'Debe haber al menos un horario'),
});

const CreateClass = FormSchema.omit({ id: true });
const UpdateClass = FormSchema;

async function getEnrolledStudentsEmails(supabase: any, classId: string): Promise<string[]> {
    const { data, error } = await supabase
        .from('class_enrollments')
        .select('users(email)')
        .eq('class_id', classId);

    if (error) {
        console.error('Error fetching student emails:', error);
        return [];
    }

    return data.map((enrollment: any) => enrollment.users.email).filter(Boolean);
}

export async function createClass(prevState: any, formData: FormData) {
  try {
    await ensureAdmin();
  } catch (error: any) {
    return { message: error.message };
  }
  
  const validatedFields = CreateClass.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    teacher_id: formData.get('teacher_id'),
    schedule: formData.getAll('schedule'),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.from('classes').insert(validatedFields.data);

  if (error) {
    return { message: 'Error al crear la clase.' };
  }

  revalidatePath('/dashboard/classes');
  return { message: 'Clase creada exitosamente.' };
}

export async function updateClass(prevState: any, formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  try {
    await ensureAdmin();
  } catch (error: any) {
    return { message: error.message };
  }

  const validatedFields = UpdateClass.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    description: formData.get('description'),
    teacher_id: formData.get('teacher_id'),
    schedule: formData.getAll('schedule'),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { id, ...classData } = validatedFields.data;

  const { error } = await supabase.from('classes').update(classData).eq('id', id!);

  if (error) {
    return { message: 'Error al actualizar la clase.' };
  }

  const studentEmails = await getEnrolledStudentsEmails(supabase, id!);
  if (studentEmails.length > 0) {
    const { data: teacher } = await supabase.from('users').select('name').eq('id', classData.teacher_id).single();
    
    await sendClassUpdateNotification({
      className: classData.name,
      message: `La clase "${classData.name}" ha sido actualizada. Por favor, revisa los nuevos detalles.`,
      schedule: classData.schedule,
      teacherName: teacher?.name || 'No asignado',
      studentEmails: studentEmails,
    });
  }

  revalidatePath('/dashboard/classes');
  revalidatePath(`/dashboard/classes/${id}/edit`);
  return { message: 'Clase actualizada exitosamente.' };
}

export async function deleteClass(id: string) {
  try {
    await ensureAdmin();
  } catch (error: any) {
    return { success: false, message: error.message };
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('class_enrollments')
    .select('id')
    .eq('class_id', id)
    .limit(1);

  if (enrollmentsError) {
    console.error('Error checking enrollments:', enrollmentsError);
    return { success: false, message: 'Error al verificar las inscripciones.' };
  }

  if (enrollments && enrollments.length > 0) {
    return { success: false, message: 'Esta clase no puede ser eliminada porque tiene estudiantes inscritos.' };
  }

  const { error } = await supabase.from('classes').delete().eq('id', id);

  if (error) {
    return { success: false, message: 'Error al eliminar la clase.' };
  }

  revalidatePath('/dashboard/classes');
  return { success: true };
}

export async function enrollStudent(classId: string, studentId: string) {
  try {
    await ensureAdmin();
  } catch (error: any) {
    return { success: false, message: error.message };
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.from('class_enrollments').insert({ class_id: classId, user_id: studentId });

  if (error) {
    return { success: false, message: error.message };
  }
  revalidatePath(`/dashboard/classes/${classId}/enroll`);
  return { success: true };
}

export async function unenrollStudent(classId: string, studentId: string) {
  try {
    await ensureAdmin();
  } catch (error: any) {
    return { success: false, message: error.message };
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.from('class_enrollments').delete().match({ class_id: classId, user_id: studentId });

  if (error) {
    return { success: false, message: error.message };
  }
  revalidatePath(`/dashboard/classes/${classId}/enroll`);
  return { success: true };
}

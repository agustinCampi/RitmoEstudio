'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { sendClassUpdateNotification, sendClassCancellationNotification } from '@/lib/notifications';
import { type DanceClass } from '@/lib/types';

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
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.role !== 'admin') return { message: 'Acción no autorizada.' };

  const validatedFields = CreateClass.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    teacher_id: formData.get('teacher_id'),
    schedule: formData.getAll('schedule'),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

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
  
  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.role !== 'admin') return { message: 'Acción no autorizada.' };

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

  // Enviar notificación después de una actualización exitosa
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
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.role !== 'admin') {
    return { success: false, message: 'Acción no autorizada.' };
  }

  // 1. Obtener los detalles de la clase y los correos de los alumnos ANTES de borrar
  const { data: classToDelete } = await supabase.from('classes').select('name').eq('id', id).single();
  if (!classToDelete) {
    return { success: false, message: 'La clase no existe.' };
  }
  const studentEmails = await getEnrolledStudentsEmails(supabase, id);

  // 2. Eliminar la clase
  const { error } = await supabase.from('classes').delete().eq('id', id);

  if (error) {
    return { success: false, message: 'Error al eliminar la clase.' };
  }

  // 3. Enviar notificación de cancelación si había alumnos inscritos
  if (studentEmails.length > 0) {
    await sendClassCancellationNotification({
      className: classToDelete.name,
      message: `Lamentamos informarte que la clase "${classToDelete.name}" ha sido cancelada.`,
      studentEmails: studentEmails,
    });
  }

  revalidatePath('/dashboard/classes');
  return { success: true };
}


// enroll actions

export async function enrollStudent(classId: string, studentId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.role !== 'admin') {
    return { success: false, message: 'Acción no autorizada.' };
  }

  const { error } = await supabase.from('class_enrollments').insert({ class_id: classId, user_id: studentId });

  if (error) {
    return { success: false, message: error.message };
  }
  revalidatePath(`/dashboard/classes/${classId}/enroll`);
  return { success: true };
}

export async function unenrollStudent(classId: string, studentId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.role !== 'admin') {
    return { success: false, message: 'Acción no autorizada.' };
  }

  const { error } = await supabase.from('class_enrollments').delete().match({ class_id: classId, user_id: studentId });

  if (error) {
    return { success: false, message: error.message };
  }
  revalidatePath(`/dashboard/classes/${classId}/enroll`);
  return { success: true };
}

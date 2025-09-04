
'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const classSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  description: z.string().min(10, "La descripción es muy corta."),
  teacherId: z.string().nonempty("Debes asignar un profesor."),
  schedule: z.string().nonempty("El horario es obligatorio."),
  duration: z.coerce.number().min(30, "La duración mínima es de 30 minutos."),
  maxStudents: z.coerce.number().min(1, "Debe haber al menos un cupo."),
  category: z.string().nonempty("La categoría es obligatoria."),
  level: z.enum(['principiante', 'intermedio', 'avanzado']),
  teacherName: z.string(),
});

export async function upsertClass(formData: FormData) {
  const supabase = createAdminClient()

  const values = {
    id: formData.get('id') as string || undefined,
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    teacherId: formData.get('teacherId') as string,
    schedule: formData.get('schedule') as string,
    duration: formData.get('duration') as string,
    maxStudents: formData.get('maxStudents') as string,
    category: formData.get('category') as string,
    level: formData.get('level') as 'principiante' | 'intermedio' | 'avanzado',
    teacherName: formData.get('teacherName') as string,
  }

  const validatedFields = classSchema.safeParse(values)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { id, ...classData } = validatedFields.data;

  let result;
  if (id) {
    // Update
    result = await supabase.from('classes').update(classData).eq('id', id).select().single();
  } else {
    // Insert
    const newClassPayload = {
      ...classData,
      image: `https://picsum.photos/600/400?random=${Date.now()}`,
      bookedStudents: 0,
    };
    result = await supabase.from('classes').insert(newClassPayload).select().single();
  }

  const { error } = result;

  if (error) {
    return {
      error: {
        message: error.message,
      }
    }
  }

  revalidatePath('/dashboard/classes')
  return { data: result.data }
}

export async function deleteClass(classId: string) {
    const supabase = createAdminClient();

    const { error } = await supabase.from('classes').delete().eq('id', classId);

    if (error) {
        return {
            error: {
                message: error.message
            }
        }
    }
    
    revalidatePath('/dashboard/classes');
    return { success: true };
}

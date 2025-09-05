
'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const classSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  description: z.string().min(10, "La descripción es muy corta."),
  teacher_id: z.string().nonempty("Debes asignar un profesor."),
  schedule: z.string().nonempty("El horario es obligatorio."),
  duration: z.coerce.number().min(30, "La duración mínima es de 30 minutos."),
  max_students: z.coerce.number().min(1, "Debe haber al menos un cupo."),
  level: z.enum(['principiante', 'intermedio', 'avanzado']),
});

export async function upsertClass(formData: FormData) {
  const supabase = createAdminClient()

  const teacherId = formData.get('teacher_id') as string;
  const teacherNameResult = await supabase.from('users').select('name').eq('id', teacherId).single();
  const teacherName = teacherNameResult.data?.name || 'Desconocido';

  const values = {
    id: formData.get('id') as string || undefined,
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    teacher_id: teacherId,
    schedule: formData.get('schedule') as string,
    duration: formData.get('duration') as string,
    max_students: formData.get('max_students') as string,
    level: formData.get('level') as 'principiante' | 'intermedio' | 'avanzado',
  }

  const validatedFields = classSchema.safeParse(values)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { id, ...classData } = validatedFields.data;

  let result;
  
  const payload = {
    ...classData,
    teacherName: teacherName,
  };

  if (id) {
    // Update: Don't update the image, but ensure teacherName is present.
    result = await supabase.from('classes').update(payload).eq('id', id).select('*, teacher:users(name)').single();
  } else {
    // Insert: Include the new image
    const insertPayload = {
      ...payload,
      image: `https://picsum.photos/600/400?random=${Date.now()}`,
    };
    result = await supabase.from('classes').insert(insertPayload).select('*, teacher:users(name)').single();
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


export async function getClassesWithTeachers() {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('classes')
        .select(`
            *,
            teacher:users(name)
        `);

    if (error) {
        console.error("Error fetching classes:", error);
        return [];
    }
    
    // Remap the data to create a flat structure with teacher_name
    return data?.map(cls => ({
        ...cls,
        teacher_name: (cls.teacher as any)?.name || 'Desconocido'
    })) || [];
}


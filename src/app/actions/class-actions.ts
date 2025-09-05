
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

  // We no longer need to fetch the teacher's name here to store it denormalized.
  // The join in getClassesWithTeachers will handle providing the name.
  
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
  
  // No longer need to manually add teacherName to the payload.
  const payload = { ...classData };

  if (id) {
    // Update operation
    result = await supabase.from('classes').update(payload).eq('id', id).select().single();
  } else {
    // Insert operation
     const insertPayload = {
      ...payload,
      image: `https://picsum.photos/600/400?random=${Date.now()}`,
    };
    result = await supabase.from('classes').insert(insertPayload).select().single();
  }

  const { error } = result;

  if (error) {
    console.error("Error upserting class:", error);
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

// This is the corrected and standardized function to get all classes with their teacher's name.
export async function getClassesWithTeachers() {
    const supabase = createAdminClient();
    
    // Correct way to perform a join in Supabase
    const { data, error } = await supabase
        .from('classes')
        .select(`
            *,
            teacher:users (name)
        `);

    if (error) {
        console.error("Error fetching classes with teachers:", error);
        return [];
    }
    
    // Remap the data to create a flat structure with teacher_name for easy use in components.
    return data?.map(cls => ({
        ...cls,
        // The joined data is in a nested object, so we extract it.
        teacher_name: (cls.teacher as any)?.name || 'Desconocido'
    })) || [];
}

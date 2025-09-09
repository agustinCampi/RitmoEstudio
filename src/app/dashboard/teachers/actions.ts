'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// Helper to check for admin role
async function ensureAdmin() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.role !== 'admin') {
    throw new Error('Acción no autorizada.');
  }
  return user;
}

const TeacherSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  email: z.string().email('Email inválido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.').optional().or(z.literal('')),
});

export async function createTeacher(prevState: any, formData: FormData) {
  try {
    await ensureAdmin();
  } catch (error: any) {
    return { message: error.message };
  }

  const validatedFields = TeacherSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Error de validación.' };
  }

  const { name, email, password } = validatedFields.data;

  if (!password) {
    return { errors: { password: ['La contraseña es obligatoria'] }, message: 'Error de validación.' };
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name, role: 'teacher' }, // Corregido: Usar full_name y añadir rol
  });

  if (authError) {
    return { message: `Error creando el usuario: ${authError.message}` };
  }

  revalidatePath('/dashboard/teachers');
  redirect('/dashboard/teachers');
}

export async function updateTeacher(prevState: any, formData: FormData) {
  let user;
  try {
    user = await ensureAdmin();
  } catch (error: any) {
    return { message: error.message };
  }

  const validatedFields = TeacherSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Error de validación.' };
  }

  const { id, name, email, password } = validatedFields.data;

  if (!id) {
    return { message: 'El ID del profesor es requerido.' };
  }

  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
    email,
    password: password || undefined,
    user_metadata: { full_name: name }, // Corregido: Usar full_name
  });

  if (authError) {
    return { message: `Error actualizando el usuario: ${authError.message}` };
  }

  revalidatePath('/dashboard/teachers');
  redirect('/dashboard/teachers');
}

export async function deleteTeacher(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    await ensureAdmin();
  } catch (error: any) {
    return { success: false, message: error.message };
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Verificar si el profesor tiene clases asignadas
  const { data: classes, error: checkError } = await supabase
    .from('classes')
    .select('id')
    .eq('teacher_id', id)
    .limit(1);

  if (checkError) {
    console.error('Error checking for classes:', checkError);
    return { success: false, message: 'Error al verificar las clases del profesor.' };
  }

  if (classes && classes.length > 0) {
    return { success: false, message: 'Este profesor no puede ser eliminado porque tiene clases asignadas.' };
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

  if (error) {
    console.error('Error eliminando profesor:', error);
    return { success: false, message: `Error eliminando profesor: ${error.message}` };
  }

  revalidatePath('/dashboard/teachers');
  return { success: true };
}

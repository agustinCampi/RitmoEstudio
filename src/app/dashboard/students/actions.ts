'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

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

const StudentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  email: z.string().email('Email inválido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.').optional().or(z.literal('')),
});

export async function createStudent(prevState: any, formData: FormData) {
  try {
    await ensureAdmin();
  } catch (error: any) {
    return { message: error.message };
  }

  const validatedFields = StudentSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Error de validación.' };
  }

  const { name, email, password } = validatedFields.data;

  if (!password) {
    return { errors: { password: ['La contraseña es obligatoria'] }, message: 'Error de validación.' };
  }

  // 1. Crear el usuario en Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name, role: 'student' },
  });

  if (authError) {
    return { message: `Error creando el usuario: ${authError.message}` };
  }

  const userId = authData.user.id;

  // 2. Insertar el perfil en la tabla public.users (LÓGICA CRÍTICA RESTAURADA)
  const { error: profileError } = await supabaseAdmin.from('users').insert({
    id: userId,
    name,
    email,
    role: 'student',
  });

  if (profileError) {
    // Rollback: si falla la inserción del perfil, eliminar el usuario de auth
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return { message: `Error creando el perfil de usuario: ${profileError.message}` };
  }

  revalidatePath('/dashboard/students');
  redirect('/dashboard/students');
}

export async function updateStudent(prevState: any, formData: FormData) {
  try {
    await ensureAdmin();
  } catch (error: any) {
    return { message: error.message };
  }

  const validatedFields = StudentSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Error de validación.' };
  }

  const { id, name, email, password } = validatedFields.data;

  if (!id) {
    return { message: 'El ID del alumno es requerido.' };
  }

  // 1. Actualizar datos en Supabase Auth
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
    email,
    password: password || undefined,
    user_metadata: { full_name: name },
  });

  if (authError) {
    return { message: `Error actualizando el usuario: ${authError.message}` };
  }

  // 2. Actualizar el perfil en public.users para mantener consistencia (LÓGICA CRÍTICA RESTAURADA)
  const { error: profileError } = await supabaseAdmin.from('users').update({ name, email }).eq('id', id);

  if (profileError) {
    return { message: `Error actualizando el perfil de usuario: ${profileError.message}` };
  }

  revalidatePath('/dashboard/students');
  redirect('/dashboard/students');
}

export async function deleteStudent(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    await ensureAdmin();
  } catch (error: any) {
    return { success: false, message: error.message };
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. Verificar si el alumno tiene inscripciones en clases (Protección Cascada)
  const { data: enrollments, error: checkError } = await supabase
    .from('class_enrollments')
    .select('id')
    .eq('student_id', id)
    .limit(1);

  if (checkError) {
    console.error('Error checking for enrollments:', checkError);
    return { success: false, message: 'Error al verificar las inscripciones del alumno.' };
  }

  if (enrollments && enrollments.length > 0) {
    return { success: false, message: 'Este alumno no puede ser eliminado porque está inscrito en clases.' };
  }

  // 2. Eliminar el usuario de Supabase Auth (la tabla public.users se actualiza por CASCADE)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

  if (error) {
    console.error('Error eliminando alumno:', error);
    return { success: false, message: `Error eliminando alumno: ${error.message}` };
  }

  revalidatePath('/dashboard/students');
  return { success: true };
}

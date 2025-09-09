'use server';

// Importamos el cliente de admin que tiene los superpoderes necesarios.
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// Unificamos los esquemas de Zod. 
// El ID es opcional (para la creación) y la contraseña también (para la actualización).
const StudentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  email: z.string().email('Email inválido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.').optional().or(z.literal('')),
});

/**
 * Acción para CREAR un nuevo alumno.
 * Utiliza el cliente de admin para crear un usuario en el sistema de autenticación y
 * luego inserta su perfil en la tabla `users`.
 */
export async function createStudent(prevState: any, formData: FormData) {
  const validatedFields = StudentSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Error de validación.' };
  }

  const { name, email, password } = validatedFields.data;

  // ¡La contraseña es obligatoria para usuarios nuevos!
  if (!password) {
    return { errors: { password: ['La contraseña es obligatoria'] }, message: 'Error de validación.' };
  }

  // 1. Crear el usuario en el sistema de autenticación de Supabase.
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Lo marcamos como confirmado para que el usuario pueda iniciar sesión directamente.
    user_metadata: { name, role: 'student' },
  });

  if (authError) {
    return { message: `Error creando el usuario de autenticación: ${authError.message}` };
  }

  const userId = authData.user.id;

  // 2. Insertar el perfil del usuario en nuestra tabla `public.users`.
  // Esto nos da más control y evita depender de triggers de base de datos.
  const { error: profileError } = await supabaseAdmin.from('users').insert({
    id: userId,
    name,
    email,
    role: 'student',
  });

  if (profileError) {
    // Si la inserción del perfil falla, debemos intentar eliminar al usuario de auth para evitar datos huérfanos.
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return { message: `Error creando el perfil de usuario: ${profileError.message}` };
  }

  revalidatePath('/dashboard/students');
  redirect('/dashboard/students');
}

/**
 * Acción para ACTUALIZAR un alumno existente.
 * Utiliza el cliente de admin para actualizar los datos de autenticación (email, contraseña)
 * y los datos del perfil en la tabla `users`.
 */
export async function updateStudent(prevState: any, formData: FormData) {
  const validatedFields = StudentSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Error de validación.' };
  }

  const { id, name, email, password } = validatedFields.data;

  if (!id) {
    return { message: 'El ID del alumno es requerido para actualizar.' };
  }

  // 1. Actualizar los datos de autenticación del usuario.
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
    email,
    password: password || undefined, // Si la contraseña está vacía, no la actualizamos.
    user_metadata: { name },
  });

  if (authError) {
    return { message: `Error actualizando la autenticación del usuario: ${authError.message}` };
  }

  // 2. Actualizar el perfil en la tabla `public.users` para mantener la consistencia.
  const { error: profileError } = await supabaseAdmin.from('users').update({ name, email }).eq('id', id);

  if (profileError) {
    return { message: `Error actualizando el perfil de usuario: ${profileError.message}` };
  }

  revalidatePath('/dashboard/students');
  redirect('/dashboard/students');
}

/**
 * Acción para ELIMINAR un alumno.
 * Utiliza el cliente de admin para eliminar al usuario del sistema de autenticación.
 * La tabla `users` debería actualizarse automáticamente gracias al `ON DELETE CASCADE`.
 */
export async function deleteStudent(id: string) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

  if (error) {
    console.error('Error eliminando alumno:', error);
    // Devolvemos un mensaje para que el cliente pueda mostrar una notificación de error.
    return { message: `Error eliminando alumno: ${error.message}` };
  }

  revalidatePath('/dashboard/students');
  
  // En caso de éxito, NO devolvemos nada. 
  // El componente cliente interpretará una respuesta `undefined` como éxito y refrescará la UI.
  return;
}

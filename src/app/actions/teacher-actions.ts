
"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createTeacher(formData: FormData) {
    const supabase = createClient();

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
        return { success: false, message: 'Todos los campos son obligatorios.' };
    }

    // First, create the user in the auth system
    const { data: { user }, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true, // Automatically confirm the email
        user_metadata: { name: name, role: 'teacher' },
    });

    if (authError || !user) {
        return { success: false, message: `Error de autenticación: ${authError?.message}` };
    }

    // Next, insert the user profile into the 'users' table
    const { error: insertError } = await supabase.from('users').insert({
        id: user.id,
        name: name,
        email: email,
        role: 'teacher',
    });

    if (insertError) {
        // If inserting into the users table fails, we should delete the auth user to avoid orphans
        await supabase.auth.admin.deleteUser(user.id);
        return { success: false, message: `Error de base de datos: ${insertError.message}` };
    }

    revalidatePath('/dashboard/teachers');
    return { success: true, message: 'Profesor creado con éxito.' };
}

export async function updateTeacher(formData: FormData) {
    const supabase = createClient();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;

    if (!id || !name) {
        return { success: false, message: 'Faltan datos para actualizar.' };
    }

    const { error } = await supabase
        .from('users')
        .update({ name: name })
        .eq('id', id);

    if (error) {
        return { success: false, message: `Error al actualizar: ${error.message}` };
    }

    revalidatePath('/dashboard/teachers');
    return { success: true, message: 'Profesor actualizado.' };
}

export async function deleteTeacher(formData: FormData) {
    const supabase = createClient();
    const id = formData.get('id') as string;

    if (!id) {
        return { success: false, message: 'ID de profesor no proporcionado.' };
    }

    // We need to delete from the 'users' table first due to potential foreign key constraints
    const { error: dbError } = await supabase.from('users').delete().eq('id', id);

    if (dbError) {
       return { success: false, message: `Error en la base de datos al eliminar: ${dbError.message}` };
    }

    // Then, delete the user from the auth system
    const { error: authError } = await supabase.auth.admin.deleteUser(id);

    if (authError) {
        // This is problematic. The user is deleted from the DB but not from Auth.
        // You might need a more robust transaction or cleanup process here.
        return { success: false, message: `Error de autenticación al eliminar: ${authError.message}` };
    }

    revalidatePath('/dashboard/teachers');
    return { success: true, message: 'Profesor eliminado con éxito.' };
}

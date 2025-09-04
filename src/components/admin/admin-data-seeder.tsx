
"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "../ui/button";
import { Database, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MOCK_USERS, MOCK_CLASSES } from "@/lib/mock-data";

// This is a client-side component to seed the database for demonstration purposes.
// It's not meant for production use.

export function AdminDataSeeder({ onDataSeeded }: { onDataSeeded: () => void }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSeedDatabase = async () => {
    setLoading(true);

    try {
      // We need to create the users in auth first, then in the public users table.
      // In a real app, this would be handled by a Supabase Edge Function with admin privileges.
      
      toast({
        title: "Paso 1: Creando Usuarios...",
        description: "Esto puede tardar un momento. No cierres esta ventana.",
      });

      // 1. Separate teachers and students
      const teachers = MOCK_USERS.filter(u => u.role === 'teacher');
      const students = MOCK_USERS.filter(u => u.role === 'student');

      // 2. Create Auth users and then profiles
      const createdTeachers = [];
      for (const teacher of teachers) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: teacher.email,
          password: 'password123',
        });
        if (authError && authError.message !== 'User already registered') { throw new Error(`Error creando auth user para ${teacher.email}: ${authError.message}`); }
        
        // Use existing user if already registered
        const userId = authData?.user?.id || (await supabase.auth.getUser()).data.user?.id;
        if (!userId) { throw new Error(`No se pudo obtener el ID para ${teacher.email}`); }

        const { data: profile, error: profileError } = await supabase
          .from('users')
          .upsert({ id: userId, name: teacher.name, email: teacher.email, role: 'teacher' })
          .select().single();
        if (profileError) { throw new Error(`Error creando perfil para ${teacher.name}: ${profileError.message}`); }
        createdTeachers.push(profile);
      }

      for (const student of students) {
         const { data: authData, error: authError } = await supabase.auth.signUp({
          email: student.email,
          password: 'password123',
        });
        if (authError && authError.message !== 'User already registered') { throw new Error(`Error creando auth user para ${student.email}: ${authError.message}`); }
      
         const userId = authData?.user?.id || (await supabase.auth.getUser()).data.user?.id;
         if (!userId) { continue; } // Silently fail for students if already exists

         await supabase.from('users').upsert({ id: userId, name: student.name, email: student.email, role: 'student' });
      }


      toast({
        title: "Paso 2: Creando Clases...",
        description: "Asignando clases a los nuevos profesores.",
      });
      
      // 3. Create classes, assigning them to the newly created teachers
      const classesToInsert = MOCK_CLASSES.map((cls, index) => {
        // Assign teachers to classes in a round-robin fashion
        const teacher = createdTeachers[index % createdTeachers.length];
        return {
            ...cls,
            id: undefined, // let supabase generate it
            teacherId: teacher.id,
            teacherName: teacher.name,
        }
      });
      
      const { error: classesError } = await supabase.from('classes').insert(classesToInsert);
      if(classesError) { throw new Error(`Error creando clases: ${classesError.message}`) }

      toast({
        title: "¡Éxito!",
        description: "La base de datos ha sido poblada con datos de prueba.",
        variant: "default",
      });

      onDataSeeded();

    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error al poblar la base de datos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Database className="mr-2" />
          Poblar Base de Datos
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Poblar la base de datos con datos de prueba?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción creará múltiples usuarios (profesores y alumnos) y clases en tu base de datos.
            Es útil para probar la aplicación, pero no se recomienda si ya tienes datos reales.
            Las contraseñas para todos los usuarios creados serán: <code className="font-bold">password123</code>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleSeedDatabase} disabled={loading}>
            {loading ? "Poblando..." : "Sí, poblar datos"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

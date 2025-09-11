import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import ClassesTable from '@/components/classes-table';
import { type DanceClass } from '@/lib/types';

// No se necesita checkRole aquí, obtenemos el usuario completo

export default async function ClassesPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Obtener la información del usuario para determinar el rol
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Si no hay usuario, redirigir al login. Esto es una guarda básica.
    redirect('/login');
  }

  // Obtener todas las clases, ya que todos los roles pueden verlas
  const { data: classes, error } = await supabase.from('classes').select('*');

  if (error) {
    return <p>Error loading classes: {error.message}</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clases Disponibles</h1>
        
        {/* CORRECCIÓN: Mostrar el botón "Añadir Clase" solo a los administradores */}
        {user.role === 'admin' && (
          <Button asChild>
            <Link href="/dashboard/classes/new"> 
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Clase
            </Link>
          </Button>
        )}
      </div>
      
      {/* CORRECCIÓN: Pasar el rol del usuario a la tabla de clases */}
      <ClassesTable classes={classes as DanceClass[]} userRole={user.role} />
    </div>
  );
}

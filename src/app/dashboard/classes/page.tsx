import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import ClassesTable from '@/components/classes-table';
import { type DanceClass } from '@/lib/types'; // Importación centralizada

async function checkRole(role: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  return user?.role === role;
}

export default async function ClassesPage() {
  // Protección de ruta robusta
  const isAdmin = await checkRole('admin');
  if (!isAdmin) {
    redirect('/dashboard');
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Se obtienen todas las clases. Supabase traerá el campo 'schedule' como un array.
  const { data: classes, error } = await supabase.from('classes').select('*');

  if (error) {
    return <p>Error loading classes: {error.message}</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Clases</h1>
        <Button asChild>
          <Link href="/dashboard/classes/new"> 
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Clase
          </Link>
        </Button>
      </div>
      <ClassesTable classes={classes as DanceClass[]} />
    </div>
  );
}

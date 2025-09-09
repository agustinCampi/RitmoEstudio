import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import StudentsTable from '@/components/students-table'; // Import the new component
import { User } from '@/lib/types';

// This will be a server component to fetch data
export default async function StudentsPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  // Secure the route to only be accessible by admins
  if (user?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch all users that are students
  const { data: students, error } = await supabase
    .from('users
  ') // There was a typo here
    .select('*')
    .eq('role', 'student');

  if (error) {
    // This is a placeholder for better error handling
    return <p>Error loading students: {error.message}</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Alumnos</h1>
        <Button asChild>
          <Link href="/dashboard/students/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Alumno
          </Link>
        </Button>
      </div>
      {/* Replace the pre block with the StudentsTable component */}
      <StudentsTable students={students as User[]} />
    </div>
  );
}

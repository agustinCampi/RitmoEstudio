
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';

import { DashboardHeader } from "@/components/dashboard-header";
import ClassManagement from "@/components/admin/class-management";
import ClassCatalog from "@/components/student/class-catalog";
import type { User } from '@/lib/types';
import { getClassesWithTeachers } from '@/app/actions/class-actions';

export default async function ClassesPage() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/');
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (!userProfile) {
    // This should ideally redirect to an error page
    return (
      <div className="w-full">
        <DashboardHeader title="Error" />
        <div className="px-4 sm:px-0"><p>Error: Could not determine user role.</p></div>
      </div>
    );
  }

  const { role } = userProfile;
  const isAdmin = role === 'admin';

  // Fetch all required data on the server using server actions
  const classesData = await getClassesWithTeachers();
  const { data: teachersData, error: teachersError } = isAdmin
    ? await supabase.from('users').select('id, name').eq('role', 'teacher')
    : { data: [], error: null };

  // Handle potential errors during data fetching
  if (isAdmin && teachersError) {
    return (
       <div className="w-full">
        <DashboardHeader title="Error" />
        <div className="px-4 sm:px-0"><p>Error cargando los datos de profesores. Por favor, intenta de nuevo.</p></div>
      </div>
    )
  }

  const roleSpecifics = {
    admin: {
      title: "Gestionar Clases",
      Component: ClassManagement,
      props: {
        initialClasses: classesData || [],
        initialTeachers: teachersData || [],
      },
    },
    teacher: {
      title: "Catálogo de Clases",
      Component: ClassCatalog,
      props: { 
        initialClasses: classesData || [],
      },
    },
    student: {
      title: "Catálogo de Clases",
      Component: ClassCatalog,
      props: { 
        initialClasses: classesData || [],
      },
    },
  };

  const { title, Component, props } = roleSpecifics[role as keyof typeof roleSpecifics];

  return (
    <div className="w-full">
      <DashboardHeader title={title} />
      <div className="px-4 sm:px-0">
        {/* The @ts-ignore is needed because TS can't infer the props for the dynamic Component */}
        {/* @ts-ignore */}
        <Component {...props} />
      </div>
    </div>
  );
}

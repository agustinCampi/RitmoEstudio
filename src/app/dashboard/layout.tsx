import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardSidebar from '@/components/dashboard-sidebar';
import DashboardHeader from '@/components/dashboard-header';
import { Toaster } from "@/components/ui/toaster";

export default async function DashboardLayout({
  children,
}: { 
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Obtener la sesión del usuario en el servidor
  const { data: { user }, error } = await supabase.auth.getUser();

  // Redirigir si no hay usuario o hay un error
  if (error || !user) {
    redirect('/'); // Redirige a la página de inicio
  }

  // Si el usuario existe, el layout se renderiza en el servidor
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Pasamos el rol del usuario como prop al sidebar */}
      <DashboardSidebar userRole={user.role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Pasamos el objeto de usuario completo al header por si lo necesita (ej: para el menú de usuario) */}
        <DashboardHeader user={user} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 dark:bg-gray-800 p-6">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}

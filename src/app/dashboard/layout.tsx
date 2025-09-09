import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AuthProvider from '@/components/auth-provider';
import DashboardSidebar from '@/components/dashboard-sidebar';
import DashboardHeader from '@/components/dashboard-header';
import { Toaster } from '@/components/ui/toaster';
import { type User } from '@/lib/types';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/');
  }

  const { data: userProfile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  if (error || !userProfile) {
    // Esto puede pasar si el trigger de la BD falló.
    // Es mejor cerrar sesión y redirigir.
    await supabase.auth.signOut();
    redirect('/');
  }

  // Combinamos la información de auth y de la tabla users
  const appUser: User = {
    ...session.user,
    ...userProfile,
  };


  return (
    <AuthProvider user={appUser}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <DashboardSidebar userRole={appUser.role} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader user={appUser} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 dark:bg-gray-800 p-6">
            {children}
          </main>
        </div>
        <Toaster />
      </div>
    </AuthProvider>
  );
}

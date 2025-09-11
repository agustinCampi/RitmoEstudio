import DashboardSidebar from '@/components/dashboard-sidebar';
import DashboardHeader from '@/components/dashboard-header';
import { Toaster } from '@/components/ui/toaster';

// El Layout del Dashboard es ahora un componente de servidor simple y sin estado.
// No realiza obtención de datos ni validación de sesión. Esta responsabilidad
// se delega a cada página o a un nivel superior si fuera necesario (middleware).

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // El AuthProvider ya no es necesario aquí, ya que el usuario no se obtiene
    // a nivel de layout. Los componentes de cliente que necesiten info del usuario
    // la obtendrán a través del hook useAuth, que la obtiene una vez en el cliente.
    <>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <DashboardSidebar />
        <div className="flex flex-col">
          <DashboardHeader />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </>
  );
}

'use client';

import UserMenu from './user-menu';
import { useAuth } from './auth-provider'; // Importar el nuevo hook
import { Skeleton } from './ui/skeleton'; // Usar un esqueleto para el estado de carga

export default function DashboardHeader() {
  const { user, isLoading } = useAuth(); // Usar el hook para obtener el usuario y el estado de carga

  return (
    <header className="flex items-center justify-end h-16 px-6 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
      <div className="flex items-center">
        {/* 1. Mientras carga, mostrar un esqueleto */}
        {isLoading && <Skeleton className="h-8 w-8 rounded-full" />}
        
        {/* 2. Cuando la carga ha terminado y hay un usuario, mostrar el menú */}
        {!isLoading && user && <UserMenu user={user} />}

        {/* 3. Si no hay usuario, no se muestra nada en esta área */}
      </div>
    </header>
  );
}

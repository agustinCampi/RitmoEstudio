
'use client';

import { useAuth } from '@/components/auth-provider';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Bienvenido, {user?.name}!</p>
      <p>Tu rol es: {user?.role}</p>
    </div>
  );
}

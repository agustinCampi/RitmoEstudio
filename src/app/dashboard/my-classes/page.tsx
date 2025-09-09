
"use client";

import { useAuth } from "@/hooks/use-auth";
import DashboardHeader from "@/components/dashboard-header";
import MyClasses from "@/components/student/my-classes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MyClassesPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role === 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);
  
  if (!user || user.role === 'admin') {
    return null;
  }

  return (
    <div className="w-full">
      <DashboardHeader title="Mis Clases Reservadas" />
      <div className="px-4 sm:px-0">
        <MyClasses />
      </div>
    </div>
  );
}

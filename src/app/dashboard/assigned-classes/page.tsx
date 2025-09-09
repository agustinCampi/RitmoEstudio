
"use client";

import { useAuth } from "@/hooks/use-auth";
import DashboardHeader from "@/components/dashboard-header";
import AssignedClasses from "@/components/teacher/assigned-classes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AssignedClassesPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'teacher') {
      router.push('/dashboard');
    }
  }, [user, router]);
  
  if (!user || user.role !== 'teacher') {
    return null;
  }

  return (
    <div className="w-full">
      <DashboardHeader title="Mis Clases Asignadas" />
      <div className="px-4 sm:px-0">
        <AssignedClasses />
      </div>
    </div>
  );
}

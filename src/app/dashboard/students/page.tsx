"use client";

import { useAuth } from "@/hooks/use-auth";
import { DashboardHeader } from "@/components/dashboard-header";
import StudentManagement from "@/components/admin/student-management";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function StudentsPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);
  
  if (!user || user.role !== 'admin') {
    return null; // or a loading/unauthorized component
  }

  return (
    <div className="w-full">
      <DashboardHeader title="Gestionar Alumnos" />
      <div className="px-4 sm:px-0">
        <StudentManagement />
      </div>
    </div>
  );
}

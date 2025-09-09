
"use client";

import { TeacherManagement } from "@/components/admin/teacher-management";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardHeader from "@/components/dashboard-header";


export default function TeachersPage() {
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
      <DashboardHeader title="Gestionar Profesores" />
      <TeacherManagement />
    </div>
  );
}


"use client";

import { useAuth } from "@/hooks/use-auth";
import { DashboardHeader } from "@/components/dashboard-header";
import AttendanceTracker from "@/components/teacher/attendance-tracker";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { MOCK_CLASSES, MOCK_STUDENTS_PROFILES } from "@/lib/mock-data";

export default function AttendancePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const classId = params ? (Array.isArray(params.classId) ? params.classId[0] : params.classId as string) : '';
  
  const classData = MOCK_CLASSES.find(c => c.id === classId);
  // In a real app, you would fetch students booked for this specific class.
  // Here, we just take a few mock students.
  const studentsInClass = MOCK_STUDENTS_PROFILES.slice(0, 5);

  useEffect(() => {
    if (user && user.role !== 'teacher') {
      router.push('/dashboard');
    }
  }, [user, router]);
  
  if (!user || user.role !== 'teacher') {
    return null;
  }
  
  if (!classData) {
    return (
        <div className="w-full">
            <DashboardHeader title="Error" />
            <div className="text-center py-12">
                <h3 className="font-headline text-2xl">Clase no encontrada</h3>
                <p className="text-muted-foreground mt-2">No se pudo encontrar la clase que estás buscando.</p>
            </div>
        </div>
    )
  }

  return (
    <div className="w-full">
      <DashboardHeader title={`Asistencia: ${classData.name}`} />
      <div className="px-4 sm:px-0">
        <AttendanceTracker classId={classId} students={studentsInClass} />
      </div>
    </div>
  );
}


"use client";

import { useAuth } from "@/hooks/use-auth";
import AttendanceTracker from "@/components/teacher/attendance-tracker";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Class, User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function AttendancePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const classId = params ? (Array.isArray(params.classId) ? params.classId[0] : params.classId as string) : '';
  const supabase = createClient();
  
  const [classData, setClassData] = useState<Class | null>(null);
  const [studentsInClass, setStudentsInClass] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassAndStudents = async () => {
        if (!classId) return;
        setLoading(true);

        // Fetch class details
        const { data: classInfo, error: classError } = await supabase
            .from('classes')
            .select('*')
            .eq('id', classId)
            .single();

        if (classError || !classInfo) {
            console.error("Error fetching class data:", classError);
            setLoading(false);
            return;
        }
        setClassData(classInfo as Class);

        // In a real app, you would fetch students from a 'bookings' table.
        // Here, we just fetch a few mock students for demonstration.
        const { data: studentProfiles, error: studentError } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'student')
            .limit(5);

        if (studentError) {
             console.error("Error fetching students:", studentError);
        } else {
            setStudentsInClass(studentProfiles as User[]);
        }

        setLoading(false);
    };

    fetchClassAndStudents();
  }, [classId]);


  useEffect(() => {
    if (user && user.role !== 'teacher') {
      router.push('/dashboard');
    }
  }, [user, router]);
  
  if (!user || user.role !== 'teacher') {
    return null;
  }
  
  if (loading) {
    return (
        <div className="w-full">
            
            <div className="px-4 sm:px-0 space-y-4">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-8 w-1/2" />
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-6 w-32" />
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-9 w-24" />
                                <Skeleton className="h-9 w-24" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
  }

  if (!classData) {
    return (
        <div className="w-full">
            
            <div className="text-center py-12">
                <h3 className="font-headline text-2xl">Clase no encontrada</h3>
                <p className="text-muted-foreground mt-2">No se pudo encontrar la clase que estás buscando.</p>
            </div>
        </div>
    )
  }

  return (
    <div className="w-full">
      
      <div className="px-4 sm:px-0">
        <AttendanceTracker classId={classId} students={studentsInClass} />
      </div>
    </div>
  );
}

    
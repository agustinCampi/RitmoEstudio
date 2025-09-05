
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard-header";
import { Calendar, Users, BookUser } from "lucide-react";
import { ClassCalendar } from "@/components/dashboard/class-calendar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Class, User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { getClassesWithTeachers } from "../actions/class-actions";

export default function DashboardPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    const [classesRes, studentsRes] = await Promise.all([
      getClassesWithTeachers(), // Use the consistent server action
      supabase.from('users').select('*').eq('role', 'student')
    ]);
    
    setClasses(classesRes);
    if (studentsRes.data) setStudents(studentsRes.data as User[]);

    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const AdminDashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">Aquí puedes gestionar todos los aspectos del estudio de baile.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/classes">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clases</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{classes.length}</div>}
              <p className="text-xs text-muted-foreground">Clases activas actualmente</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/students">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Alumnos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{students.length}</div>}
              <p className="text-xs text-muted-foreground">Alumnos registrados en el sistema</p>
            </CardContent>
          </Card>
        </Link>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Totales</CardTitle>
            <BookUser className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* Placeholder - This would require a bookings table */}
             {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">0</div>}
            <p className="text-xs text-muted-foreground">Reservas en el último mes</p>
          </CardContent>
        </Card>
      </div>
      <ClassCalendar classes={classes} loading={loading} />
    </div>
  );
  
  const TeacherDashboard = () => {
    const assignedClasses = classes.filter(c => c.teacher_id === user?.id);
    return (
     <div className="space-y-6">
        <p className="text-muted-foreground">Aquí puedes ver un resumen de tus clases y actividades.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/dashboard/assigned-classes">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clases Asignadas</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                 {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{assignedClasses.length}</div>}
                <p className="text-xs text-muted-foreground">Clases que impartes esta semana</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/assigned-classes">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Próxima Clase</CardTitle>
                 <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                 {loading ? <Skeleton className="h-6 w-3/4" /> : <div className="text-xl font-bold">{assignedClasses[0]?.name || 'Ninguna'}</div>}
                 {loading ? <Skeleton className="h-4 w-1/2 mt-1" /> : <p className="text-xs text-muted-foreground">{assignedClasses[0]?.schedule || 'No hay clases próximas'}</p>}
              </CardContent>
            </Card>
          </Link>
        </div>
        <ClassCalendar classes={assignedClasses} loading={loading} highlightedClasses={assignedClasses} />
      </div>
    );
  }

  const StudentDashboard = () => {
     // This would come from a 'bookings' table
     const myBookingsCount = 0; 
     const myClasses = classes.filter(c => c.booked_students && c.booked_students > 0); // Placeholder
     const nextClass = myClasses[0];

    return (
      <div className="space-y-6">
        <p className="text-muted-foreground">¡Prepárate para bailar! Aquí tienes un resumen de tu actividad.</p>
         <div className="grid gap-4 md:grid-cols-2">
          <Link href="/dashboard/my-classes">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mis Clases Reservadas</CardTitle>
                <BookUser className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                 {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{myBookingsCount}</div>}
                <p className="text-xs text-muted-foreground">Clases para esta semana</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/classes">
            <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tu Próxima Aventura</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-6 w-3/4" /> : <div className="text-xl font-bold">{nextClass?.name || 'Explora el catálogo'}</div>}
                  {loading ? <Skeleton className="h-4 w-1/2 mt-1" /> : <p className="text-xs text-muted-foreground">{nextClass ? `con ${nextClass.teacher_name}` : 'Reserva una clase'}</p>}
                </CardContent>
            </Card>
           </Link>
        </div>
        <ClassCalendar classes={myClasses} highlightedClasses={myClasses} loading={loading} />
      </div>
    );
  };


  return (
    <div className="w-full">
      <DashboardHeader title={`¡Hola, ${user?.name.split(' ')[0]}!`} />
      <div className="p-4 sm:p-0">
        {user?.role === 'admin' && <AdminDashboard />}
        {user?.role === 'teacher' && <TeacherDashboard />}
        {user?.role === 'student' && <StudentDashboard />}
      </div>
    </div>
  );
}

"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard-header";
import { MOCK_CLASSES, MOCK_STUDENTS_PROFILES } from "@/lib/mock-data";
import { Calendar, Users, BookUser } from "lucide-react";
import { ClassCalendar } from "@/components/dashboard/class-calendar";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();

  const AdminDashboard = () => (
    <div className="space-y-6">
      <p className="text-muted-foreground">Aquí puedes gestionar todos los aspectos del estudio de baile.</p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/classes">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clases</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{MOCK_CLASSES.length}</div>
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
              <div className="text-2xl font-bold">{MOCK_STUDENTS_PROFILES.length}</div>
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
            <div className="text-2xl font-bold">125</div>
            <p className="text-xs text-muted-foreground">Reservas en el último mes</p>
          </CardContent>
        </Card>
      </div>
      <ClassCalendar classes={MOCK_CLASSES} />
    </div>
  );
  
  const TeacherDashboard = () => {
    const assignedClasses = MOCK_CLASSES.filter(c => c.teacherId === user?.id);
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
                <div className="text-2xl font-bold">{assignedClasses.length}</div>
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
                <div className="text-xl font-bold">{assignedClasses[0]?.name || 'Ninguna'}</div>
                <p className="text-xs text-muted-foreground">{assignedClasses[0]?.schedule || 'No hay clases próximas'}</p>
              </CardContent>
            </Card>
          </Link>
        </div>
        <ClassCalendar classes={assignedClasses} />
      </div>
    );
  }

  const StudentDashboard = () => {
     const myBookings = 2; // Mock data
     const nextClass = MOCK_CLASSES.find(c => ["cls_salsa_1", "cls_hiphop_1"].includes(c.id)) || MOCK_CLASSES[0];
     const myClasses = MOCK_CLASSES.filter(c => ["cls_salsa_1", "cls_hiphop_1"].includes(c.id));

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
                <div className="text-2xl font-bold">{myBookings}</div>
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
                  <div className="text-xl font-bold">{nextClass.name}</div>
                  <p className="text-xs text-muted-foreground">con {nextClass.teacherName}</p>
                </CardContent>
            </Card>
           </Link>
        </div>
        <ClassCalendar classes={myClasses} />
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

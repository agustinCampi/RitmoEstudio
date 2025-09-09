
'use client'; // This must be a client component to use the hook

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, UserCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// A reusable component for displaying stats
function StatCard({ title, value, icon }: { title: string; value: number | null; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value === null ? '...' : value}</div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      if (user.role === 'admin') {
        const [
          { count: studentCount }, 
          { count: classCount }, 
          { count: teacherCount }
        ] = await Promise.all([
          supabase.from('users').select('id', { count: 'exact' }).eq('role', 'student'),
          supabase.from('classes').select('id', { count: 'exact' }),
          supabase.from('users').select('id', { count: 'exact' }).eq('role', 'teacher')
        ]);
        
        setStats(
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Alumnos Totales" value={studentCount} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
            <StatCard title="Clases Totales" value={classCount} icon={<BookOpen className="h-4 w-4 text-muted-foreground" />} />
            <StatCard title="Profesores Totales" value={teacherCount} icon={<UserCheck className="h-4 w-4 text-muted-foreground" />} />
          </div>
        );
      } else if (user.role === 'teacher') {
        const { count: classCount } = await supabase.from('classes').select('id', { count: 'exact' }).eq('teacher_id', user.id);
        setStats(
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Clases Asignadas" value={classCount} icon={<BookOpen className="h-4 w-4 text-muted-foreground" />} />
          </div>
        );
      } else if (user.role === 'student') {
        const { count: enrollmentCount } = await supabase.from('class_enrollments').select('class_id', { count: 'exact' }).eq('user_id', user.id);
        setStats(
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Clases Inscritas" value={enrollmentCount} icon={<BookOpen className="h-4 w-4 text-muted-foreground" />} />
          </div>
        );
      }
    };

    fetchStats();
  }, [user]);

  if (!user) return null; // Or a loading indicator

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Bienvenido, {user.name || 'usuario'}!</h1>
      <p className="text-lg text-muted-foreground mb-8">Aquí tienes un resumen de tu actividad en la academia.</p>
      {stats}
    </div>
  );
}

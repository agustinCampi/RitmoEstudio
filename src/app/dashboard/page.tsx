import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, UserCheck } from 'lucide-react';

// A reusable component for displaying stats
function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let stats = null;

  if (user.user_metadata.role === 'admin') {
    const { count: studentCount } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('user_metadata->>role', 'student');

    const { count: classCount } = await supabase
      .from('classes')
      .select('id', { count: 'exact' });

    const { count: teacherCount } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('user_metadata->>role', 'teacher');

    stats = (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Alumnos Totales" value={studentCount || 0} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Clases Totales" value={classCount || 0} icon={<BookOpen className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Profesores Totales" value={teacherCount || 0} icon={<UserCheck className="h-4 w-4 text-muted-foreground" />} />
      </div>
    );
  } else if (user.user_metadata.role === 'teacher') {
    const { count: classCount } = await supabase
      .from('classes')
      .select('id', { count: 'exact' })
      .eq('teacher_id', user.id);
      
    stats = (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Clases Asignadas" value={classCount || 0} icon={<BookOpen className="h-4 w-4 text-muted-foreground" />} />
      </div>
    );

  } else if (user.user_metadata.role === 'student') {
    const { count: enrollmentCount } = await supabase
      .from('class_enrollments')
      .select('class_id', { count: 'exact' })
      .eq('user_id', user.id);

    stats = (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Clases Inscritas" value={enrollmentCount || 0} icon={<BookOpen className="h-4 w-4 text-muted-foreground" />} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Bienvenido, {user.user_metadata.name || 'usuario'}!</h1>
      <p className="text-lg text-muted-foreground mb-8">Aquí tienes un resumen de tu actividad en la academia.</p>
      {stats}
    </div>
  );
}

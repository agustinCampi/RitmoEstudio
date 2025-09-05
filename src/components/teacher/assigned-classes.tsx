
"use client";

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import Image from "next/image";
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Class } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export default function AssignedClasses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignedClasses, setAssignedClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchAssignedClasses = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user.id);
      
      if (error) {
        toast({ title: "Error", description: "No se pudieron cargar tus clases.", variant: "destructive" });
      } else {
        setAssignedClasses(data as Class[]);
      }
      setLoading(false);
    };

    fetchAssignedClasses();
  }, [user, toast]);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-6 space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
            <CardFooter className="flex justify-between items-center p-6">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-10 w-1/2" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (assignedClasses.length === 0) {
    return (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <h3 className="font-headline text-2xl font-bold">No tienes clases asignadas</h3>
            <p className="text-muted-foreground mt-2">Contacta al administrador para que te asigne a nuevas clases.</p>
        </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {assignedClasses.map(cls => (
        <Card key={cls.id} className="flex flex-col bg-card hover:bg-muted/50 transition-colors">
           <CardHeader className="p-0">
             <div className="relative h-48 w-full">
                <Image
                    src={cls.image}
                    alt={cls.name}
                    fill
                    className="object-cover rounded-t-lg"
                    data-ai-hint="dance class"
                />
             </div>
             </CardHeader>
             <CardContent className="flex-grow p-6 space-y-2">
                <Badge variant="secondary" className="w-fit">{cls.category}</Badge>
                <CardTitle className="font-bold">{cls.name}</CardTitle>
                <CardDescription>{cls.schedule}</CardDescription>
                <p className="text-sm text-muted-foreground pt-2">{cls.description}</p>
            </CardContent>
          <CardFooter className="flex justify-between items-center p-6">
            <div>
              <span className="font-bold">{cls.booked_students} / {cls.max_students}</span>
              <span className="text-sm text-muted-foreground"> alumnos</span>
            </div>
            <Link href={`/dashboard/attendance/${cls.id}`} passHref>
              <Button>
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Tomar Asistencia
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

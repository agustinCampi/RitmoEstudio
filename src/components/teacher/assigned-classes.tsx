"use client";

import Link from 'next/link';
import { MOCK_CLASSES } from '@/lib/mock-data';
import { useAuth } from '@/hooks/use-auth';
import Image from "next/image";

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

export default function AssignedClasses() {
  const { user } = useAuth();
  const assignedClasses = MOCK_CLASSES.filter(c => c.teacherId === user?.id);

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
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-lg"
                    data-ai-hint={cls['data-ai-hint']}
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
              <span className="font-bold">{cls.bookedStudents} / {cls.maxStudents}</span>
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

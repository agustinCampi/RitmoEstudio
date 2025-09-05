
"use client";

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Class } from '@/lib/types';
import { getClassesWithTeachers } from '@/app/actions/class-actions';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function MyClasses() {
  const { toast } = useToast();
  const [myBookings, setMyBookings] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookedClasses = async () => {
      // In a real app, you would have a 'bookings' table and filter by user ID.
      // For now, we'll simulate this by fetching a few classes and pretending they are booked.
      setLoading(true);
      const allClassData = await getClassesWithTeachers();
      
      // Simulate booking the first 2 classes
      setMyBookings(allClassData.slice(0, 2) as Class[]);
      
      setLoading(false);
    };

    fetchBookedClasses();
  }, []);

  const handleCancelBooking = (classId: string, className: string) => {
    // This would delete a row from the 'bookings' table.
    console.log('Webhook a Make.com (Cancelar Reserva):', { classId, studentId: 'usr_student_1' });
    
    setMyBookings(myBookings.filter(b => b.id !== classId));
    toast({
      title: 'Reserva cancelada',
      description: `Has cancelado tu inscripción en la clase "${className}".`,
      variant: 'destructive',
    });
  };

  if (loading) {
      return <div className="text-center py-12">Cargando tus clases...</div>;
  }

  if (myBookings.length === 0) {
    return (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <h3 className="font-headline text-2xl font-bold">Aún no tienes clases</h3>
            <p className="text-muted-foreground mt-2">Explora nuestro catálogo y reserva tu primera clase para empezar a bailar.</p>
        </div>
    )
  }

  return (
    <div className="space-y-4">
      {myBookings.map(cls => (
        <Card key={cls.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="font-headline font-bold">{cls.name}</CardTitle>
                    {/* Always use teacher_name */}
                    <CardDescription>con {cls.teacher_name}</CardDescription>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">Cancelar Reserva</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Confirmas la cancelación?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Se cancelará tu plaza en la clase "{cls.name}". Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Volver</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleCancelBooking(cls.id, cls.name)} className="bg-red-600 hover:bg-red-700">Sí, cancelar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{cls.schedule}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

"use client";

import { useState } from 'react';
import { MOCK_CLASSES } from '@/lib/mock-data';
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

// Simulate a student having booked the first two classes
const bookedClassIds = [MOCK_CLASSES[0].id, MOCK_CLASSES[1].id];

export default function MyClasses() {
  const { toast } = useToast();
  const [myBookings, setMyBookings] = useState(MOCK_CLASSES.filter(c => bookedClassIds.includes(c.id)));

  const handleCancelBooking = (classId: string, className: string) => {
    console.log('Webhook a Make.com (Cancelar Reserva):', { classId, studentId: 'usr_student_1' });
    
    setMyBookings(myBookings.filter(b => b.id !== classId));
    toast({
      title: 'Reserva cancelada',
      description: `Has cancelado tu inscripción en la clase "${className}".`,
      variant: 'destructive',
    });
  };

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
                    <CardDescription>con {cls.teacherName}</CardDescription>
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

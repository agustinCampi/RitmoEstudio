"use client";

import { useState } from 'react';
import { MOCK_CLASSES } from '@/lib/mock-data';
import Image from 'next/image';
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
import { Book, Check } from 'lucide-react';

export default function ClassCatalog() {
  const { toast } = useToast();
  const [bookedClasses, setBookedClasses] = useState<string[]>([]);

  const handleBookClass = (classId: string, className: string) => {
    if (bookedClasses.includes(classId)) return;
    
    // Simulate API call to Make.com
    console.log('Webhook a Make.com (Reservar Clase):', { classId, studentId: 'usr_student_1' });
    
    setBookedClasses([...bookedClasses, classId]);
    toast({
      title: '¡Reserva confirmada!',
      description: `Te has inscrito en la clase "${className}".`,
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {MOCK_CLASSES.map(cls => {
        const isBooked = bookedClasses.includes(cls.id);
        const isFull = cls.bookedStudents >= cls.maxStudents;
        
        return (
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
                <CardDescription>con {cls.teacherName}</CardDescription>
                <p className="text-sm text-muted-foreground pt-2">{cls.schedule}</p>
                <p className="text-sm">{cls.description}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center p-6">
              <div>
                <span className="font-bold">{cls.bookedStudents} / {cls.maxStudents}</span>
                <span className="text-sm text-muted-foreground"> cupos</span>
              </div>
              <Button
                onClick={() => handleBookClass(cls.id, cls.name)}
                disabled={isBooked || isFull}
              >
                {isBooked ? (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Inscrito
                  </>
                ) : isFull ? (
                  'Clase Llena'
                ) : (
                  <>
                    <Book className="mr-2 h-4 w-4" /> Reservar
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

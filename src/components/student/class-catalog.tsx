
"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import type { Class, ClassLevel } from '@/lib/types';

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
import { Book, Check, Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const levels: (ClassLevel | 'Todos')[] = ["Todos", "principiante", "intermedio", "avanzado"];

interface ClassCatalogProps {
  initialClasses: Class[];
}

export default function ClassCatalog({ initialClasses }: ClassCatalogProps) {
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>(initialClasses);
  const [bookedClasses, setBookedClasses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<ClassLevel | 'Todos'>('Todos');

  const handleBookClass = (classId: string, className: string) => {
    if (bookedClasses.includes(classId)) return;
    
    // In a real app, this would write to a 'bookings' table.
    console.log('Simulating booking for class:', { classId, studentId: 'usr_student_1' });
    
    setBookedClasses([...bookedClasses, classId]);
    toast({
      title: '¡Reserva confirmada!',
      description: `Te has inscrito en la clase "${className}".`,
    });
  };
  
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      const matchesLevel = selectedLevel === 'Todos' || cls.level === selectedLevel;
      // Standardize on using `teacher_name` which comes from the server action join
      const teacherName = cls.teacher_name || '';
      const matchesSearch = searchTerm === '' || 
                            cls.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            cls.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            cls.level.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesLevel && matchesSearch;
    });
  }, [searchTerm, selectedLevel, classes]);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Buscar por clase, profesor, nivel..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
            <Select onValueChange={(value) => setSelectedLevel(value as ClassLevel | 'Todos')} defaultValue={selectedLevel}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Nivel" />
                </SelectTrigger>
                <SelectContent>
                    {levels.map(level => (
                        <SelectItem key={level} value={level} className="capitalize">{level}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </div>
      
      {filteredClasses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredClasses.map(cls => {
                const isBooked = bookedClasses.includes(cls.id);
                const isFull = (cls.booked_students || 0) >= cls.max_students;
                
                return (
                <Card key={cls.id} className="flex flex-col bg-card hover:bg-muted/50 transition-colors">
                    <CardHeader className="p-0">
                    <div className="relative h-48 w-full">
                        <Image
                        src={cls.image || '/placeholder.jpg'}
                        alt={cls.name}
                        fill
                        className="object-cover rounded-t-lg"
                        data-ai-hint="dance class"
                        />
                    </div>
                    </CardHeader>
                    <CardContent className="flex-grow p-6 space-y-2">
                        <div className="flex justify-end items-center">
                          <Badge variant="outline" className="capitalize">{cls.level}</Badge>
                        </div>
                        <CardTitle className="font-bold font-headline pt-2">{cls.name}</CardTitle>
                        {/* Always use teacher_name */}
                        <CardDescription>con {cls.teacher_name || 'Profesor no asignado'}</CardDescription>
                        <p className="text-sm pt-2">{cls.description}</p>
                    </CardContent>
                    <CardFooter className="flex justify-end items-center p-6">
                    <Button
                        onClick={() => handleBookClass(cls.id, cls.name)}
                        disabled={isBooked || isFull}
                        className="w-full sm:w-auto"
                    >
                        {isBooked ? (
                        <>
                            <Check /> Inscrito
                        </>
                        ) : isFull ? (
                        'Clase Llena'
                        ) : (
                        <>
                            <Book /> Reservar
                        </>
                        )}
                    </Button>
                    </CardFooter>
                </Card>
                );
            })}
        </div>
         ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <h3 className="font-headline text-2xl font-bold">No se encontraron clases</h3>
            <p className="text-muted-foreground mt-2">Prueba a cambiar los filtros o el término de búsqueda.</p>
        </div>
      )}
    </div>
  );
}

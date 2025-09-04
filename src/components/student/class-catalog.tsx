
"use client";

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import type { Class, ClassLevel } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

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
import { Skeleton } from '../ui/skeleton';

const levels: (ClassLevel | 'Todos')[] = ["Todos", "principiante", "intermedio", "avanzado"];

export default function ClassCatalog() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookedClasses, setBookedClasses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedLevel, setSelectedLevel] = useState<ClassLevel | 'Todos'>('Todos');
  const [categories, setCategories] = useState<string[]>(["Todas"]);
  const supabase = createClient();


  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('classes').select('*');
      if (error) {
        toast({ title: "Error", description: "No se pudieron cargar las clases.", variant: "destructive" });
        console.error(error);
      } else {
        setClasses(data as Class[]);
        const uniqueCategories = ["Todas", ...new Set(data.map((c: Class) => c.category))];
        setCategories(uniqueCategories);
      }
      setLoading(false);
    };
    fetchClasses();
  }, [toast]);


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
      const matchesCategory = selectedCategory === 'Todas' || cls.category === selectedCategory;
      const matchesLevel = selectedLevel === 'Todos' || cls.level === selectedLevel;
      const matchesSearch = searchTerm === '' || 
                            cls.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            cls.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            cls.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            cls.level.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesLevel && matchesSearch;
    });
  }, [searchTerm, selectedCategory, selectedLevel, classes]);
  
  if (loading) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-1/3" />
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-[180px]" />
                    <Skeleton className="h-10 w-[180px]" />
                </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <Skeleton className="h-48 w-full" />
                        <CardContent className="p-6 space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-10 w-full mt-4" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
  }

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
            <Select onValueChange={setSelectedCategory} defaultValue={selectedCategory}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                    {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
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
                const isFull = (cls.bookedStudents || 0) >= cls.maxStudents;
                
                return (
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
                        <div className="flex justify-between items-center">
                          <Badge variant="secondary" className="w-fit">{cls.category}</Badge>
                          <Badge variant="outline" className="capitalize">{cls.level}</Badge>
                        </div>
                        <CardTitle className="font-bold font-headline pt-2">{cls.name}</CardTitle>
                        <CardDescription>con {cls.teacherName}</CardDescription>
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

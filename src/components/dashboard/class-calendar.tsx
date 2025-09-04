
"use client";

import { useState, useMemo } from 'react';
import type { Class } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { es } from 'date-fns/locale';
import { format, getDay, addDays, startOfWeek } from 'date-fns';
import { Clock, User, AlignLeft, BarChart, Calendar as CalendarIcon, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const dayMapping: { [key: string]: number } = {
  'domingo': 0, 'lunes': 1, 'martes': 2, 'miércoles': 3, 'jueves': 4, 'viernes': 5, 'sábado': 6,
  'dom': 0, 'lun': 1, 'mar': 2, 'mié': 3, 'jue': 4, 'vie': 5, 'sáb': 6
};

const parseScheduleToDayIndex = (schedule: string): number[] => {
  const scheduleNormalized = schedule.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const dayPart = scheduleNormalized.split(',')[0];
  const dayWords = dayPart.split(/[\s,y/]+/);
  
  const indices: number[] = new Set<number>();
  dayWords.forEach(word => {
    const trimmedWord = word.trim();
    if (!trimmedWord) return;
    for (const [dayName, index] of Object.entries(dayMapping)) {
      if (dayName.startsWith(trimmedWord)) {
        indices.add(index);
      }
    }
  });
  return Array.from(indices);
};

export function ClassCalendar({ classes }: { classes: Class[] }) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const classesByDate = useMemo(() => {
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today, { locale: es });
    const classMap = new Map<string, Class[]>();

    classes.forEach(cls => {
        const dayIndices = parseScheduleToDayIndex(cls.schedule);
        const time = cls.schedule.split(',')[1]?.trim() || '';

        dayIndices.forEach(dayIndex => {
            let classDay = addDays(startOfCurrentWeek, dayIndex - getDay(startOfCurrentWeek, { locale: es }));
            if (getDay(classDay, { locale: es }) !== dayIndex) {
                 const diff = dayIndex - getDay(classDay, { locale: es });
                 classDay = addDays(classDay, diff > 3 ? diff - 7 : diff < -3 ? diff + 7 : diff)
            }
            
            const dateString = format(classDay, 'yyyy-MM-dd');
            if (!classMap.has(dateString)) {
                classMap.set(dateString, []);
            }
            // Asegurarse de no añadir duplicados si la lógica genera el mismo día dos veces
            if(!classMap.get(dateString)?.some(c => c.id === cls.id)) {
               classMap.get(dateString)?.push({ ...cls, schedule: time });
            }
        });
    });
    return classMap;
  }, [classes]);

  const selectedDayClasses = date ? classesByDate.get(format(date, 'yyyy-MM-dd')) || [] : [];
  
  const modifiers = {
    highlighted: Array.from(classesByDate.keys()).map(dateStr => {
        const d = new Date(dateStr);
        return new Date(d.valueOf() + d.getTimezoneOffset() * 60 * 1000);
    }),
  };

  const modifiersStyles = {
    highlighted: {
      border: "2px solid hsl(var(--primary))",
      borderRadius: 'var(--radius)',
    },
    today: {
        color: 'hsl(var(--primary-foreground))',
        backgroundColor: 'hsl(var(--primary))'
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Calendario de Clases</CardTitle>
        <CardDescription>Selecciona un día para ver las clases programadas.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex justify-center">
             <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border w-full p-0"
                locale={es}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
            />
        </div>
        <div className="md:col-span-1 space-y-4">
            <h3 className="font-headline text-xl font-bold capitalize">
                {date ? format(date, "EEEE, d 'de' MMMM", { locale: es }) : 'Selecciona una fecha'}
            </h3>
            <div className="space-y-3 h-72 overflow-y-auto pr-2">
                {selectedDayClasses.length > 0 ? (
                    selectedDayClasses.map(cls => (
                        <Dialog key={cls.id}>
                            <DialogTrigger asChild>
                                <div className="p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                                    <p className="font-bold text-sm">{cls.name}</p>
                                    <p className="text-xs text-muted-foreground">{cls.teacherName}</p>
                                    <div className="flex items-center gap-2 text-xs text-primary pt-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{cls.schedule}</span>
                                    </div>
                                </div>
                            </DialogTrigger>
                             <DialogContent>
                                <DialogHeader>
                                    <Badge variant="secondary" className="w-fit mb-2">{cls.category}</Badge>
                                    <DialogTitle className="font-headline text-2xl">{cls.name}</DialogTitle>
                                    <DialogDescription className="pt-2">{cls.description}</DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-4 py-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-primary" />
                                        <span>Profesor: <span className="font-medium">{cls.teacherName}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4 text-primary" />
                                        <span>Horario: <span className="font-medium">{cls.schedule}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <BarChart className="h-4 w-4 text-primary" />
                                        <span className="capitalize">Nivel: <span className="font-medium">{cls.level}</span></span>
                                    </div>
                                     <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-primary" />
                                        <span>Cupos: <span className="font-medium">{cls.bookedStudents} / {cls.maxStudents}</span></span>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        No hay clases para este día.
                    </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}


"use client";

import { useState, useMemo } from 'react';
import type { Class } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { es } from 'date-fns/locale';
import { format, getDay, addDays, startOfWeek, isSameMonth, isToday } from 'date-fns';
import { Badge } from '../ui/badge';
import { Clock } from 'lucide-react';

const dayMapping: { [key: string]: number } = {
  'domingo': 0, 'lunes': 1, 'martes': 2, 'miércoles': 3, 'jueves': 4, 'viernes': 5, 'sábado': 6
};

const parseScheduleToDayIndex = (schedule: string): number[] => {
  const scheduleNormalized = schedule.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const dayPart = scheduleNormalized.split(',')[0];
  const dayWords = dayPart.split(/[\s,y/]+/);
  
  const indices: number[] = [];
  dayWords.forEach(word => {
    for (const [dayName, index] of Object.entries(dayMapping)) {
      if (dayName.startsWith(word.trim())) {
        if (!indices.includes(index)) {
          indices.push(index);
        }
      }
    }
  });
  return indices;
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
            const classDay = addDays(startOfCurrentWeek, dayIndex - getDay(startOfCurrentWeek));
             // Ensure we are mapping to the correct week day, even across month changes.
            if (getDay(classDay) !== dayIndex) {
                 const diff = dayIndex - getDay(classDay);
                 classDay.setDate(classDay.getDate() + diff);
            }

            const dateString = format(classDay, 'yyyy-MM-dd');
            if (!classMap.has(dateString)) {
                classMap.set(dateString, []);
            }
            classMap.get(dateString)?.push({ ...cls, schedule: time });
        });
    });
    return classMap;
  }, [classes]);

  const selectedDayClasses = date ? classesByDate.get(format(date, 'yyyy-MM-dd')) || [] : [];
  
  const modifiers = {
    highlighted: Array.from(classesByDate.keys()).map(dateStr => new Date(dateStr)),
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
            <h3 className="font-headline text-xl font-bold">
                {date ? format(date, "EEEE, d 'de' MMMM", { locale: es }) : 'Selecciona una fecha'}
            </h3>
            <div className="space-y-3 h-72 overflow-y-auto pr-2">
                {selectedDayClasses.length > 0 ? (
                    selectedDayClasses.map(cls => (
                        <div key={cls.id} className="p-3 bg-muted/50 rounded-lg">
                            <p className="font-bold text-sm">{cls.name}</p>
                            <p className="text-xs text-muted-foreground">{cls.teacherName}</p>
                            <div className="flex items-center gap-2 text-xs text-primary pt-1">
                                <Clock className="h-3 w-3" />
                                <span>{cls.schedule}</span>
                            </div>
                        </div>
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

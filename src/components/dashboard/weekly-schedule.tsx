
import { useMemo } from 'react';
import type { Class } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, BarChart, BookOpen } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '../ui/button';

interface WeeklyScheduleProps {
  classes: Class[];
}

const daysOfWeek = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

// Improved mapping to handle variations like "Miércoles" and "Sábados"
const dayMapping: { [key: string]: string } = {
  'lunes': 'lunes',
  'martes': 'martes',
  'miércoles': 'miércoles',
  'miercoles': 'miércoles',
  'jueves': 'jueves',
  'viernes': 'viernes',
  'sábado': 'sábado',
  'sabado': 'sábado',
  'domingo': 'domingo',
};

const parseSchedule = (schedule: string) => {
  const scheduleNormalized = schedule.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const parts = scheduleNormalized.split(',');
  const dayPart = parts[0];
  const timePart = schedule.split(',')[1]?.trim() || '';

  const days: string[] = [];
  
  const dayKeywords = Object.keys(dayMapping);

  // Check for multiple days in the same string e.g. "Lunes y Miércoles"
  const dayWords = dayPart.split(/[\s,y/]+/);

  dayWords.forEach(word => {
    const matchedDay = dayKeywords.find(keyword => keyword.startsWith(word.trim()));
    if (matchedDay && !days.includes(dayMapping[matchedDay])) {
      days.push(dayMapping[matchedDay]);
    }
  });

  // If no days were found with the split, check the whole string
  if (days.length === 0) {
    dayKeywords.forEach(keyword => {
      if (dayPart.includes(keyword)) {
        const day = dayMapping[keyword];
        if (!days.includes(day)) {
          days.push(day);
        }
      }
    });
  }
  
  return { days, time: timePart };
};

export function WeeklySchedule({ classes }: WeeklyScheduleProps) {
  const scheduleByDay = useMemo(() => {
    const schedule: { [key: string]: Class[] } = {};
    daysOfWeek.forEach(day => schedule[day] = []);

    classes.forEach(cls => {
      const { days, time } = parseSchedule(cls.schedule);
      days.forEach(day => {
        if (schedule[day]) {
          schedule[day].push({ ...cls, schedule: time || cls.schedule.split(',')[1]?.trim() || '' });
        }
      });
    });
    
    for (const day in schedule) {
        schedule[day].sort((a, b) => {
            const timeA = a.schedule.split(' ')[0];
            const timeB = b.schedule.split(' ')[0];
            return timeA.localeCompare(timeB);
        });
    }

    return schedule;
  }, [classes]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Horario de la Semana</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {daysOfWeek.map(day => (
            <div key={day} className="flex flex-col gap-3">
              <h3 className="text-center font-bold capitalize text-md text-muted-foreground">{day.slice(0,3)}</h3>
              <div className="bg-muted/30 rounded-lg p-2 space-y-2 min-h-48">
                {scheduleByDay[day] && scheduleByDay[day].length > 0 ? (
                  scheduleByDay[day].map(cls => (
                    <Dialog key={cls.id}>
                      <DialogTrigger asChild>
                        <div className="bg-card cursor-pointer hover:bg-accent hover:text-accent-foreground transition-all rounded-lg px-2 py-1.5 w-full text-left">
                          <p className="font-bold text-xs truncate">{cls.name}</p>
                          <div className="flex items-center gap-1.5 text-xs text-primary/80 pt-1">
                            <Clock className="w-3 h-3" />
                            <span>{cls.schedule}</span>
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="font-headline text-2xl">{cls.name}</DialogTitle>
                           <Badge variant="secondary" className="w-fit capitalize">{cls.category}</Badge>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <p className="text-muted-foreground">{cls.description}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-primary"/>
                                <span>Profesor: <span className="font-medium">{cls.teacherName}</span></span>
                            </div>
                             <div className="flex items-center gap-2">
                                <BarChart className="w-4 h-4 text-primary"/>
                                <span className="capitalize">Nivel: <span className="font-medium">{cls.level}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary"/>
                                <span>Duración: <span className="font-medium">{cls.duration} min</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-primary"/>
                                <span>Horario: <span className="font-medium">{cls.schedule || "N/A"}</span></span>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-xs text-muted-foreground/50">Sin clases</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

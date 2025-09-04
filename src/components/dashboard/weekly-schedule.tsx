
import { useMemo } from 'react';
import type { Class } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface WeeklyScheduleProps {
  classes: Class[];
}

const daysOfWeek = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const dayMapping: { [key: string]: string } = {
  'Lunes': 'lunes',
  'Martes': 'martes',
  'Miércoles': 'miércoles',
  'Jueves': 'jueves',
  'Viernes': 'viernes',
  'Sábados': 'sábado',
  'Domingos': 'domingo',
};

const parseSchedule = (schedule: string) => {
  const dayPart = schedule.split(',')[0].toLowerCase();
  const timePart = schedule.split(',')[1]?.trim() || '';

  const days: string[] = [];
  for (const day in dayMapping) {
    if (dayPart.includes(day.toLowerCase().slice(0, 4))) {
      days.push(dayMapping[day]);
    }
  }
  
  if (days.length === 0) {
     const matchedDay = daysOfWeek.find(d => dayPart.includes(d.slice(0,4)))
     if(matchedDay) days.push(matchedDay)
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
          schedule[day].push({ ...cls, schedule: time });
        }
      });
    });
    
    // Sort classes within each day by time
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
          {daysOfWeek.map(day => (
            <div key={day} className="flex flex-col gap-4">
              <h3 className="text-center font-bold capitalize text-lg text-muted-foreground">{day}</h3>
              <div className="bg-muted/30 rounded-lg p-2 space-y-3 min-h-48">
                {scheduleByDay[day] && scheduleByDay[day].length > 0 ? (
                  scheduleByDay[day].map(cls => (
                    <Card key={cls.id} className="bg-card/80 hover:bg-card transition-shadow shadow-md hover:shadow-lg">
                      <CardContent className="p-3">
                        <p className="font-bold text-sm truncate">{cls.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{cls.level}</p>
                        <div className="flex items-center gap-1.5 text-xs text-primary pt-2">
                           <Clock className="w-3 h-3" /> 
                           <span>{cls.schedule}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground/50">Sin clases</p>
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

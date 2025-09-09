
'use client';

import { useAuth } from '@/hooks/use-auth';
import ClassCalendar from '@/components/dashboard/class-calendar';
import { type EventSourceInput } from '@fullcalendar/core';
import { type DanceClass } from '@/lib/types';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

// Mapa para convertir nombres de días en español a números (0=Domingo, 1=Lunes, etc.)
const dayOfWeekMap: { [key: string]: number } = {
  'domingo': 0,
  'lunes': 1,
  'martes': 2,
  'miércoles': 3,
  'jueves': 4,
  'viernes': 5,
  'sábado': 6,
};

function parseSchedule(scheduleString: string): { day: number; startTime: string; endTime: string } | null {
  const parts = scheduleString.toLowerCase().match(/^(\w+)\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/);
  if (!parts || parts.length !== 4) {
    // Try to parse time only
    const timeParts = scheduleString.match(/^(\d{2}:\d{2})$/);
    if(timeParts && timeParts.length === 2){
        // We don't know the day, so we can't create a recurring event.
        // This schedule format is not fully supported for the calendar view.
        return null;
    }
    return null; // Formato incorrecto
  }

  const dayName = parts[1];
  const dayNumber = dayOfWeekMap[dayName];

  if (dayNumber === undefined) {
    return null; // Nombre del día no válido
  }

  return {
    day: dayNumber,
    startTime: parts[2],
    endTime: parts[3],
  };
}

function formatClassesToEvents(classes: DanceClass[]): EventSourceInput {
  const events: any[] = [];
  classes.forEach(danceClass => {
    if (danceClass.schedule) {
      danceClass.schedule.forEach(scheduleItem => {
        const parsed = parseSchedule(scheduleItem);
        if (parsed) {
          events.push({
            title: danceClass.name,
            startTime: parsed.startTime,
            endTime: parsed.endTime,
            daysOfWeek: [parsed.day],
            extendedProps: {
              classId: danceClass.id,
            }
          });
        }
      });
    }
  });
  return events;
}

export default function TeacherSchedulePage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventSourceInput>([]);
  const supabase = createClient();

  useEffect(() => {
    if (user?.role !== 'teacher') return;

    const fetchTeacherClasses = async () => {
      const { data: classes, error } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user.id);

      if (error) {
        console.error('Error loading schedule:', error);
      } else if (classes) {
        const calendarEvents = formatClassesToEvents(classes as DanceClass[]);
        setEvents(calendarEvents);
      }
    };

    fetchTeacherClasses();
  }, [user]);

  if (user?.role !== 'teacher') {
    return <p>No tienes permiso para ver esta página.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mi Horario de Clases</h1>
      <ClassCalendar events={events} />
    </div>
  );
}

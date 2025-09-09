import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ClassCalendar from '@/components/dashboard/class-calendar';
import { type EventSourceInput } from '@fullcalendar/core';
import { type DanceClass } from '@/lib/types';
import { checkRole } from '@/lib/utils';

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

/**
 * Parsea una cadena de horario como "Lunes 10:00-11:00" y devuelve el día y las horas.
 * @param scheduleString - La cadena de texto del horario.
 * @returns Un objeto con el día de la semana (número) y las horas de inicio/fin, o null si el formato es incorrecto.
 */
function parseSchedule(scheduleString: string): { day: number; startTime: string; endTime: string } | null {
  const parts = scheduleString.toLowerCase().match(/^(\w+)\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/);
  if (!parts || parts.length !== 4) {
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

/**
 * Convierte un array de objetos DanceClass en un formato compatible con FullCalendar.
 * Itera a través de los múltiples horarios de cada clase.
 */
function formatClassesToEvents(classes: DanceClass[]): EventSourceInput {
  const events: any[] = [];
  classes.forEach(danceClass => {
    danceClass.schedule.forEach(scheduleItem => {
      const parsed = parseSchedule(scheduleItem);
      if (parsed) {
        events.push({
          title: danceClass.name,
          startTime: parsed.startTime,
          endTime: parsed.endTime,
          daysOfWeek: [parsed.day],
          // Extended props pueden ser útiles para pasar más datos, como el ID de la clase
          extendedProps: {
            classId: danceClass.id,
          }
        });
      }
    });
  });
  return events;
}

export default async function TeacherSchedulePage() {
  const isTeacher = await checkRole('teacher');
  if (!isTeacher) {
    redirect('/dashboard');
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  // Obtener solo las clases asignadas al profesor logueado
  const { data: classes, error } = await supabase
    .from('classes')
    .select('*')
    .eq('teacher_id', user!.id);

  if (error) {
    return <p>Error cargando el horario: {error.message}</p>;
  }

  const calendarEvents = formatClassesToEvents(classes as DanceClass[]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mi Horario de Clases</h1>
      {/* Asumimos que ClassCalendar puede manejar los eventos en este formato */}
      <ClassCalendar events={calendarEvents} />
    </div>
  );
}

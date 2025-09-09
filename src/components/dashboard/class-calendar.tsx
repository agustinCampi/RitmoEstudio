
'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { type EventSourceInput } from '@fullcalendar/core';

type ClassCalendarProps = {
  events: EventSourceInput;
};

// This is now a simple presentation component.
export default function ClassCalendar({ events }: ClassCalendarProps) {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        height="auto"
        locale="es"
        slotMinTime="08:00:00"
        slotMaxTime="22:00:00"
      />
    </div>
  );
}

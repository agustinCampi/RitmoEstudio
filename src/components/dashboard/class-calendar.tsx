'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { type EventSourceInput } from '@fullcalendar/core';

type ClassCalendarProps = {
  events: EventSourceInput;
};

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
        height="auto" // Adjust height to fit container
        locale="es" // Set locale to Spanish
        slotMinTime="08:00:00" // Earliest time slot
        slotMaxTime="22:00:00" // Latest time slot
      />
    </div>
  );
}

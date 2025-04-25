import React from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const TeacherCalendar = ({ schedule }) => {
  const formattedEvents = schedule.map((item, index) => ({
    id: index,
    title: item.subject || 'Занятие',
    start: item.start,
    end: item.end,
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  }));

  return (
    <FullCalendar
      plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      }}
      events={formattedEvents}
      height="auto"
    />
  );
};

export default TeacherCalendar;

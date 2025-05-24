export const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'];
export const timeSlots = ['08:00', '10:00', '12:00', '14:00', '16:00'];

export const generateEmptySchedule = () => {
  const schedule = {};
  daysOfWeek.forEach((day) => {
    schedule[day] = {};
    timeSlots.forEach((time) => {
      schedule[day][time] = '';
    });
  });
  return schedule;
};

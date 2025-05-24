import { generateSchedule, getTeachersForSubject } from '../scheduleUtils';

describe('generateSchedule', () => {
  const timeSlots = [
    {
      type: 'lesson', number: 1, startTime: '08:00', endTime: '08:45',
    },
    {
      type: 'lesson', number: 2, startTime: '09:00', endTime: '09:45',
    },
    {
      type: 'break', number: 3, startTime: '09:45', endTime: '10:00',
    },
    {
      type: 'lesson', number: 4, startTime: '10:00', endTime: '10:45',
    },
  ];

  it('should return a valid schedule array', () => {
    const result = generateSchedule(timeSlots, 2);
    expect(result.length).toBe(2);
    expect(result[0].number).toBe(1);
  });

  it('should return null if not enough lessons', () => {
    const result = generateSchedule(timeSlots, 5);
    expect(result).toBe(null);
  });
});

describe('getTeachersForSubject', () => {
  const assignedSubjects = [
    { subjectId: 'sub1', teachers: [{ _id: 't1', name: 'Teacher A' }] },
    { subjectId: 'sub2', teachers: [{ _id: 't2', name: 'Teacher B' }] },
  ];

  it('should return teacher list for subject', () => {
    const result = getTeachersForSubject(assignedSubjects, 'sub1');
    expect(result[0].name).toBe('Teacher A');
  });

  it('should return empty array for unknown subject', () => {
    const result = getTeachersForSubject(assignedSubjects, 'subX');
    expect(result).toEqual([]);
  });
});

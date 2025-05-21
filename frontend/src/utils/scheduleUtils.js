export const generateSchedule = (timeSlots, lessonCount) => {
  const lessonsOnly = timeSlots
    .filter(slot => slot.type === 'lesson')
    .sort((a, b) => a.number - b.number)
    .slice(0, lessonCount);

  if (lessonsOnly.length < lessonCount) {
    return null;
  }

  return lessonsOnly.map((slot, index) => ({
    number: index + 1,
    subjectId: '',
    teacherId: '',
    startTime: slot.startTime,
    endTime: slot.endTime
  }));
};

export const getTeachersForSubject = (assignedSubjects, subjectId) => {
  const found = assignedSubjects.find(a => a.subjectId === subjectId);
  return found?.teachers || [];
};

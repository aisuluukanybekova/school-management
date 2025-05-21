import React, { useState, useEffect } from 'react';
import {
  Box, FormControl, InputLabel, Select, MenuItem,
  Button, Snackbar, Typography
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { useSelector } from 'react-redux';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5001';

const TeacherAttendanceJournal = () => {
  const teacher = useSelector((state) => state.user.currentUser);
  const schoolId = teacher?.school?._id || teacher?.schoolId;

  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [terms, setTerms] = useState([]);
  const [lessonDates, setLessonDates] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('1');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [assignRes, termRes] = await Promise.all([
          axios.get(`/api/teacherSubjectClass/by-teacher/${teacher._id}`),
          axios.get(`/api/terms/${schoolId}`)
        ]);
        setAssignments(assignRes.data);
        setTerms(termRes.data);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
      }
    };
    if (teacher && schoolId) fetchInitial();
  }, [teacher, schoolId]);

  useEffect(() => {
    if (selectedClass && selectedSubject && selectedTerm && terms.length > 0) {
      fetchStudents();
      fetchAttendance();
      fetchLessonDates();
    }
  }, [selectedClass, selectedSubject, selectedTerm, terms]);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`/api/students/class/${selectedClass}`);
      setStudents(res.data);
    } catch (err) {
      console.error('Ошибка при загрузке студентов:', err);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`/api/attendance`, {
        params: { classId: selectedClass, subjectId: selectedSubject, term: selectedTerm }
      });

      const grouped = {};
      for (const record of res.data.records || []) {
        if (!grouped[record.studentId]) grouped[record.studentId] = [];
        grouped[record.studentId].push({ date: record.date, status: record.status });
      }

      const formatted = Object.entries(grouped).map(([studentId, values]) => ({
        studentId,
        values
      }));

      setAttendance(formatted);
    } catch (err) {
      console.error('Ошибка при загрузке посещаемости:', err);
      setAttendance([]);
    }
  };

  const fetchLessonDates = async () => {
    try {
      const { data: scheduleRes } = await axios.get(
        `/api/schedule/by-teacher-class-subject/${teacher._id}/${selectedClass}/${selectedSubject}`
      );

      const term = terms.find(t => t.termNumber === Number(selectedTerm));
      if (!term) return;

      const start = new Date(term.startDate);
      const end = new Date(term.endDate);

      const enDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const scheduleDays = [...new Set(scheduleRes.schedules.map(s => s.day))];

      const dates = [];

      let current = new Date(start);
      while (current <= end) {
        const currentDayName = enDays[current.getDay()];
        if (scheduleDays.includes(currentDayName)) {
          dates.push(current.toISOString().split('T')[0]);
        }
        current.setDate(current.getDate() + 1);
      }

      setLessonDates(dates);
    } catch (err) {
      console.error('Ошибка загрузки дат уроков:', err);
    }
  };

  const toggleAttendance = (studentId, date) => {
    setAttendance(prev => {
      const updated = [...prev];
      let entry = updated.find(a => a.studentId === studentId);
      if (!entry) {
        entry = { studentId, values: [] };
        updated.push(entry);
      }

      const isAbsent = entry.values.some(v => v.date === date && v.status === 'Отсутствовал');
      entry.values = entry.values.filter(v => v.date !== date);

      if (!isAbsent) {
        entry.values.push({ date, status: 'Отсутствовал' });
      }

      return updated;
    });
  };

  const isAbsent = (studentId, date) => {
    const student = attendance.find(a => a.studentId === studentId);
    return student?.values?.some(v => v.date === date && v.status === 'Отсутствовал') || false;
  };

  const saveAttendance = async () => {
    try {
      await axios.post(`/api/attendance`, {
        classId: selectedClass,
        subjectId: selectedSubject,
        teacherId: teacher._id,
        term: Number(selectedTerm),
        records: attendance
      });

      setSnackbar({
        open: true,
        message: 'Посещаемость успешно сохранена',
        severity: 'success'
      });
    } catch (err) {
      console.error('Ошибка сохранения посещаемости:', err);
      setSnackbar({
        open: true,
        message: 'Ошибка при сохранении. Проверьте соединение и данные.',
        severity: 'error'
      });
    }
  };

  const uniqueClasses = [...new Map(assignments.map(a => [a.sclassId, a])).values()];
  const uniqueSubjects = [...new Map(assignments.map(a => [a.subjectId, a])).values()];

  return (
    <Box p={3}>
      <Typography variant="h5">📋 Журнал посещаемости (Учитель)</Typography>

      <Box display="flex" gap={2} mt={2} mb={2}>
        <FormControl fullWidth>
          <InputLabel>Класс</InputLabel>
          <Select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            {uniqueClasses.map((a) => (
              <MenuItem key={a.sclassId} value={a.sclassId}>{a.sclassName}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Предмет</InputLabel>
          <Select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
            {uniqueSubjects.map((a) => (
              <MenuItem key={a.subjectId} value={a.subjectId}>{a.subjectName}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Четверть</InputLabel>
          <Select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)}>
            {[1, 2, 3, 4].map(n => (
              <MenuItem key={n} value={String(n)}>Четверть {n}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ overflowX: 'auto', border: '1px solid #ccc', borderRadius: 2 }}>
        {/* Заголовки */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `40px 180px repeat(${lessonDates.length}, 60px) 90px`,
            backgroundColor: '#333',
            color: '#fff',
            fontWeight: 600,
            textAlign: 'center',
            fontSize: '0.875rem',
            position: 'sticky',
            top: 0,
            zIndex: 3
          }}
        >
          <Box sx={{ border: '1px solid #444', p: 1, position: 'sticky', left: 0, zIndex: 4 }}>№</Box>
          <Box sx={{ border: '1px solid #444', p: 1, position: 'sticky', left: 40, zIndex: 4 }}>Ученик</Box>
         {lessonDates.map(date => (
  <Box
    key={date}
    sx={{
      border: '1px solid #444',
      p: 1,
      fontSize: '0.75rem',
      whiteSpace: 'nowrap',
      textAlign: 'center',
      backgroundColor: '#333',
      color: '#fff',
      minWidth: '60px',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    {new Date(date).toLocaleDateString('ru-RU').slice(0, 5)}
  </Box>
))}
          <Box
            sx={{
              border: '1px solid #444',
              p: 1,
              fontWeight: 600,
              backgroundColor: '#333',
              color: '#fff',
              position: 'sticky',
              right: 0,
              zIndex: 3,
              minWidth: '90px'
            }}
          >
            Пропущено
          </Box>
        </Box>

        {/* Строки */}
        {students.map((student, idx) => {
          const count = lessonDates.reduce(
            (acc, date) => acc + (isAbsent(student._id, date) ? 1 : 0), 0
          );

          return (
            <Box
              key={student._id}
              sx={{
                display: 'grid',
                gridTemplateColumns: `40px 180px repeat(${lessonDates.length}, 60px) 90px`,
                backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9',
                fontSize: '0.875rem'
              }}
            >
              <Box sx={{ border: '1px solid #ccc', p: 1, textAlign: 'center', position: 'sticky', left: 0, zIndex: 2 }}>{idx + 1}</Box>
              <Box sx={{ border: '1px solid #ccc', p: 1, fontWeight: 500, position: 'sticky', left: 40, zIndex: 2 }}>{student.name}</Box>

              {lessonDates.map(date => {
                const absent = isAbsent(student._id, date);
                return (
                  <Box
                    key={date}
                    title={absent ? 'Отсутствовал' : 'Присутствовал'}
                    onClick={() => toggleAttendance(student._id, date)}
                    sx={{
                      border: '1px solid #ccc',
                      p: 1,
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: absent ? '#fdd' : '#f1f1f1',
                      '&:hover': {
                        backgroundColor: absent ? '#fbb' : '#e0e0e0'
                      },
                      transition: 'background-color 0.2s ease',
                      userSelect: 'none',
                      fontWeight: absent ? 600 : 400,
                      color: absent ? '#b00020' : '#333'
                    }}
                  >
                    {absent ? '—' : ''}
                  </Box>
                );
              })}

              <Box
                sx={{
                  border: '1px solid #ccc',
                  p: 1,
                  textAlign: 'center',
                  fontWeight: 600,
                  backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9',
                  position: 'sticky',
                  right: 0,
                  zIndex: 2,
                  minWidth: '90px'
                }}
              >
                {count}
              </Box>
            </Box>
          );
        })}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>

      <Button variant="contained" sx={{ mt: 2 }} onClick={saveAttendance}>Сохранить</Button>
    </Box>
  );
};

export default TeacherAttendanceJournal;

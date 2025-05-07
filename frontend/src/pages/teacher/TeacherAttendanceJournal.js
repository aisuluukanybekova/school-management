import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Select, MenuItem, FormControl, InputLabel,
  Button, Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

axios.defaults.baseURL = 'http://localhost:5001';

const TeacherAttendanceJournal = () => {
  const teacher = useSelector((state) => state.user.currentUser);

  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [terms, setTerms] = useState([]);
  const [lessonDates, setLessonDates] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('1');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const schoolId = teacher?.school?._id || teacher?.schoolId;

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
        console.error('Ошибка при загрузке начальных данных:', err);
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

      // Приводим к нужной структуре: [{ studentId, values: [{ date, status }] }]
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

      if (!terms || terms.length === 0) return;
      const term = terms.find(t => t.termNumber === Number(selectedTerm));
      if (!term) return;

      const validLessons = scheduleRes.schedules
        .filter(l => l.type === 'lesson')
        .map(l => {
          const base = new Date(term.startDate);
          const endDate = new Date(term.endDate);
          const dayOffset = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'].indexOf(l.day);
          const lessons = [];
          while (base <= endDate) {
            if (base.getDay() === dayOffset) lessons.push(new Date(base));
            base.setDate(base.getDate() + 1);
          }
          return lessons;
        })
        .flat();

      const sorted = [...new Set(validLessons.map(d => d.toISOString().split('T')[0]))].sort();
      setLessonDates(sorted);
    } catch (err) {
      console.error('Ошибка загрузки уроков:', err);
    }
  };

  const handleChange = (studentId, date, value) => {
    const updated = [...attendance];
    let entry = updated.find(a => a.studentId === studentId);
    if (!entry) {
      entry = { studentId, values: [] };
      updated.push(entry);
    }

    // Удалим старую запись на эту дату
    entry.values = entry.values.filter(v => v.date !== date);

    if (value === 'От') {
      entry.values.push({ date, status: 'Отсутствовал' });
    }

    setAttendance(updated);
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

  return (
    <Box p={3}>
      <Typography variant="h5">Журнал посещаемости (Учитель)</Typography>

      <Box display="flex" gap={2} mt={2} mb={2}>
        <FormControl fullWidth>
          <InputLabel>Класс</InputLabel>
          <Select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            {assignments.map((a, i) => (
              <MenuItem key={i} value={a.sclassId}>{a.sclassName}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Предмет</InputLabel>
          <Select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
            {assignments.map((a, i) => (
              <MenuItem key={i} value={a.subjectId}>{a.subjectName}</MenuItem>
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

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Ученик</TableCell>
            {lessonDates.map(date => (
              <TableCell key={date}>{new Date(date).toLocaleDateString()}</TableCell>
            ))}
            <TableCell><strong>Пропущено</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map(student => {
            const count = lessonDates.reduce((acc, date) => acc + (isAbsent(student._id, date) ? 1 : 0), 0);
            return (
              <TableRow key={student._id}>
                <TableCell>{student.name}</TableCell>
                {lessonDates.map(date => (
                  <TableCell key={date}>
                    <Select
                      size="small"
                      displayEmpty
                      value={isAbsent(student._id, date) ? 'От' : ''}
                      onChange={e => handleChange(student._id, date, e.target.value)}
                    >
                      <MenuItem value=""> </MenuItem>
                      <MenuItem value="От">&mdash;</MenuItem>
                    </Select>
                  </TableCell>
                ))}
                <TableCell>{count}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

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

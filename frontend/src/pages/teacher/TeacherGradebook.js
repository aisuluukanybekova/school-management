import React, { useState, useEffect } from 'react';
import {
  Box, Typography, FormControl, InputLabel, Select, MenuItem,
  Button, TextField, Table, TableBody, TableCell, TableHead,
  TableRow, TableContainer, Paper
} from '@mui/material';
import { useSelector } from 'react-redux';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5001';

const TeacherGradebookJournal = () => {
  const teacher = useSelector((state) => state.user.currentUser);
  const schoolId = teacher?.school?._id || teacher?.schoolId || teacher?.school_id;

  const [assignments, setAssignments] = useState([]);
  const [terms, setTerms] = useState([]);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [lessonDates, setLessonDates] = useState([]);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('1');

  const getAverageColor = (avg) => {
    if (avg >= 4.5) return '#d4edda';
    if (avg >= 3.5) return '#dbeeff';
    if (avg >= 2.5) return '#fff3cd';
    return '#f8d7da';
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [assignRes, termRes] = await Promise.all([
          axios.get(`/api/teacherSubjectClass/by-teacher/${teacher._id}`),
          axios.get(`/api/terms/${schoolId}`)
        ]);
        setAssignments(assignRes.data);
        setTerms(termRes.data);
      } catch (err) {
        console.error('Ошибка загрузки:', err);
      }
    };
    if (teacher && schoolId) loadInitialData();
  }, [teacher, schoolId]);

  useEffect(() => {
    if (selectedClass && selectedSubject && selectedTerm) {
      fetchStudents();
      fetchGrades();
      fetchLessonDates();
    }
  }, [selectedClass, selectedSubject, selectedTerm]);

  const fetchLessonDates = async () => {
    try {
      const term = terms.find(t => t.termNumber === Number(selectedTerm));
      if (!term) return setLessonDates([]);

      const res = await axios.get(
        `/api/schedule/by-teacher-class-subject/${teacher._id}/${selectedClass}/${selectedSubject}`
      );
      const schedule = res.data.schedules || [];

      const termStart = new Date(term.startDate);
      const termEnd = new Date(term.endDate);
      const dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

      const allDates = [];

      schedule.forEach(s => {
        const d = new Date(termStart);
        while (d <= termEnd) {
          const current = new Date(d);
          if (dayNames[current.getDay()] === s.day) {
            allDates.push(current.toISOString().split('T')[0]);
          }
          d.setDate(d.getDate() + 1);
        }
      });

      const uniqueDates = [...new Set(allDates)].sort();
      setLessonDates(uniqueDates);
    } catch (err) {
      console.error('Ошибка загрузки расписания:', err);
      setLessonDates([]);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`/api/students/class/${selectedClass}`);
      setStudents(res.data || []);
    } catch (err) {
      console.error('Ошибка загрузки студентов:', err);
      setStudents([]);
    }
  };

  const fetchGrades = async () => {
    try {
      const res = await axios.get('/api/journal/grades', {
        params: {
          classId: selectedClass,
          subjectId: selectedSubject,
          term: Number(selectedTerm)
        }
      });

      const gradebook = res.data;
      setGrades(Array.isArray(gradebook?.grades) ? gradebook.grades : []);
    } catch (err) {
      console.error('Ошибка загрузки оценок:', err);
      setGrades([]);
    }
  };

  const handleGradeChange = (studentId, date, grade) => {
    setGrades(prev => {
      const updated = [...prev];
      let entry = updated.find(e => e.studentId === studentId);
      if (!entry) {
        entry = { studentId, values: [] };
        updated.push(entry);
      }
      const existing = entry.values.find(v => v.date === date);
      if (existing) {
        existing.grade = grade;
      } else {
        entry.values.push({ date, grade });
      }
      return updated;
    });
  };

  const saveGrades = async () => {
    try {
      await axios.post('/api/journal/grades', {
        classId: selectedClass,
        subjectId: selectedSubject,
        teacherId: teacher._id,
        term: Number(selectedTerm),
        grades
      });
      alert('Оценки сохранены');
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      alert('Ошибка при сохранении оценок');
    }
  };

  const currentTerm = terms.find(t => t.termNumber === Number(selectedTerm));

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Журнал оценок (Учитель)</Typography>

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
          <Select value={selectedTerm} onChange={e => setSelectedTerm(String(e.target.value))}>
            {[1, 2, 3, 4].map(term => (
              <MenuItem key={term} value={String(term)}>Четверть {term}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {currentTerm ? (
        <Typography variant="subtitle2" gutterBottom>
          Период: {new Date(currentTerm.startDate).toLocaleDateString()} — {new Date(currentTerm.endDate).toLocaleDateString()}
        </Typography>
      ) : (
        <Typography color="error">Нет данных по четверти</Typography>
      )}

      <TableContainer component={Paper} sx={{ mt: 3, border: '1px solid #ccc' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ border: '1px solid #ccc', fontWeight: 'bold', textAlign: 'center' }}>Ученик</TableCell>
              {lessonDates.map(date => (
                <TableCell key={date} sx={{ border: '1px solid #ccc', fontWeight: 'bold', textAlign: 'center' }}>
                  {new Date(date).toLocaleDateString()}
                </TableCell>
              ))}
              <TableCell sx={{ border: '1px solid #ccc', fontWeight: 'bold', textAlign: 'center' }}>Средняя</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map(student => {
              const row = grades.find(g => g.studentId === student._id) || { values: [] };
              const valuesOnly = row.values.filter(v => v.grade);
              const average =
                valuesOnly.length > 0
                  ? (valuesOnly.reduce((sum, v) => sum + v.grade, 0) / valuesOnly.length).toFixed(2)
                  : null;

              return (
                <TableRow key={student._id}>
                  <TableCell sx={{ border: '1px solid #ccc', textAlign: 'center', fontWeight: 500 }}>
                    {student.name}
                  </TableCell>
                  {lessonDates.map(date => {
                    const g = row.values.find(v => new Date(v.date).toISOString().split('T')[0] === date);
                    return (
                      <TableCell key={date} sx={{ border: '1px solid #ccc', textAlign: 'center' }}>
                        <Box sx={{
                          backgroundColor:
                            g?.grade === 5 ? '#d4edda' :
                            g?.grade === 4 ? '#dbeeff' :
                            g?.grade === 3 ? '#fff3cd' :
                            'transparent',
                          borderRadius: 1,
                          padding: '2px 4px'
                        }}>
                          <TextField
                            type="number"
                            value={g?.grade || ''}
                            size="small"
                            variant="standard"
                            InputProps={{
                              disableUnderline: true,
                              sx: {
                                textAlign: 'center',
                                width: '2.5rem',
                                input: { textAlign: 'center' }
                              }
                            }}
                            onChange={e => handleGradeChange(student._id, date, parseInt(e.target.value))}
                          />
                        </Box>
                      </TableCell>
                    );
                  })}
                  <TableCell sx={{
                    border: '1px solid #ccc',
                    textAlign: 'center',
                    fontWeight: 600,
                    backgroundColor: average ? getAverageColor(parseFloat(average)) : 'transparent'
                  }}>
                    {average || '-'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Button variant="contained" sx={{ mt: 2 }} onClick={saveGrades}>
        Сохранить
      </Button>
    </Box>
  );
};

export default TeacherGradebookJournal;

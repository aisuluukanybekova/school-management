import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Alert, Stack, Table, TableHead,
  TableRow, TableCell, TableBody, Paper, TableContainer,
  FormControl, InputLabel, Select, MenuItem, Chip,
} from '@mui/material';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { getSubjectsWithTeachers } from '../../redux/sclassRelated/sclassHandle';

axios.defaults.baseURL = 'http://localhost:5001';

function StudentGradesWithSchedule() {
  const dispatch = useDispatch();
  const student = useSelector((state) => state.user.currentUser);
  const { subjectsList } = useSelector((state) => state.sclass);

  const [lessonDates, setLessonDates] = useState([]);
  const [gradesMap, setGradesMap] = useState({});
  const [filteredSubject, setFilteredSubject] = useState('');
  const [filteredTerm, setFilteredTerm] = useState('');
  const [error, setError] = useState('');

  const subjectOptions = subjectsList.map((s) => ({ id: s.subjectId, name: s.subjectName }));
  const termOptions = [1, 2, 3, 4];

  useEffect(() => {
    const classId = student?.sclassName?._id;
    if (classId) {
      dispatch(getSubjectsWithTeachers(classId));
    }
    if (student?._id) {
      fetchGrades(student._id);
    }
  }, [dispatch, student]);

  useEffect(() => {
    const classId = student?.sclassName?._id;
    if (filteredSubject && filteredTerm && classId) {
      fetchLessonDates(classId, filteredSubject, filteredTerm);
    } else {
      setLessonDates([]);
    }
  }, [filteredSubject, filteredTerm, student]);

  const fetchLessonDates = async (classId, subjectId, term) => {
    try {
      const res = await axios.get('/api/schedule/lesson-dates', {
        params: { classId, subjectId, term },
      });
      setLessonDates(res.data || []);
    } catch (err) {
      console.error('Ошибка получения дат по расписанию:', err);
      setError('Не удалось загрузить даты по расписанию.');
    }
  };

  const fetchGrades = async (studentId) => {
    try {
      const res = await axios.get(`/api/journal/student/${studentId}`);
      const gradeDocs = Array.isArray(res.data?.grades) ? res.data.grades : [];
      const map = {};

      gradeDocs.forEach((entry) => {
        const subjectIdRaw = entry.subjectId || entry.subject;
        const subjectId = typeof subjectIdRaw === 'object' ? subjectIdRaw._id : subjectIdRaw;
        const { term } = entry;

        if (!entry.values || !subjectId || !term) return;

        entry.values.forEach(({ date, grade }) => {
          const d = new Date(date);
          d.setHours(0, 0, 0, 0);
          const key = `${subjectId}-${term}-${d.toISOString().slice(0, 10)}`;
          map[key] = { grade };
        });
      });

      setGradesMap(map);
    } catch (err) {
      console.error('Ошибка загрузки оценок:', err);
      setError('Не удалось загрузить оценки');
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 5) return 'success';
    if (grade === 4) return 'warning';
    return 'error';
  };

  const formatDate = (isoDate) => {
    const d = new Date(isoDate);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(2);
    return `${day}.${month}.${year}`;
  };

  const calculateAverageGrade = () => {
    const grades = lessonDates.map((dateIso) => {
      const d = new Date(dateIso);
      d.setHours(0, 0, 0, 0);
      const key = `${filteredSubject}-${filteredTerm}-${d.toISOString().slice(0, 10)}`;
      return gradesMap[key]?.grade;
    }).filter((g) => typeof g === 'number');

    if (!grades.length) return null;

    const sum = grades.reduce((a, b) => a + b, 0);
    const avg = sum / grades.length;

    return Math.round(avg);
  };

  const average = calculateAverageGrade();

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Успеваемость ученика
      </Typography>

      {error && (
        <Stack my={2}>
          <Alert severity="error">{error}</Alert>
        </Stack>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Предмет</InputLabel>
          <Select
            value={filteredSubject}
            onChange={(e) => setFilteredSubject(e.target.value)}
          >
            <MenuItem value="">Выберите предмет</MenuItem>
            {subjectOptions.map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Четверть</InputLabel>
          <Select
            value={filteredTerm}
            onChange={(e) => setFilteredTerm(e.target.value)}
          >
            <MenuItem value="">Выберите четверть</MenuItem>
            {termOptions.map((t) => (
              <MenuItem key={`term-${t}`} value={t}>
                Четверть {t}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {lessonDates.length > 0 ? (
        <>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Дата</TableCell>
                  <TableCell>Оценка</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lessonDates.map((dateIso) => {
                  const d = new Date(dateIso);
                  d.setHours(0, 0, 0, 0);
                  const dateKey = `${filteredSubject}-${filteredTerm}-${d.toISOString().slice(0, 10)}`;
                  const gradeEntry = gradesMap[dateKey];
                  return (
                    <TableRow key={dateKey}>
                      <TableCell>{formatDate(d)}</TableCell>
                      <TableCell>
                        {gradeEntry?.grade
                          ? <Chip label={gradeEntry.grade} color={getGradeColor(gradeEntry.grade)} />
                          : '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {average !== null && (
            <Box mt={3}>
              <Typography variant="subtitle1" fontWeight="bold">
                Итоговая оценка за четверть:
              </Typography>
              <Chip
                label={average}
                color={getGradeColor(average)}
                sx={{ fontSize: '1.1rem', px: 2, py: 1 }}
              />
            </Box>
          )}
        </>
      ) : (
        filteredSubject && filteredTerm && (
          <Typography>Нет уроков по выбранному предмету и четверти</Typography>
        )
      )}
    </Box>
  );
}

export default StudentGradesWithSchedule;

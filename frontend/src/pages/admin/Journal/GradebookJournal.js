import React, { useEffect, useState } from 'react';
import {
  Box, Typography, FormControl, InputLabel, MenuItem, Select,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert
} from '@mui/material';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5001';

const GradebookJournal = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [allDates, setAllDates] = useState([]);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/classes')
      .then(res => setClasses(res.data))
      .catch(() => console.error('Ошибка загрузки классов'));
  }, []);

  useEffect(() => {
    if (selectedClass) {
      axios.get(`/api/teacherSubjectClass/assigned/${selectedClass}`)
        .then(res => {
          const mapped = res.data.map(item => ({
            _id: item.subjectId,
            subName: item.subjectName
          }));
          setSubjects(mapped);
        })
        .catch(() => console.error('Ошибка загрузки предметов'));

      axios.get(`/api/students/class/${selectedClass}`)
        .then(res => {
          const sorted = [...res.data].sort((a, b) => a.name.localeCompare(b.name));
          setStudents(sorted);
        })
        .catch(() => console.error('Ошибка загрузки учеников'));
    }
  }, [selectedClass]);

  const fetchGrades = async () => {
    if (!selectedClass || !selectedSubject || !selectedTerm) {
      setError('Выберите класс, предмет и четверть');
      return;
    }
  
    try {
      // 📅 Получение всех дат уроков по расписанию
      const { data: dates } = await axios.get('/api/schedule/dates', {
        params: {
          classId: selectedClass,
          subjectId: selectedSubject,
          term: selectedTerm
        }
      });
  
      console.log("📅 Даты из расписания:", dates);
      const formattedDates = dates.map(d => new Date(d).toISOString().split('T')[0]);
  
      // 📝 Получение оценок
      const res = await axios.get(`/api/journal/grades`, {
        params: { classId: selectedClass, subjectId: selectedSubject, term: selectedTerm }
      });
  
      console.log("🎯 Ответ с оценками:", res.data);
  
      const raw = res.data?.grades || res.data?.gradebook?.grades || [];
  
      // 🔄 Преобразование в плоский массив
      const flat = [];
      raw.forEach(entry => {
        if (Array.isArray(entry.values)) {
          entry.values.forEach(({ date, grade }) => {
            flat.push({
              studentId: entry.studentId,
              date: date.slice(0, 10),
              grade,
            });
          });
        }
      });
  
      const map = {};
      flat.forEach(g => {
        const key = `${g.studentId}_${g.date}`;
        map[key] = g.grade;
      });
  
      setGrades(map);
      setAllDates(formattedDates);
      setError('');
  
    } catch (err) {
      console.error(' Ошибка:', err);
      setError('Ошибка загрузки оценок или дат расписания');
    }
  };  

  return (
    <Box p={4}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        📝 Успеваемость учеников
      </Typography>

      <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Класс</InputLabel>
          <Select
            value={selectedClass}
            label="Класс"
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {classes.map((c) => (
              <MenuItem key={c._id} value={c._id}>{c.sclassName}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Предмет</InputLabel>
          <Select
            value={selectedSubject}
            label="Предмет"
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            {subjects.map((s) => (
              <MenuItem key={s._id} value={s._id}>{s.subName}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Четверть</InputLabel>
          <Select
            value={selectedTerm}
            label="Четверть"
            onChange={(e) => setSelectedTerm(e.target.value)}
          >
            {[1, 2, 3, 4].map(term => (
              <MenuItem key={term} value={term}>Четверть {term}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box display="flex" alignItems="center">
          <button onClick={fetchGrades}>🔍 Показать</button>
        </Box>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {students.length > 0 && allDates.length > 0 ? (
        <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
          <Table size="small" stickyHeader sx={{ border: '1px solid #ccc' }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                <TableCell sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>№</TableCell>
                <TableCell sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>Ученик</TableCell>
                {allDates.map((date, i) => (
                  <TableCell key={i} sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>
                    {new Date(date).toLocaleDateString()}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((s, index) => (
                <TableRow key={s._id}>
                  <TableCell sx={{ border: '1px solid #eee' }}>{index + 1}</TableCell>
                  <TableCell sx={{ border: '1px solid #eee' }}>{s.name}</TableCell>
                  {allDates.map(date => (
                    <TableCell key={date} sx={{ border: '1px solid #eee' }}>
                      {grades[`${s._id}_${date}`] ?? '—'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography mt={3}>Нет оценок или данных</Typography>
      )}
    </Box>
  );
};

export default GradebookJournal;

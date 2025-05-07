import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Alert, Stack, Table, TableHead,
  TableRow, TableCell, TableBody, Paper, TableContainer,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { getSubjectsWithTeachers } from '../../redux/sclassRelated/sclassHandle';

axios.defaults.baseURL = 'http://localhost:5001';

const StudentAttendance = () => {
  const dispatch = useDispatch();
  const student = useSelector((state) => state.user.currentUser);
  const subjectsList = useSelector((state) => state.sclass.subjectsList);

  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (student?._id) {
      fetchAttendance();
    }
    if (student?.sclassName?._id) {
      dispatch(getSubjectsWithTeachers(student.sclassName._id));
    }
  }, [dispatch, student]);

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`/api/attendance/student/${student._id}`);
      setRecords(res.data.records || []);
    } catch (err) {
      console.error('Ошибка загрузки посещаемости:', err);
      setError('Не удалось загрузить посещаемость');
    }
  };

  // Фильтрация по предмету и четверти
  useEffect(() => {
    const filtered = records.filter((rec) => {
      const subjectMatch = selectedSubject ? rec.subjectName === selectedSubject : true;
      const termMatch = selectedTerm ? String(rec.term) === String(selectedTerm) : true;
      return subjectMatch && termMatch;
    });
    setFilteredRecords(filtered);
  }, [selectedSubject, selectedTerm, records]);

  // Все предметы класса
  const subjectOptions = subjectsList.map((s) => s.subjectName);
  const termOptions = [1, 2, 3, 4];


  // Группируем записи по предметам
  const groupedBySubject = {};
  subjectOptions.forEach(subject => {
    groupedBySubject[subject] = filteredRecords.filter(rec => rec.subjectName === subject);
  });

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        🚫 Моя посещаемость
      </Typography>

      {error && (
        <Stack my={2}>
          <Alert severity="error">{error}</Alert>
        </Stack>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel id="subject-label">Предмет</InputLabel>
          <Select
            labelId="subject-label"
            value={selectedSubject}
            label="Предмет"
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <MenuItem value="">Все предметы</MenuItem>
            {subjectOptions.map((subject, i) => (
              <MenuItem key={i} value={subject}>{subject}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="term-label">Четверть</InputLabel>
          <Select
            labelId="term-label"
            value={selectedTerm}
            label="Четверть"
            onChange={(e) => setSelectedTerm(e.target.value)}
          >
            <MenuItem value="">Все четверти</MenuItem>
            {termOptions.map((term, i) => (
              <MenuItem key={i} value={term}>Четверть {term}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {Object.entries(groupedBySubject).map(([subject, entries]) => (
        <Box key={subject} mb={4}>
          <Typography variant="h6">{subject}</Typography>
          {entries.length === 0 ? (
            <Typography sx={{ ml: 2 }}>✔️ Все занятия посещены</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Дата</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Четверть</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entries.map((entry, i) => (
                    <TableRow key={i}>
                      <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                      <TableCell>{entry.status}</TableCell>
                      <TableCell>{entry.term || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      ))}

      {filteredRecords.length === 0 && subjectOptions.length === 0 && !error && (
        <Typography>Нет данных для отображения 📭</Typography>
      )}
    </Box>
  );
};

export default StudentAttendance;

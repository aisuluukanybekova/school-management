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

const StudentGrades = () => {
  const dispatch = useDispatch();
  const student = useSelector((state) => state.user.currentUser);
  const { subjectsList } = useSelector((state) => state.sclass);

  const [allGrades, setAllGrades] = useState([]);
  const [error, setError] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [filteredGrades, setFilteredGrades] = useState([]);

  useEffect(() => {
    if (student?._id) {
      fetchGrades();
    }

    if (student?.sclassName?._id) {
      dispatch(getSubjectsWithTeachers(student.sclassName._id));
    }
  }, [student, dispatch]);

  const fetchGrades = async () => {
    try {
      const res = await axios.get(`/api/journal/student/${student._id}`);
      setAllGrades(res.data.grades || []);
    } catch (err) {
      console.error('Ошибка загрузки оценок:', err);
      setError('Не удалось загрузить оценки');
    }
  };

  useEffect(() => {
    if (selectedSubject && selectedTerm) {
      const gradesForSubjectAndTerm = allGrades.find(
        (g) => g.subject === selectedSubject && String(g.term) === String(selectedTerm)
      );

      setFilteredGrades([
        {
          subject: selectedSubject,
          term: selectedTerm,
          values: gradesForSubjectAndTerm?.values || []
        }
      ]);
    } else {
      setFilteredGrades([]);
    }
  }, [selectedSubject, selectedTerm, allGrades]);

  const getAverage = (values) => {
    if (!values?.length) return null;
    const sum = values.reduce((acc, v) => acc + v.grade, 0);
    return (sum / values.length).toFixed(2);
  };

  const subjectOptions = subjectsList.map((s) => s.subjectName);
  const termOptions = [1, 2, 3, 4];

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        📘 Мои оценки
      </Typography>

      {error && (
        <Stack my={2}>
          <Alert severity="error">{error}</Alert>
        </Stack>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel id="subject-select-label">Предмет</InputLabel>
          <Select
            labelId="subject-select-label"
            value={selectedSubject}
            label="Предмет"
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            {subjectOptions.map((subject, index) => (
              <MenuItem key={index} value={subject}>
                {subject}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="term-select-label">Четверть</InputLabel>
          <Select
            labelId="term-select-label"
            value={selectedTerm}
            label="Четверть"
            onChange={(e) => setSelectedTerm(e.target.value)}
          >
            {termOptions.map((term) => (
              <MenuItem key={term} value={term}>
                Четверть {term}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {filteredGrades.length > 0 && selectedSubject && selectedTerm ? (
        filteredGrades.map((subject, index) => (
          <Box key={index} mb={4}>
            <Typography variant="h6">
              {subject.subject} — Четверть {subject.term}
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Дата</TableCell>
                    <TableCell>Оценка</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subject.values.map((v, i) => (
                    <TableRow key={i}>
                      <TableCell>{new Date(v.date).toLocaleDateString()}</TableCell>
                      <TableCell>{v.grade}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell>
                      <strong>Средняя</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{getAverage(subject.values) || '-'}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))
      ) : (
        selectedSubject &&
        selectedTerm && <Typography>Нет оценок по выбранному предмету и четверти</Typography>
      )}

      {!selectedSubject && !selectedTerm && allGrades.length === 0 && !error && (
        <Typography>Пока нет оценок</Typography>
      )}
    </Box>
  );
};

export default StudentGrades;

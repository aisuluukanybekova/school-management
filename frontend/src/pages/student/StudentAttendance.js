import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, TableContainer, FormControl, InputLabel,
  Select, MenuItem, Stack, Dialog, DialogTitle, DialogContent,
  Tabs, Tab,
} from '@mui/material';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getSubjectsWithTeachers } from '../../redux/sclassRelated/sclassHandle';

axios.defaults.baseURL = 'http://localhost:5001';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'];

function StudentAttendance() {
  const dispatch = useDispatch();
  const student = useSelector((state) => state.user.currentUser);
  const subjectsList = useSelector((state) => state.sclass.subjectsList);

  const [records, setRecords] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [modalSubject, setModalSubject] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);

  const fetchAttendance = useCallback(async () => {
    try {
      const res = await axios.get(`/api/attendance/student/${student._id}`);
      setRecords(res.data.records || []);
    } catch (err) {
      console.error('Ошибка загрузки посещаемости:', err);
    }
  }, [student._id]);

  useEffect(() => {
    if (student?._id) fetchAttendance();
    if (student?.sclassName?._id) dispatch(getSubjectsWithTeachers(student.sclassName._id));
  }, [dispatch, student, fetchAttendance]);

  useEffect(() => {
    const filtered = records.filter((rec) => (selectedTerm ? String(rec.term) === String(selectedTerm) : true));
    setFilteredRecords(filtered);
  }, [selectedTerm, records]);

  const termOptions = [1, 2, 3, 4];
  const subjectNames = subjectsList.map((s) => s.subjectName);

  const grouped = {};
  subjectNames.forEach((subject) => {
    grouped[subject] = filteredRecords.filter((r) => r.subjectName === subject && r.status === 'Отсутствовал');
  });

  const chartData = subjectNames.map((subject) => ({
    name: subject,
    absences: grouped[subject]?.length || 0,
  }));

  const termData = termOptions.map((term) => ({
    term: `Четверть ${term}`,
    absences: filteredRecords.filter((r) => r.term === term && r.status === 'Отсутствовал').length,
  }));

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Посещаемость ученика
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Четверть</InputLabel>
          <Select
            value={selectedTerm}
            label="Четверть"
            onChange={(e) => setSelectedTerm(e.target.value)}
          >
            <MenuItem value="">Все четверти</MenuItem>
            {termOptions.map((term) => (
              <MenuItem key={`term-${term}`} value={term}>
                Четверть {term}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Tabs value={tabIndex} onChange={(_, val) => setTabIndex(val)} sx={{ mb: 3 }}>
        <Tab label="Таблица" />
        <Tab label="Диаграммы" />
      </Tabs>

      {tabIndex === 0 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Предмет</TableCell>
                <TableCell>Пропусков</TableCell>
                <TableCell>Последнее отсутствие</TableCell>
                <TableCell>Подробнее</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subjectNames.map((subject) => {
                const absences = grouped[subject] || [];
                const lastAbsence = absences.length
                  ? new Date(absences[absences.length - 1].date).toLocaleDateString()
                  : '—';
                return (
                  <TableRow key={`subject-${subject}`}>
                    <TableCell>{subject}</TableCell>
                    <TableCell>{absences.length}</TableCell>
                    <TableCell>{lastAbsence}</TableCell>
                    <TableCell>
                      {absences.length > 0 && (
                        <Typography
                          onClick={() => setModalSubject(subject)}
                          sx={{ cursor: 'pointer', color: 'blue' }}
                        >
                          Смотреть
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tabIndex === 1 && (
        <Box>
          <Typography variant="h6" mb={2}>Гистограмма: Пропуски по предметам</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="absences" />
            </BarChart>
          </ResponsiveContainer>

          <Typography variant="h6" mt={4} mb={2}>Линия: Пропуски по четвертям</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={termData}>
              <XAxis dataKey="term" />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Line type="monotone" dataKey="absences" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>

          <Typography variant="h6" mt={4} mb={2}>Круговая диаграмма: Доля пропусков</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={chartData} dataKey="absences" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      )}
      <Dialog open={!!modalSubject} onClose={() => setModalSubject(null)} fullWidth>
        <DialogTitle>Пропуски по предмету: {modalSubject}</DialogTitle>
        <DialogContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Дата</TableCell>
                <TableCell>Четверть</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(grouped[modalSubject] || []).map((rec) => (
                <TableRow key={`${rec.subjectName}-${rec.date}`}>
                  <TableCell>{new Date(rec.date).toLocaleDateString()}</TableCell>
                  <TableCell>{rec.term}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default StudentAttendance;

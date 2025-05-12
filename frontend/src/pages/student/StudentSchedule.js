import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, TableContainer, Alert, Stack, FormControl,
  InputLabel, Select, MenuItem
} from '@mui/material';
import axios from 'axios';
import { useSelector } from 'react-redux';

const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];
const dayMap = {
  Monday: 'Понедельник',
  Tuesday: 'Вторник',
  Wednesday: 'Среда',
  Thursday: 'Четверг',
  Friday: 'Пятница',
  Saturday: 'Суббота',
  Sunday: 'Воскресенье'
};

const StudentSchedule = () => {
  const student = useSelector((state) => state.user.currentUser);
  const [schedules, setSchedules] = useState([]);
  const [selectedDay, setSelectedDay] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (student?.sclassName?._id) {
      fetchSchedule(student.sclassName._id);
    }
  }, [student]);

  const fetchSchedule = async (classId) => {
    try {
      const res = await axios.get(`/api/schedule/class/${classId}`);
      const raw = res.data.schedules || [];

      // Преобразуем англ. дни недели в русские для соответствия селектору
      const normalized = raw.map(s => ({
        ...s,
        day: dayMap[s.day] || s.day
      }));

      setSchedules(normalized);
    } catch (err) {
      console.error('Ошибка загрузки расписания:', err);
      setError('Ошибка загрузки расписания');
    }
  };

  const filtered = selectedDay
    ? schedules.filter((s) => s.day === selectedDay)
    : schedules;

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Моё расписание
      </Typography>

      {error && (
        <Stack my={2}>
          <Alert severity="error">{error}</Alert>
        </Stack>
      )}

      <FormControl size="small" sx={{ minWidth: 200, mb: 2 }}>
        <InputLabel>День недели</InputLabel>
        <Select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} label="День недели">
          <MenuItem value="">Вся неделя</MenuItem>
          {daysOfWeek.map((day) => (
            <MenuItem key={day} value={day}>{day}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedDay ? (
        <ScheduleTableComponent data={filtered} />
      ) : (
        daysOfWeek.map((day) => (
          <Box key={day} mb={3}>
            <Typography variant="h6" gutterBottom>{day}</Typography>
            <ScheduleTableComponent data={schedules.filter((s) => s.day === day)} />
          </Box>
        ))
      )}
    </Box>
  );
};

const ScheduleTableComponent = ({ data }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
        <TableRow>
          <TableCell align="center">Начало</TableCell>
          <TableCell align="center">Конец</TableCell>
          <TableCell align="center">Тип</TableCell>
          <TableCell align="center">Предмет</TableCell>
          <TableCell align="center">Учитель</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((entry) => (
          <TableRow key={entry._id} sx={{ backgroundColor: entry.type === 'break' ? '#e0e0e0' : 'inherit' }}>
            <TableCell align="center">{entry.startTime}</TableCell>
            <TableCell align="center">{entry.endTime}</TableCell>
            <TableCell align="center">{entry.type === 'lesson' ? 'Урок' : 'Перемена'}</TableCell>
            <TableCell align="center">{entry.subjectId?.subName || '—'}</TableCell>
            <TableCell align="center">{entry.teacherId?.name || '—'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default StudentSchedule;

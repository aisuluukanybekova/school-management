import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, FormControl, InputLabel, Select, MenuItem, Button,
  Paper, TableContainer, Alert, Stack,
} from '@mui/material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from '@mui/icons-material';
import axios from 'axios';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

axios.defaults.baseURL = 'http://localhost:5001';

const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Вся неделя'];

const ruToEnDay = {
  Понедельник: 'Monday',
  Вторник: 'Tuesday',
  Среда: 'Wednesday',
  Четверг: 'Thursday',
  Пятница: 'Friday',
};

function ScheduleTable() {
  const admin = useSelector((state) => state.user.currentUser);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const schoolId = admin?.schoolId || admin?.school?._id;
        if (!schoolId) {
          setError('Не найден ID школы администратора.');
          return;
        }
        const res = await axios.get(`/api/classes/school/${schoolId}`);
        setClasses(res.data);
      } catch (err) {
        setError('Не удалось загрузить классы.');
      }
    };
    if (admin) loadClasses();
  }, [admin]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await axios.get(`/api/schedule/class/${selectedClass}`);
        const all = res.data?.schedules || [];

        setSchedules(
          selectedDay === 'Вся неделя'
            ? all
            : all.filter((item) => item.day === ruToEnDay[selectedDay])
        );
      } catch {
        setError('Не удалось загрузить расписание.');
      }
    };

    if (selectedClass && selectedDay) fetchSchedules();
  }, [selectedClass, selectedDay]);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFont('courier', 'normal');
    doc.setFontSize(16);

    if (selectedDay === 'Вся неделя') {
      Object.entries(ruToEnDay).forEach(([ruDay, enDay], idx) => {
        const daySchedules = schedules.filter((s) => s.day === enDay);

        if (idx !== 0) doc.addPage();
        doc.text(`Расписание: ${ruDay}`, 14, 20);
        autoTable(doc, {
          startY: 30,
          styles: { font: 'courier' },
          head: [['Начало', 'Конец', 'Тип', 'Предмет', 'Учитель']],
          body: daySchedules.map((entry) => [
            entry.startTime,
            entry.endTime,
            entry.type === 'lesson' ? 'Урок' : 'Перемена',
            entry.subjectId?.subName || '-',
            entry.teacherId?.name || '-',
          ]),
        });
      });

      doc.save('Расписание_вся_неделя.pdf');
    } else {
      doc.text(`Расписание: ${selectedDay}`, 14, 20);
      autoTable(doc, {
        startY: 30,
        styles: { font: 'courier' },
        head: [['Начало', 'Конец', 'Тип', 'Предмет', 'Учитель']],
        body: schedules.map((entry) => [
          entry.startTime,
          entry.endTime,
          entry.type === 'lesson' ? 'Урок' : 'Перемена',
          entry.subjectId?.subName || '-',
          entry.teacherId?.name || '-',
        ]),
      });

      doc.save(`Расписание_${selectedDay}.pdf`);
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Просмотр расписания
      </Typography>

      {error && (
        <Stack my={2}>
          <Alert severity="error">{error}</Alert>
        </Stack>
      )}

      <Box display="flex" flexWrap="wrap" gap={2} my={2}>
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>Класс</InputLabel>
          <Select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            label="Класс"
          >
            {classes.map((cls) => (
              <MenuItem key={cls._id} value={cls._id}>
                {cls.sclassName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>День</InputLabel>
          <Select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            label="День"
          >
            {daysOfWeek.map((day) => (
              <MenuItem key={day} value={day}>
                {day}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={generatePDF}
          disabled={schedules.length === 0}
          sx={{ height: 40 }}
        >
          Скачать PDF
        </Button>
      </Box>

      {selectedDay !== 'Вся неделя' ? (
        <ScheduleTableComponent data={schedules} />
      ) : (
        Object.entries(ruToEnDay).map(([ruDay, enDay]) => (
          <Box key={ruDay} mb={4}>
            <Typography variant="h6" gutterBottom>
              {ruDay}
            </Typography>
            <ScheduleTableComponent
              data={schedules.filter((s) => s.day === enDay)}
            />
          </Box>
        ))
      )}
    </Box>
  );
}

function ScheduleTableComponent({ data }) {
  return (
    <TableContainer component={Paper} elevation={2}>
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
            <TableRow
              key={entry._id}
              sx={{
                backgroundColor: entry.type === 'break' ? '#e0e0e0' : 'inherit',
              }}
            >
              <TableCell align="center">{entry.startTime}</TableCell>
              <TableCell align="center">{entry.endTime}</TableCell>
              <TableCell align="center">
                {entry.type === 'lesson' ? 'Урок' : 'Перемена'}
              </TableCell>
              <TableCell align="center">
                {entry.type === 'lesson' ? entry.subjectId?.subName : '—'}
              </TableCell>
              <TableCell align="center">
                {entry.type === 'lesson' ? entry.teacherId?.name : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

ScheduleTableComponent.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default ScheduleTable;

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, FormControl, InputLabel, Select, MenuItem, Button,
  Paper, TableContainer, Alert, Stack,
} from '@mui/material';
import axios from 'axios';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
      } catch {
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

  const exportToExcel = () => {
    const data = schedules.map((entry) => ({
      Начало: entry.startTime,
      Конец: entry.endTime,
      Тип: entry.type === 'lesson' ? 'Урок' : 'Перемена',
      Предмет: entry.subjectId?.subName || '-',
      Учитель: entry.teacherId?.name || '-',
      Кабинет: entry.room || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Расписание');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(fileData, `Расписание_${selectedDay || 'день'}.xlsx`);
  };

  return (
    <Box p={4}>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-schedule, .print-schedule * {
            visibility: visible;
          }
          .print-schedule {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
        }
      `}</style>

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
          variant="outlined"
          onClick={() => window.print()}
          sx={{ height: 40 }}
        >
          Печать
        </Button>

        <Button
          variant="outlined"
          onClick={exportToExcel}
          disabled={schedules.length === 0}
          sx={{ height: 40 }}
        >
          Экспорт в Excel
        </Button>
      </Box>

      {selectedDay !== 'Вся неделя' ? (
        <div className="print-schedule">
          <ScheduleTableComponent data={schedules} />
        </div>
      ) : (
        Object.entries(ruToEnDay).map(([ruDay, enDay]) => (
          <Box key={ruDay} mb={4} className="print-schedule">
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
            <TableCell align="center">Кабинет</TableCell>
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
              <TableCell align="center">
                {entry.type === 'lesson' ? entry.room || '—' : '—'}
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

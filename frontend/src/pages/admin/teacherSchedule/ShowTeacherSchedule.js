import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
  Paper
} from '@mui/material';
import TeacherCalendar from './TeacherCalendar'; // 📅 Календарь для отображения занятий
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddScheduleForm from './AddScheduleForm';
import ScheduleTable from './ScheduleTable';
import axios from 'axios';
import { useSelector } from 'react-redux';

const ShowTeacherSchedule = () => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [schedule, setSchedule] = useState([]);

  const adminId = useSelector(state => state.user.currentUser._id);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/Teachers/${adminId}`);
        setTeachers(res.data);
      } catch (err) {
        console.error('Ошибка при загрузке учителей:', err);
      }
    };

    fetchTeachers();
  }, [adminId]);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!selectedTeacherId) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/schedule/${selectedTeacherId}`);
        const data = res.data?.schedule || [];
        setSchedule(data);
      } catch (err) {
        console.error('Ошибка при загрузке расписания:', err);
      }
    };

    fetchSchedule();
  }, [selectedTeacherId, openForm]);

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        <CalendarMonthIcon sx={{ mr: 1 }} /> Расписание преподавателей
      </Typography>

      <Select
        fullWidth
        displayEmpty
        value={selectedTeacherId}
        onChange={(e) => setSelectedTeacherId(e.target.value)}
        sx={{ my: 2 }}
      >
        <MenuItem value="" disabled>
          Выберите преподавателя
        </MenuItem>
        {teachers.map((t) => (
          <MenuItem key={t._id} value={t._id}>
            {t.name}
          </MenuItem>
        ))}
      </Select>

      <Button
        variant="contained"
        onClick={() => setOpenForm(true)}
        disabled={!selectedTeacherId}
      >
        + ДОБАВИТЬ ЗАНЯТИЕ
      </Button>

      <Box sx={{ mt: 4 }}>
        {schedule.length === 0 ? (
          <Typography>Нет записей для выбранного преподавателя.</Typography>
        ) : (
          <>
            <ScheduleTable data={schedule} />
            <Box mt={4}>
              <Typography variant="h6" gutterBottom>Календарь</Typography>
              <TeacherCalendar schedule={schedule} />
            </Box>
          </>
        )}
      </Box>

      {openForm && (
        <AddScheduleForm
          teacherId={selectedTeacherId}
          onClose={() => setOpenForm(false)}
        />
      )}
    </Paper>
  );
};

export default ShowTeacherSchedule;

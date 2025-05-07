import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Select, MenuItem, FormControl, InputLabel,
  Table, TableHead, TableRow, TableCell, TableBody, Paper, TableContainer
} from '@mui/material';
import { useSelector } from 'react-redux';
import axios from 'axios';

const daysOfWeek = [
  'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'
];

const TeacherSchedule = () => {
  const teacher = useSelector((state) => state.user.currentUser);
  const [schedule, setSchedule] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedDay, setSelectedDay] = useState(daysOfWeek[0]);

  useEffect(() => {
    const fetchScheduleAndTopics = async () => {
      try {
        const res = await axios.get(`/api/schedule/by-teacher/${teacher._id}`);
        const schedules = res.data.schedules || [];

        setSchedule(schedules);

        // Получить темы по всем уникальным classId/subjectId из расписания
        const classIds = [...new Set(schedules.map(s => s.classId?._id))];
        const subjectIds = [...new Set(schedules.map(s => s.subjectId?._id))];

        const topicRes = await axios.get(`/api/lesson-topics`, {
          params: {
            classId: classIds[0], // предполагаем один класс для учителя
            subjectId: subjectIds[0],
            term: 1 // Можно также передавать term динамически
          }
        });

        setTopics(topicRes.data);
      } catch (err) {
        console.error('Ошибка загрузки расписания или тем:', err);
      }
    };

    if (teacher?._id) fetchScheduleAndTopics();
  }, [teacher]);

  const filtered = schedule.filter(s => s.day === selectedDay && s.type === 'lesson');

  const getLessonDetails = (lesson) => {
    const match = topics.find(
      t =>
        t.day === lesson.day &&
        t.startTime === lesson.startTime &&
        t.classId === lesson.classId?._id &&
        t.subjectId === lesson.subjectId?._id
    );
    return {
      topic: match?.topic || 'Нет темы',
      homework: match?.homework || 'Нет'
    };
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Моё расписание</Typography>

      <FormControl sx={{ my: 2, minWidth: 200 }}>
        <InputLabel>День недели</InputLabel>
        <Select value={selectedDay} onChange={e => setSelectedDay(e.target.value)} label="День недели">
          {daysOfWeek.map((day) => (
            <MenuItem key={day} value={day}>{day}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Время</strong></TableCell>
              <TableCell><strong>Класс</strong></TableCell>
              <TableCell><strong>Предмет</strong></TableCell>
              <TableCell><strong>Тема</strong></TableCell>
              <TableCell><strong>Домашнее задание</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((lesson, index) => {
              const { topic, homework } = getLessonDetails(lesson);
              return (
                <TableRow key={index}>
                  <TableCell>{lesson.startTime} - {lesson.endTime}</TableCell>
                  <TableCell>{lesson.classId?.sclassName || '—'}</TableCell>
                  <TableCell>{lesson.subjectId?.subName || '—'}</TableCell>
                  <TableCell>{topic}</TableCell>
                  <TableCell>{homework}</TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>Нет уроков на этот день</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TeacherSchedule;

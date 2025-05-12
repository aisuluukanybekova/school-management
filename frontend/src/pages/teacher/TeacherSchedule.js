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

const ruToEnDay = {
  'Понедельник': 'Monday',
  'Вторник': 'Tuesday',
  'Среда': 'Wednesday',
  'Четверг': 'Thursday',
  'Пятница': 'Friday',
  'Суббота': 'Saturday'
};

const TeacherSchedule = () => {
  const teacher = useSelector((state) => state.user.currentUser);
  const [schedule, setSchedule] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedDay, setSelectedDay] = useState(daysOfWeek[0]);
  const [terms, setTerms] = useState([]);
  const [term, setTerm] = useState('1');

  const schoolId = teacher?.school?._id || teacher?.schoolId;

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const res = await axios.get(`/api/terms/${schoolId}`);
        setTerms(res.data);
      } catch (err) {
        console.error('Ошибка загрузки четвертей:', err);
      }
    };
    if (schoolId) fetchTerms();
  }, [schoolId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/schedule/by-teacher/${teacher._id}`);
        const schedules = res.data.schedules || [];
        setSchedule(schedules);

        const assignments = schedules
          .filter(s => s.classId && s.subjectId)
          .map(s => ({
            classId: s.classId._id,
            subjectId: s.subjectId._id
          }));

        const uniquePairs = Array.from(
          new Set(assignments.map(a => `${a.classId}_${a.subjectId}`))
        ).map(str => {
          const [classId, subjectId] = str.split('_');
          return { classId, subjectId };
        });

        const allTopics = [];

        for (const pair of uniquePairs) {
          const topicRes = await axios.get(`/api/lesson-topics`, {
            params: {
              classId: pair.classId,
              subjectId: pair.subjectId,
              term: Number(term)
            }
          });
          allTopics.push(...topicRes.data);
        }

        setTopics(allTopics);
      } catch (err) {
        console.error('Ошибка загрузки расписания или тем:', err);
      }
    };

    if (teacher?._id && term) fetchData();
  }, [teacher, term]);

  const filtered = schedule.filter(
    s => s.day === ruToEnDay[selectedDay] && s.type === 'lesson'
  );

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
      <Typography variant="h5" gutterBottom>🧑‍🏫 Моё расписание</Typography>

      <Box display="flex" gap={2} mb={3}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>День недели</InputLabel>
          <Select value={selectedDay} onChange={e => setSelectedDay(e.target.value)}>
            {daysOfWeek.map((day) => (
              <MenuItem key={day} value={day}>{day}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Четверть</InputLabel>
          <Select value={term} onChange={e => setTerm(e.target.value)}>
            {terms.map(t => (
              <MenuItem key={t.termNumber} value={String(t.termNumber)}>
                Четверть {t.termNumber}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

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
            {filtered.length > 0 ? (
              filtered.map((lesson, index) => {
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
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">Нет уроков на этот день</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TeacherSchedule;

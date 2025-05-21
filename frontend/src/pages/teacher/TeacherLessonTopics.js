import React, { useEffect, useState } from 'react';
import {
  Box, Typography, FormControl, InputLabel, MenuItem, Select, TextField,
  Paper, Button, Grid, Snackbar, Alert
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLessonTopics, saveLessonTopics } from '../../redux/lessonTopicRelated/lessonTopicHandle';
import axios from 'axios';

const TeacherLessonTopics = () => {
  const dispatch = useDispatch();
  const teacher = useSelector((state) => state.user.currentUser);
  const { topics } = useSelector((state) => state.lessonTopics);

  const [assignments, setAssignments] = useState([]);
  const [terms, setTerms] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [term, setTerm] = useState('1');
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarText, setSnackbarText] = useState('');

  const schoolId = teacher?.school?._id || teacher?.schoolId;
  const selectedTerm = terms.find(t => t.termNumber === Number(term));

  useEffect(() => {
    const fetchInit = async () => {
      const [assignRes, termRes] = await Promise.all([
        axios.get(`/api/teacherSubjectClass/by-teacher/${teacher._id}`),
        axios.get(`/api/terms/${schoolId}`)
      ]);
      setAssignments(assignRes.data);
      setTerms(termRes.data);
    };
    if (teacher && schoolId) fetchInit();
  }, [teacher, schoolId]);

  useEffect(() => {
    if (!classId || !subjectId || !term) return;
    dispatch(fetchLessonTopics({ classId, subjectId, term }));
  }, [classId, subjectId, term, dispatch]);

  useEffect(() => {
    const loadLessons = async () => {
      if (!classId || !subjectId || !term || !selectedTerm) return;
      const termStart = new Date(selectedTerm.startDate);
      const termEnd = new Date(selectedTerm.endDate);

      const { data: scheduleData } = await axios.get(
        `/api/schedule/by-teacher-class-subject/${teacher._id}/${classId}/${subjectId}`
      );

      const schedule = scheduleData.schedules || [];
      const dayMap = {
        Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
        Thursday: 4, Friday: 5, Saturday: 6
      };

      const generatedLessons = [];
      for (const item of schedule) {
        if (item.type !== 'lesson') continue;
        let current = new Date(termStart);
        while (current <= termEnd) {
          if (current.getDay() === dayMap[item.day]) {
            const dateStr = current.toISOString().split('T')[0];
            const match = topics.find(
              t => t.date === dateStr && t.startTime === item.startTime
            );
            generatedLessons.push({
              date: dateStr,
              day: item.day,
              startTime: item.startTime,
              topic: match?.topic || '',
              homework: match?.homework || ''
            });
          }
          current.setDate(current.getDate() + 1);
        }
      }
      const sortedLessons = generatedLessons.sort((a, b) => new Date(a.date) - new Date(b.date));
      setLessons(sortedLessons);
      const dates = [...new Set(sortedLessons.map(l => l.date))];
      setAvailableDates(dates);
      setSelectedDate(dates[0]);
    };

    loadLessons();
  }, [topics, selectedTerm, classId, subjectId, teacher._id]);

  const handleChange = (index, field, value) => {
    const updated = [...lessons];
    updated[index][field] = value;
    setLessons(updated);
  };

  const handleSave = () => {
    dispatch(saveLessonTopics({
      classId,
      subjectId,
      teacherId: teacher._id,
      term: Number(term),
      lessons
    }));

    const now = new Date();
    setSnackbarText(`Сохранено: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`);
    setOpenSnackbar(true);
  };

  const filteredLessons = lessons.filter(l => l.date === selectedDate);

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Темы Уроков</Typography>

      <Box display="flex" gap={2} mt={2} mb={2}>
        <FormControl fullWidth>
          <InputLabel>Класс и предмет</InputLabel>
          <Select
            value={classId && subjectId ? `${classId}_${subjectId}` : ''}
            onChange={e => {
              const [newClassId, newSubjectId] = e.target.value.split('_');
              setClassId(newClassId);
              setSubjectId(newSubjectId);
            }}
          >
            {assignments.map((a, i) => (
              <MenuItem key={i} value={`${a.sclassId}_${a.subjectId}`}>
                {a.sclassName} — {a.subjectName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
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

      {selectedTerm && (
        <Typography color="textSecondary" mb={2}>
          Период: {new Date(selectedTerm.startDate).toLocaleDateString('ru-RU')} — {new Date(selectedTerm.endDate).toLocaleDateString('ru-RU')}
        </Typography>
      )}

      {availableDates.length > 0 && (
        <Box display="flex" gap={1} mb={3} overflow="auto">
          {availableDates.map(date => {
            const weekday = new Date(date).toLocaleDateString('ru-RU', { weekday: 'short', day: '2-digit', month: 'short' });
            return (
              <Button
                key={date}
                variant={date === selectedDate ? 'contained' : 'outlined'}
                onClick={() => setSelectedDate(date)}
              >
                {weekday}
              </Button>
            );
          })}
        </Box>
      )}

      {filteredLessons.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          Нет уроков на выбранную дату.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {filteredLessons.map((lesson, i) => (
            <Grid item xs={12} key={i}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2">
                  {lesson.day} | {lesson.date} | {lesson.startTime}
                </Typography>
                <TextField
                  label="Тема"
                  fullWidth
                  value={lesson.topic}
                  onChange={e => handleChange(lessons.indexOf(lesson), 'topic', e.target.value)}
                  sx={{ mt: 1 }}
                />
                <TextField
                  label="Домашнее задание"
                  fullWidth
                  value={lesson.homework}
                  onChange={e => handleChange(lessons.indexOf(lesson), 'homework', e.target.value)}
                  sx={{ mt: 1 }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarText}
        </Alert>
      </Snackbar>

      <Button variant="contained" sx={{ mt: 3 }} onClick={handleSave}>
        Сохранить
      </Button>
    </Box>
  );
};

export default TeacherLessonTopics;

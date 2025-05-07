import React, { useEffect, useState } from 'react';
import {
  Box, Typography, FormControl, InputLabel, MenuItem, Select, TextField,
  Paper, Button, Grid
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLessonTopics, saveLessonTopics } from '../../redux/lessonTopicRelated/lessonTopicHandle';
import axios from 'axios';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

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

  const schoolId = teacher?.school?._id || teacher?.schoolId;
 
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarText, setSnackbarText] = useState('');

  // 📦 Загрузка классов и четвертей
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

  // Загрузка тем после смены class/subject/term
  useEffect(() => {
    if (!classId || !subjectId || !term) return;
    dispatch(fetchLessonTopics({ classId, subjectId, term }));
  }, [classId, subjectId, term, dispatch]);

  //  Загрузка расписания и привязка тем
  useEffect(() => {
    const loadSchedule = async () => {
      if (!classId || !subjectId || !term || terms.length === 0) return;

      const termInfo = terms.find(t => t.termNumber === Number(term));
      if (!termInfo) return;

      const { data: scheduleData } = await axios.get(
        `/api/schedule/by-teacher-class-subject/${teacher._id}/${classId}/${subjectId}`
      );

      const lessonsForTerm = scheduleData.schedules
        .filter(l => l.type === 'lesson')
        .filter(l => l.type === 'lesson')

        .map(l => {
          const match = topics.find(
            t => t.day === l.day && t.startTime === l.startTime
          );
          return {
            day: l.day,
            startTime: l.startTime,
            topic: match?.topic || '',
            homework: match?.homework || ''
          };
        });

      setLessons(lessonsForTerm);
    };

    loadSchedule();
  }, [topics, terms, classId, subjectId, term, teacher._id]);

  // 🧠 Обработка ввода
  const handleChange = (index, field, value) => {
    const updated = [...lessons];
    updated[index][field] = value;
    setLessons(updated);
  };

  //  Сохранение
  const handleSave = () => {
    dispatch(saveLessonTopics({
      classId,
      subjectId,
      teacherId: teacher._id,
      term: Number(term),
      lessons
    }));
  
    const now = new Date();
    const formatted = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
    setSnackbarText(`Сохранено: ${formatted}`);
    setOpenSnackbar(true);
  };
  

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Темы Уроков</Typography>

      <Box display="flex" gap={2} mt={2} mb={3}>
        <FormControl fullWidth>
          <InputLabel>Класс</InputLabel>
          <Select value={classId} onChange={e => setClassId(e.target.value)}>
            {assignments.map((a, i) => (
              <MenuItem key={i} value={a.sclassId}>{a.sclassName}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Предмет</InputLabel>
          <Select value={subjectId} onChange={e => setSubjectId(e.target.value)}>
            {assignments.map((a, i) => (
              <MenuItem key={i} value={a.subjectId}>{a.subjectName}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Четверть</InputLabel>
          <Select value={term} onChange={e => setTerm(e.target.value)}>
            {[1, 2, 3, 4].map(n => (
              <MenuItem key={n} value={String(n)}>Четверть {n}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {lessons.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          Нет уроков в расписании для выбранной четверти.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {lessons.map((lesson, i) => (
            <Grid item xs={12} key={i}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2">
                  {lesson.day} | {lesson.startTime}
                </Typography>
                <TextField
                  label="Тема"
                  fullWidth
                  value={lesson.topic}
                  onChange={e => handleChange(i, 'topic', e.target.value)}
                  sx={{ mt: 1 }}
                />
                <TextField
                  label="Домашнее задание"
                  fullWidth
                  value={lesson.homework}
                  onChange={e => handleChange(i, 'homework', e.target.value)}
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

import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, TableContainer, Button, TextField, Snackbar, Alert,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { useSelector } from 'react-redux';
import axios from 'axios';

const TeacherSchedule = () => {
  const teacher = useSelector((state) => state.user.currentUser);
  const [assignments, setAssignments] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [topics, setTopics] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [terms, setTerms] = useState([]);
  const [term, setTerm] = useState('1');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const schoolId = teacher?.school?._id || teacher?.schoolId;

  useEffect(() => {
    const fetchAssignments = async () => {
      const res = await axios.get(`/api/teacherSubjectClass/by-teacher/${teacher._id}`);
      setAssignments(res.data);
    };
    if (teacher?._id) fetchAssignments();
  }, [teacher]);

  useEffect(() => {
    const fetchTerms = async () => {
      const res = await axios.get(`/api/terms/${schoolId}`);
      setTerms(res.data);
    };
    if (schoolId) fetchTerms();
  }, [schoolId]);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedClassId || !selectedSubjectId) return;

      const res = await axios.get(`/api/schedule/by-teacher-class-subject/${teacher._id}/${selectedClassId}/${selectedSubjectId}`);
      const lessons = res.data.schedules.filter(s => s.type === 'lesson');
      setSchedule(lessons);

      const topicRes = await axios.get(`/api/lesson-topics`, {
        params: {
          classId: selectedClassId,
          subjectId: selectedSubjectId,
          term: Number(term)
        }
      });

      const allTopics = topicRes.data;
      const topicDates = Array.from(new Set(allTopics.map(t => t.date))).sort();
      setTopics(allTopics);
      setAvailableDates(topicDates);
      setSelectedDate(topicDates[0] || '');
    };

    if (teacher?._id && term) fetchData();
  }, [teacher, term, selectedClassId, selectedSubjectId]);

  const handleChange = (index, field, value) => {
    const updated = [...topics];
    updated[index][field] = value;
    setTopics(updated);
  };

  const handleSave = async () => {
    const filtered = topics.filter(t => t.date === selectedDate);
    try {
      await axios.post('/api/lesson-topics/save', {
        teacherId: teacher._id,
        term: Number(term),
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        lessons: filtered
      });
      setOpenSnackbar(true);
    } catch (err) {
      console.error('Ошибка сохранения тем:', err.message);
    }
  };

  const filteredLessons = topics
    .map((t, i) => {
      if (t.date !== selectedDate) return null;
      const match = schedule.find(s =>
        s.day === t.day &&
        s.startTime === t.startTime
      );
      return {
        index: i,
        time: `${t.startTime} - ${match?.endTime || ''}`,
        topic: t.topic,
        homework: t.homework
      };
    })
    .filter(Boolean);

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>📚 Моё расписание</Typography>

      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel>Класс и предмет</InputLabel>
          <Select
            value={selectedClassId && selectedSubjectId ? `${selectedClassId}_${selectedSubjectId}` : ''}
            onChange={e => {
              const [clsId, subId] = e.target.value.split('_');
              setSelectedClassId(clsId);
              setSelectedSubjectId(subId);
            }}
          >
            {assignments.map((a, i) => (
              <MenuItem key={i} value={`${a.sclassId}_${a.subjectId}`}>
                {a.sclassName} — {a.subjectName}
              </MenuItem>
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

      {availableDates.length > 0 && (
        <Box display="flex" gap={1} mb={3} overflow="auto">
          {availableDates.map(date => {
            const label = new Date(date).toLocaleDateString('ru-RU', {
              weekday: 'short', day: '2-digit', month: 'short'
            });
            return (
              <Button
                key={date}
                variant={date === selectedDate ? 'contained' : 'outlined'}
                onClick={() => setSelectedDate(date)}
              >
                {label}
              </Button>
            );
          })}
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Время</TableCell>
              <TableCell>Тема</TableCell>
              <TableCell>Домашка</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLessons.length > 0 ? (
              filteredLessons.map((lesson) => (
                <TableRow key={lesson.index}>
                  <TableCell>{lesson.time}</TableCell>
                  <TableCell>
                    <TextField
                      variant="standard"
                      fullWidth
                      value={lesson.topic}
                      onChange={e =>
                        handleChange(lesson.index, 'topic', e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      variant="standard"
                      fullWidth
                      value={lesson.homework}
                      onChange={e =>
                        handleChange(lesson.index, 'homework', e.target.value)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Нет уроков на выбранную дату
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Button
        variant="contained"
        sx={{ mt: 3 }}
        onClick={handleSave}
        disabled={filteredLessons.length === 0}
      >
        Сохранить изменения
      </Button>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
          Темы успешно сохранены
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeacherSchedule;

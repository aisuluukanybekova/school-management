import React, { useEffect, useState } from 'react';
import {
  Box, Typography, FormControl, InputLabel, Select, MenuItem, Button,
  Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer, Alert
} from '@mui/material';
import axios from 'axios';
import { useSelector } from 'react-redux';

const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];

const EditSchedulePage = () => {
  const admin = useSelector((state) => state.user.currentUser);
  const schoolId = admin.schoolId || admin.school?._id;

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await axios.get(`/api/classes/school/${schoolId}`);
      setClasses(data);
    };
    fetchData();
  }, [schoolId]);

  useEffect(() => {
    if (!selectedClass) return;
    axios.get(`/api/teacherSubjectClass/assigned/${selectedClass}`)
      .then(res => setAssignedSubjects(res.data))
      .catch(() => setMessage({ type: 'error', text: 'Ошибка загрузки предметов/учителей' }));
  }, [selectedClass]);

  const sanitizeSchedule = (rawLessons) => {
    return rawLessons.map(l => ({
      ...l,
      subjectId: typeof l.subjectId === 'object' ? l.subjectId._id : l.subjectId,
      teacherId: typeof l.teacherId === 'object' ? l.teacherId._id : l.teacherId,
      classId: l.classId?._id || l.classId // гарантия наличия classId
    }));
  };

  const loadSchedule = async () => {
    try {
      const { data } = await axios.get(`/api/schedule/class/${selectedClass}`);
      const filtered = data.schedules
        .filter(s => s.day.trim() === selectedDay.trim() && s.type === 'lesson');
      const cleaned = sanitizeSchedule(filtered);
      setSchedule(cleaned);
      setMessage({ type: '', text: '' });
    } catch {
      setMessage({ type: 'error', text: 'Ошибка загрузки расписания' });
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...schedule];
    updated[index][field] = value;
    if (field === 'subjectId') updated[index].teacherId = ''; // сброс при смене предмета
    setSchedule(updated);
  };

  const getTeachersForSubject = (subjectId) => {
    const assigned = assignedSubjects.find(a => a.subjectId === subjectId);
    return assigned?.teachers || [];
  };

  const saveChanges = async () => {
    const invalid = schedule.find(s =>
      !s.subjectId || !s.teacherId || !s.classId || !s.startTime || !s.endTime || !s.day
    );

    if (invalid) {
      setMessage({ type: 'error', text: '⚠️ Убедитесь, что все строки заполнены полностью.' });
      return;
    }

    try {
      const updates = schedule.map(s =>
        axios.put(`/api/schedule/${s._id}`, {
          subjectId: s.subjectId,
          teacherId: s.teacherId,
          startTime: s.startTime,
          endTime: s.endTime,
          day: s.day,
          classId: s.classId
        })
      );
      await Promise.all(updates);
      setMessage({ type: 'success', text: 'Расписание успешно обновлено ✅' });
    } catch (err) {
      console.error("❌ Ошибка при сохранении:", err?.response?.data);
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Ошибка при сохранении' });
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        ✏️ Редактирование расписания
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>
      )}

      <Box display="flex" gap={2} mb={3}>
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel>Класс</InputLabel>
          <Select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} label="Класс">
            {classes.map(cls => (
              <MenuItem key={cls._id} value={cls._id}>{cls.sclassName}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel>День недели</InputLabel>
          <Select value={selectedDay} onChange={e => setSelectedDay(e.target.value)} label="День недели">
            {daysOfWeek.map(day => (
              <MenuItem key={day} value={day}>{day}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="outlined" onClick={loadSchedule}>Загрузить расписание</Button>
      </Box>

      {schedule.length > 0 && (
        <>
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Время</TableCell>
                  <TableCell>Предмет</TableCell>
                  <TableCell>Учитель</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedule.map((lesson, index) => (
                  <TableRow key={lesson._id}>
                    <TableCell>{lesson.startTime} - {lesson.endTime}</TableCell>
                    <TableCell>
                      <Select
                        value={lesson.subjectId || ''}
                        onChange={e => handleChange(index, 'subjectId', e.target.value)}
                        size="small"
                        fullWidth
                      >
                        {assignedSubjects.map(subj => (
                          <MenuItem key={subj.subjectId} value={subj.subjectId}>{subj.subjectName}</MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={lesson.teacherId || ''}
                        onChange={e => handleChange(index, 'teacherId', e.target.value)}
                        size="small"
                        fullWidth
                      >
                        {getTeachersForSubject(lesson.subjectId).map(t => (
                          <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Button variant="contained" color="success" sx={{ mt: 3 }} onClick={saveChanges}>
            Сохранить изменения
          </Button>
        </>
      )}
    </Box>
  );
};

export default EditSchedulePage;

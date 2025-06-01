import React, { useEffect, useState } from 'react';
import {
  Box, Typography, FormControl, InputLabel, Select, MenuItem,
  Button, Table, TableBody, TableCell, TableHead, TableRow,
  Paper, TableContainer, Alert
} from '@mui/material';
import axios from 'axios';
import { useSelector } from 'react-redux';

const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];

const ruToEnDay = {
  Понедельник: 'Monday',
  Вторник: 'Tuesday',
  Среда: 'Wednesday',
  Четверг: 'Thursday',
  Пятница: 'Friday',
};

const deepClone = (arr) => JSON.parse(JSON.stringify(arr));

function EditSchedulePage() {
  const admin = useSelector((state) => state.user.currentUser);
  const schoolId = admin.schoolId || admin.school?._id;

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [originalSchedule, setOriginalSchedule] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [cabinets, setCabinets] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: classData } = await axios.get(`/api/classes/school/${schoolId}`);
        const { data: cabinetData } = await axios.get(`/api/cabinets/${schoolId}`);
        setClasses(classData);
        setCabinets(cabinetData.cabinets || []);
      } catch {
        setMessage({ type: 'error', text: 'Ошибка загрузки классов и кабинетов' });
      }
    };
    if (schoolId) fetchData();
  }, [schoolId]);

  useEffect(() => {
    if (!selectedClass) return;
    axios
      .get(`/api/teacherSubjectClass/assigned/${selectedClass}`)
      .then((res) => setAssignedSubjects(res.data))
      .catch(() =>
        setMessage({ type: 'error', text: 'Ошибка загрузки предметов/учителей' })
      );
  }, [selectedClass]);

  const sanitizeSchedule = (rawLessons) =>
    rawLessons.map((l) => ({
      _id: l._id,
      subjectId: typeof l.subjectId === 'object' ? l.subjectId._id : String(l.subjectId),
      teacherId: typeof l.teacherId === 'object' ? l.teacherId._id : String(l.teacherId),
      classId: l.classId?._id || l.classId,
      startTime: l.startTime,
      endTime: l.endTime,
      day: l.day,
      room: l.room || '',
    }));

  const loadSchedule = async () => {
    try {
      const { data } = await axios.get(`/api/schedule/class/${selectedClass}`);
      const filtered = data.schedules.filter(
        (s) =>
          s.day.trim() === ruToEnDay[selectedDay] &&
          s.type === 'lesson',
      );
      const cleaned = sanitizeSchedule(filtered);
      setSchedule(cleaned);
      setOriginalSchedule(deepClone(cleaned));
      setMessage({ type: '', text: '' });
    } catch {
      setMessage({ type: 'error', text: 'Ошибка загрузки расписания' });
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...schedule];
    updated[index][field] = value;
    if (field === 'subjectId') updated[index].teacherId = '';
    setSchedule(updated);
  };

  const getTeachersForSubject = (subjectId) => {
    const assigned = assignedSubjects.find((a) => a.subjectId === subjectId);
    return assigned?.teachers || [];
  };

  const isLessonChanged = (lesson, index) => {
    const originalIndex = originalSchedule.findIndex((l) => l._id === lesson._id);
    const original = originalSchedule[originalIndex];
    if (!original) return true;

    const isContentChanged =
      original.subjectId !== lesson.subjectId ||
      original.teacherId !== lesson.teacherId ||
      original.startTime !== lesson.startTime ||
      original.endTime !== lesson.endTime ||
      original.day !== lesson.day ||
      original.room !== lesson.room;

    const isPositionChanged = originalIndex !== index;

    return isContentChanged || isPositionChanged;
  };

  const handleDelete = async (lessonId) => {
    if (!window.confirm('Удалить этот урок из расписания?')) return;

    try {
      await axios.delete(`/api/schedule/${lessonId}`);
      setSchedule((prev) => prev.filter((l) => l._id !== lessonId));
      setMessage({ type: 'success', text: 'Урок успешно удалён' });
    } catch {
      setMessage({ type: 'error', text: 'Ошибка при удалении урока' });
    }
  };

  const saveChanges = async () => {
    const invalid = schedule.find(
      (s) =>
        !s.subjectId ||
        !s.teacherId ||
        !s.classId ||
        !s.startTime ||
        !s.endTime ||
        !s.day ||
        !s.room
    );

    if (invalid) {
      setMessage({
        type: 'error',
        text: 'Убедитесь, что все строки заполнены полностью.',
      });
      return;
    }

    try {
      const changedLessons = schedule.filter((s, i) => isLessonChanged(s, i));

      if (changedLessons.length === 0) {
        setMessage({ type: 'info', text: 'Изменения не обнаружены.' });
        return;
      }

      await Promise.all(
        changedLessons.map((s) =>
          axios.put(`/api/schedule/${s._id}`, {
            subjectId: s.subjectId,
            teacherId: s.teacherId,
            startTime: s.startTime,
            endTime: s.endTime,
            day: s.day,
            classId: s.classId,
            room: s.room,
          })
        )
      );

      setMessage({ type: 'success', text: 'Расписание успешно обновлено' });
      await loadSchedule();
    } catch (err) {
      console.error('Ошибка при сохранении:', err?.response?.data);
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Ошибка при сохранении',
      });
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        ✏️ Редактирование расписания
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Box display="flex" gap={2} mb={3}>
        <FormControl sx={{ minWidth: 180 }} size="small">
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

        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel>День недели</InputLabel>
          <Select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            label="День недели"
          >
            {daysOfWeek.map((day) => (
              <MenuItem key={day} value={day}>
                {day}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="outlined" onClick={loadSchedule}>
          Загрузить расписание
        </Button>
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
                  <TableCell>Кабинет</TableCell>
                  <TableCell>Удалить</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedule.map((lesson, index) => (
                  <TableRow
                    key={lesson._id}
                    sx={{
                      backgroundColor: isLessonChanged(lesson, index)
                        ? '#fff9c4'
                        : 'inherit',
                    }}
                  >
                    <TableCell>
                      {lesson.startTime} - {lesson.endTime}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={lesson.subjectId || ''}
                        onChange={(e) =>
                          handleChange(index, 'subjectId', e.target.value)
                        }
                        size="small"
                        fullWidth
                      >
                        {assignedSubjects.map((subj) => (
                          <MenuItem key={subj.subjectId} value={subj.subjectId}>
                            {subj.subjectName}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={lesson.teacherId || ''}
                        onChange={(e) =>
                          handleChange(index, 'teacherId', e.target.value)
                        }
                        size="small"
                        fullWidth
                      >
                        {getTeachersForSubject(lesson.subjectId).map((t) => (
                          <MenuItem key={t._id} value={t._id}>
                            {t.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={lesson.room || ''}
                        onChange={(e) =>
                          handleChange(index, 'room', e.target.value)
                        }
                        size="small"
                        fullWidth
                        displayEmpty
                      >
                        <MenuItem value="">
                          <em>Не выбран</em>
                        </MenuItem>
                        {cabinets.map((cab) => (
                          <MenuItem key={cab._id} value={cab.name}>
                            {cab.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        color="error"
                        size="small"
                        onClick={() => handleDelete(lesson._id)}
                      >
                        Удалить
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Button
            variant="contained"
            color="success"
            sx={{ mt: 3 }}
            onClick={saveChanges}
          >
            Сохранить изменения
          </Button>
        </>
      )}
    </Box>
  );
}

export default EditSchedulePage;

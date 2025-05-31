import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, FormControl, InputLabel, Select, MenuItem,
  Button, TextField, Table, TableBody, TableCell, TableHead,
  TableRow, CircularProgress, Paper, TableContainer, Alert, Stack,
  Dialog, DialogTitle, DialogContent,
} from '@mui/material';
import { Schedule, Save, Edit } from '@mui/icons-material';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import EditTimeSlots from './EditTimeSlots';

axios.defaults.baseURL = 'http://localhost:5001';

const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];

function AddSchedulePage() {
  const admin = useSelector((state) => state.user.currentUser);
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [cabinets, setCabinets] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [shift, setShift] = useState('first');
  const [lessonCount, setLessonCount] = useState(5);
  const [lessons, setLessons] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openSlotDialog, setOpenSlotDialog] = useState(false);

  const schoolId = admin.schoolId || admin.school?._id;

  const loadTimeSlots = useCallback(async () => {
    if (!schoolId) return;
    try {
      const { data } = await axios.get(`/api/timeslots/${schoolId}?shift=${shift}`);
      setTimeSlots(data);
    } catch {
      setError('Ошибка загрузки временных слотов');
    }
  }, [schoolId, shift]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const { data: classData } = await axios.get(`/api/classes/school/${schoolId}`);
        const { data: cabinetData } = await axios.get(`/api/cabinets/${schoolId}`);
        setClasses(classData);
        setCabinets(cabinetData.cabinets || []);
        await loadTimeSlots();
      } catch {
        setError('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };
    if (schoolId) fetchInitialData();
  }, [schoolId, loadTimeSlots]);

  useEffect(() => {
    if (!selectedClass) return;
    axios
      .get(`/api/teacherSubjectClass/assigned/${selectedClass}`)
      .then((res) => setAssignedSubjects(res.data))
      .catch(() => setError('Ошибка загрузки предметов и учителей'));
  }, [selectedClass]);

  const generateSchedule = () => {
    if (!selectedClass || !selectedDay) {
      alert('Выберите класс и день!');
      return;
    }

    const lessonsOnly = timeSlots
      .filter((slot) => slot.type === 'lesson')
      .sort((a, b) => a.number - b.number)
      .slice(0, lessonCount);

    if (lessonsOnly.length < lessonCount) {
      alert(`Недостаточно уроков в TimeSlots (${lessonsOnly.length} найдено)`);
      return;
    }

    const result = lessonsOnly.map((slot, index) => ({
      number: index + 1,
      subjectId: '',
      teacherId: '',
      room: '',
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));

    setLessons(result);
    setSuccessMessage('');
    setError('');
  };

  const handleLessonChange = (index, field, value) => {
    setLessons((prev) => prev.map((lesson, i) => {
      if (i !== index) return lesson;
      const updated = { ...lesson, [field]: value };
      if (field === 'subjectId') updated.teacherId = '';
      return updated;
    }));
  };

  const getTeachersForSubject = (subjectId) => {
    const found = assignedSubjects.find((a) => a.subjectId === subjectId);
    return found?.teachers || [];
  };

  const saveSchedule = async () => {
    if (!lessons.every((l) => l.subjectId && l.teacherId && l.room)) {
      alert('Заполните все строки расписания, включая кабинет!');
      return;
    }

    try {
      const payload = {
        classId: selectedClass,
        day: selectedDay,
        shift,
        lessons: lessons.map(({ subjectId, teacherId, startTime, endTime, room }) => ({
          subjectId,
          teacherId,
          startTime,
          endTime,
          room,
        })),
      };

      const { data } = await axios.post('/api/schedule/full-day', payload);
      setSuccessMessage(data.message || 'Расписание сохранено.');
      setLessons([]);
    } catch (err) {
      setError(err?.response?.data?.message || 'Ошибка сохранения.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Создание расписания на день
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => setOpenSlotDialog(true)}
          >
            Редактировать время уроков
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => navigate('/admin/edit-schedule')}
            startIcon={<Edit />}
          >
            Редактировать расписание
          </Button>
        </Box>
      </Box>

      <Stack spacing={2} mt={2}>
        {error && <Alert severity="error">{error}</Alert>}
        {successMessage && <Alert severity="success">{successMessage}</Alert>}
      </Stack>

      <Box display="flex" flexWrap="wrap" gap={2} mt={3}>
        {[{
          label: 'Класс',
          value: selectedClass,
          options: classes,
          onChange: setSelectedClass,
          getLabel: (c) => c.sclassName,
          getValue: (c) => c._id,
        }, {
          label: 'День недели',
          value: selectedDay,
          options: daysOfWeek,
          onChange: setSelectedDay,
          getLabel: (d) => d,
          getValue: (d) => d,
        }, {
          label: 'Смена',
          value: shift,
          options: [
            { label: 'Первая смена', value: 'first' },
            { label: 'Вторая смена', value: 'second' },
          ],
          onChange: setShift,
          getLabel: (o) => o.label,
          getValue: (o) => o.value,
        }].map((f) => (
          <FormControl key={f.label} sx={{ minWidth: 180 }} size="small">
            <InputLabel>{f.label}</InputLabel>
            <Select
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              label={f.label}
            >
              {f.options?.map((opt) => (
                <MenuItem key={f.getValue(opt)} value={f.getValue(opt)}>
                  {f.getLabel(opt)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}

        <TextField
          label="Количество уроков"
          type="number"
          size="small"
          value={lessonCount}
          onChange={(e) => setLessonCount(Number(e.target.value))}
          inputProps={{ min: 1, max: 10 }}
        />

        <Button variant="outlined" startIcon={<Schedule />} onClick={generateSchedule}>
          Сгенерировать
        </Button>
      </Box>

      {lessons.length > 0 && (
        <Box mt={4}>
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell align="center">№</TableCell>
                  <TableCell align="center">Начало</TableCell>
                  <TableCell align="center">Конец</TableCell>
                  <TableCell align="center">Предмет</TableCell>
                  <TableCell align="center">Учитель</TableCell>
                  <TableCell align="center">Кабинет</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lessons.map((l) => (
                  <TableRow key={`${l.startTime}-${l.endTime}`} hover>
                    <TableCell align="center">{l.number}</TableCell>
                    <TableCell align="center">{l.startTime}</TableCell>
                    <TableCell align="center">{l.endTime}</TableCell>
                    <TableCell>
                      <Select
                        fullWidth
                        size="small"
                        value={l.subjectId}
                        onChange={(e) => handleLessonChange(l.number - 1, 'subjectId', e.target.value)}
                      >
                        {assignedSubjects.map((s) => (
                          <MenuItem key={s.subjectId} value={s.subjectId}>
                            {s.subjectName}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        fullWidth
                        size="small"
                        value={l.teacherId}
                        onChange={(e) => handleLessonChange(l.number - 1, 'teacherId', e.target.value)}
                      >
                        {getTeachersForSubject(l.subjectId).map((t) => (
                          <MenuItem key={t._id} value={t._id}>
                            {t.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        fullWidth
                        size="small"
                        value={l.room}
                        onChange={(e) => handleLessonChange(l.number - 1, 'room', e.target.value)}
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Button
            variant="contained"
            color="success"
            size="large"
            startIcon={<Save />}
            sx={{ mt: 3 }}
            onClick={saveSchedule}
          >
            Сохранить расписание
          </Button>
        </Box>
      )}

      <Dialog
        open={openSlotDialog}
        onClose={async () => {
          setOpenSlotDialog(false);
          await loadTimeSlots();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Редактирование времени уроков и перемен</DialogTitle>
        <DialogContent>
          <EditTimeSlots />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default AddSchedulePage;

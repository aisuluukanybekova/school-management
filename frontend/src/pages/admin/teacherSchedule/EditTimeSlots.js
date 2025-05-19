import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableHead, TableBody, TableRow, TableCell,
  Button, TextField, Select, MenuItem, IconButton, Paper, Stack, TableContainer
} from '@mui/material';
import { Delete, Save } from '@mui/icons-material';
import axios from 'axios';
import { useSelector } from 'react-redux';

const EditTimeSlots = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ number: '', startTime: '', endTime: '', type: 'lesson' });
  const [shift, setShift] = useState('first');
  const [previewSlots, setPreviewSlots] = useState([]);

  const [autoParams, setAutoParams] = useState({
    start: '08:00',
    lessons: 5,
    lessonDuration: 45,
    shortBreak: 5,
    longBreak: 10
  });

  const schoolId = currentUser?.schoolId || currentUser?.school?._id;

  const fetchSlots = async () => {
    const res = await axios.get(`/api/timeslots/${schoolId}?shift=${shift}`);
    setSlots(res.data);
  };

  useEffect(() => {
    if (schoolId) fetchSlots();
  }, [schoolId, shift]);

  const handleChange = (index, field, value) => {
    const updated = [...slots];
    updated[index][field] = value;
    setSlots(updated);
  };

  const addSlot = async () => {
    const payload = { ...newSlot, schoolId, shift };
    const { data } = await axios.post('/api/timeslots', payload);
    setSlots(prev => [...prev, data]);
    setNewSlot({ number: '', startTime: '', endTime: '', type: 'lesson' });
  };

  const updateSlot = async (slot) => {
    await axios.put(`/api/timeslots/${slot._id}`, slot);
  };

  const deleteSlot = async (id) => {
    await axios.delete(`/api/timeslots/${id}`);
    setSlots(slots.filter(s => s._id !== id));
  };

  const addMinutes = (time, mins) => {
    const [h, m] = time.split(':').map(Number);
    const date = new Date(0, 0, 0, h, m + mins);
    return date.toTimeString().slice(0, 5);
  };

  const generatePreviewSlots = () => {
    const { start, lessons, lessonDuration, shortBreak, longBreak } = autoParams;
    let currentTime = start;
    const generated = [];

    for (let i = 0; i < lessons; i++) {
      const startLesson = currentTime;
      const endLesson = addMinutes(currentTime, lessonDuration);
      generated.push({
        number: generated.length + 1,
        startTime: startLesson,
        endTime: endLesson,
        type: 'lesson'
      });
      currentTime = endLesson;

      if (i < lessons - 1) {
        const breakDuration = i === 2 ? longBreak : shortBreak;
        const endBreak = addMinutes(currentTime, breakDuration);
        generated.push({
          number: generated.length + 1,
          startTime: currentTime,
          endTime: endBreak,
          type: 'break'
        });
        currentTime = endBreak;
      }
    }

    setPreviewSlots(generated);
  };

  const confirmAndSavePreview = async () => {
    const toSave = previewSlots.map(slot => ({
      ...slot,
      schoolId,
      shift
    }));
    await axios.delete(`/api/timeslots/all/${schoolId}?shift=${shift}`);
    await axios.post(`/api/timeslots/bulk`, toSave);
    setPreviewSlots([]);
    fetchSlots();
  };

  return (
    <Box p={4}>
      <Typography variant="h6" mb={2}>Редактирование времени уроков и перемен</Typography>

      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        mb={3}
        sx={{ flexWrap: 'wrap', gap: 2 }}
      >
        <Select value={shift} onChange={(e) => setShift(e.target.value)} size="small">
          <MenuItem value="first">Первая смена</MenuItem>
          <MenuItem value="second">Вторая смена</MenuItem>
        </Select>

        <TextField label="Начало" type="time" size="small" value={autoParams.start}
          onChange={e => setAutoParams(prev => ({ ...prev, start: e.target.value }))} />
        <TextField label="Кол-во уроков" type="number" size="small" value={autoParams.lessons}
          onChange={e => setAutoParams(prev => ({ ...prev, lessons: Number(e.target.value) }))} />
        <TextField label="Урок (мин)" type="number" size="small" value={autoParams.lessonDuration}
          onChange={e => setAutoParams(prev => ({ ...prev, lessonDuration: Number(e.target.value) }))} />
        <TextField label="Перемена" type="number" size="small" value={autoParams.shortBreak}
          onChange={e => setAutoParams(prev => ({ ...prev, shortBreak: Number(e.target.value) }))} />
        <TextField label="Длинная перемена" type="number" size="small" value={autoParams.longBreak}
          onChange={e => setAutoParams(prev => ({ ...prev, longBreak: Number(e.target.value) }))} />
        <Button
          variant="outlined"
          onClick={generatePreviewSlots}
          sx={{ minWidth: 140, height: '40px', fontWeight: 'bold' }}
        >
          АВТОРАСЧЁТ
        </Button>
      </Stack>

      {previewSlots.length > 0 && (
        <Box mb={4}>
          <Typography variant="subtitle1">🔍 Предпросмотр автогенерации</Typography>
          <TableContainer component={Paper} sx={{ mt: 1 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>№</TableCell>
                  <TableCell>Начало</TableCell>
                  <TableCell>Конец</TableCell>
                  <TableCell>Тип</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {previewSlots.map((slot, index) => (
                  <TableRow key={index}>
                    <TableCell>{slot.number}</TableCell>
                    <TableCell>{slot.startTime}</TableCell>
                    <TableCell>{slot.endTime}</TableCell>
                    <TableCell>{slot.type === 'lesson' ? 'Урок' : 'Перемена'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Button onClick={confirmAndSavePreview} variant="contained" sx={{ mt: 2 }}>
            Сохранить сгенерированное расписание
          </Button>
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>№</TableCell>
              <TableCell>Начало</TableCell>
              <TableCell>Конец</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Сохранить</TableCell>
              <TableCell>Удалить</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {slots.map((slot, index) => (
              <TableRow key={slot._id}>
                <TableCell>
                  <TextField value={slot.number} onChange={e => handleChange(index, 'number', e.target.value)} size="small" />
                </TableCell>
                <TableCell>
                  <TextField type="time" value={slot.startTime} onChange={e => handleChange(index, 'startTime', e.target.value)} size="small" />
                </TableCell>
                <TableCell>
                  <TextField type="time" value={slot.endTime} onChange={e => handleChange(index, 'endTime', e.target.value)} size="small" />
                </TableCell>
                <TableCell>
                  <Select value={slot.type} onChange={e => handleChange(index, 'type', e.target.value)} size="small">
                    <MenuItem value="lesson">Урок</MenuItem>
                    <MenuItem value="break">Перемена</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => updateSlot(slot)} color="primary"><Save /></IconButton>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => deleteSlot(slot._id)} color="error"><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell>
                <TextField value={newSlot.number} onChange={e => setNewSlot({ ...newSlot, number: e.target.value })} size="small" />
              </TableCell>
              <TableCell>
                <TextField type="time" value={newSlot.startTime} onChange={e => setNewSlot({ ...newSlot, startTime: e.target.value })} size="small" />
              </TableCell>
              <TableCell>
                <TextField type="time" value={newSlot.endTime} onChange={e => setNewSlot({ ...newSlot, endTime: e.target.value })} size="small" />
              </TableCell>
              <TableCell>
                <Select value={newSlot.type} onChange={e => setNewSlot({ ...newSlot, type: e.target.value })} size="small">
                  <MenuItem value="lesson">Урок</MenuItem>
                  <MenuItem value="break">Перемена</MenuItem>
                </Select>
              </TableCell>
              <TableCell colSpan={2}>
                <Button onClick={addSlot} variant="contained">Добавить</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EditTimeSlots;

import React, { useState } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, TextField, Button } from '@mui/material';
import { daysOfWeek, timeSlots } from './scheduleUtils';

const AddScheduleForm = ({ onAdd }) => {
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');
  const [subject, setSubject] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (day && time && subject) {
      onAdd({ day, time, subject });
      setSubject('');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3, display: 'flex', gap: 2 }}>
      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>День</InputLabel>
        <Select value={day} label="День" onChange={(e) => setDay(e.target.value)}>
          {daysOfWeek.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>Время</InputLabel>
        <Select value={time} label="Время" onChange={(e) => setTime(e.target.value)}>
          {timeSlots.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </Select>
      </FormControl>
      <TextField label="Предмет" value={subject} onChange={(e) => setSubject(e.target.value)} />
      <Button type="submit" variant="contained">Добавить</Button>
    </Box>
  );
};

export default AddScheduleForm;

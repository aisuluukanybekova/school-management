import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Select, MenuItem, FormControl, InputLabel, Button,
  Table, TableHead, TableRow, TableCell, TableBody, TextField
} from '@mui/material';

axios.defaults.baseURL = 'http://localhost:5001';

const AttendanceJournal = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('1');
  const [absentStudents, setAbsentStudents] = useState({});

  const currentDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [classRes, subjectRes] = await Promise.all([
          axios.get('/api/classes'),
          axios.get('/api/subjects')
        ]);
        setClasses(classRes.data);
        setSubjects(subjectRes.data);
      } catch (error) {
        console.error('Ошибка при загрузке данных', error);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedClass) return;
      try {
        const res = await axios.get(`/api/students/class/${selectedClass}`);
        setStudents(res.data);
      } catch (error) {
        console.error('Ошибка при загрузке студентов', error);
      }
    };
    loadStudents();
  }, [selectedClass]);

  const toggleAbsence = (studentId, isAbsent) => {
    setAbsentStudents(prev => ({
      ...prev,
      [studentId]: isAbsent ? 'Absent' : undefined
    }));
  };

  const saveAttendance = async () => {
    try {
      for (const studentId in absentStudents) {
        await axios.put(`/api/journal/attendance/${studentId}`, {
          subName: selectedSubject,
          date: currentDate,
          status: 'Absent'
        });
      }
      alert('Посещаемость сохранена (отмечены только отсутствующие)');
    } catch (error) {
      console.error('Ошибка при сохранении посещаемости', error);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5">Журнал посещаемости</Typography>

      <Box display="flex" gap={2} mt={2}>
        <FormControl fullWidth>
          <InputLabel>Класс</InputLabel>
          <Select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            {classes.map(cls => (
              <MenuItem key={cls._id} value={cls._id}>{cls.sclassName}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Предмет</InputLabel>
          <Select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
            {subjects.map(sub => (
              <MenuItem key={sub._id} value={sub._id}>{sub.subName}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Четверть</InputLabel>
          <Select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)}>
            {["1", "2", "3", "4"].map(term => (
              <MenuItem key={term} value={term}>Четверть {term}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Table sx={{ mt: 3 }}>
        <TableHead>
          <TableRow>
            <TableCell>Ученик</TableCell>
            <TableCell>{currentDate}</TableCell>
            <TableCell>Отсутствует</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map(student => (
            <TableRow key={student._id}>
              <TableCell>{student.name}</TableCell>
              <TableCell>Присутствует</TableCell>
              <TableCell>
                <input
                  type="checkbox"
                  checked={absentStudents[student._id] === 'Absent'}
                  onChange={e => toggleAbsence(student._id, e.target.checked)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button sx={{ mt: 2 }} variant="contained" onClick={saveAttendance}>
        Сохранить посещаемость
      </Button>
    </Box>
  );
};

export default AttendanceJournal;

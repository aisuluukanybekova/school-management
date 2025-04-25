import axios from 'axios';
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Select, MenuItem, FormControl, InputLabel, Button, TextField,
  Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';

axios.defaults.baseURL = 'http://localhost:5001'; 

const GradebookJournal = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('1');
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    const loadClassesAndSubjects = async () => {
      try {
        const [classRes, subjectRes] = await Promise.all([
          axios.get('/api/classes'),
          axios.get('/api/subjects'),
        ]);
        setClasses(classRes.data);
        setSubjects(subjectRes.data);
      } catch (error) {
        console.error('Ошибка при загрузке классов или предметов', error);
      }
    };
    loadClassesAndSubjects();
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
  
  const loadJournal = async () => {
    const res = await axios.get('/api/journal/grades', {
      params: {
        classId: selectedClass,
        subjectId: selectedSubject,
        term: selectedTerm,
      },
    });
    setGrades(res.data.grades || []);
  };

  const handleGradeChange = (studentId, date, value) => {
    const updated = grades.map(entry => {
      if (entry.studentId === studentId) {
        const existing = entry.values.find(v => v.date === date);
        if (existing) {
          existing.grade = value;
        } else {
          entry.values.push({ date, grade: value });
        }
      }
      return entry;
    });
    setGrades(updated);
  };

  const saveJournal = async () => {
    await axios.post('/api/journal/grades', {
      classId: selectedClass,
      subjectId: selectedSubject,
      teacherId: 'teacherId-placeholder',
      term: selectedTerm,
      grades,
    });
    alert('Оценки сохранены');
  };

  const currentDate = new Date().toISOString().split('T')[0];

  return (
    <Box p={3}>
      <Typography variant="h5">Журнал оценок</Typography>

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
            {["1", "2", "3", "4"].map(term => <MenuItem key={term} value={term}>Четверть {term}</MenuItem>)}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={loadJournal}>Загрузить</Button>
      </Box>

      <Table sx={{ mt: 3 }}>
        <TableHead>
          <TableRow>
            <TableCell>Ученик</TableCell>
            <TableCell>{currentDate}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map(student => {
            const studentGrade = grades.find(g => g.studentId === student._id) || { values: [] };
            const todayValue = studentGrade.values.find(v => v.date === currentDate)?.grade || '';
            return (
              <TableRow key={student._id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={todayValue}
                    onChange={e => handleGradeChange(student._id, currentDate, parseInt(e.target.value))}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Button sx={{ mt: 2 }} variant="contained" onClick={saveJournal}>Сохранить</Button>
    </Box>
  );
};

export default GradebookJournal;

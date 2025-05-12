import React, { useEffect, useState } from 'react';
import {
  Box, Typography, FormControl, InputLabel, MenuItem, Select,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Alert, Button
} from '@mui/material';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';

axios.defaults.baseURL = 'http://localhost:5001';

const AttendanceJournal = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [lessonDates, setLessonDates] = useState([]);
  const [report, setReport] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const formatDate = (iso) => {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getFullYear()).slice(2)}`;
  };

  useEffect(() => {
    axios.get('/api/classes')
      .then(res => setClasses(res.data))
      .catch(() => console.error('Ошибка загрузки классов'));
  }, []);

  useEffect(() => {
    if (!selectedClass) return;

    axios.get(`/api/teacherSubjectClass/assigned/${selectedClass}`)
      .then(res => {
        setSubjects(res.data.map(item => ({
          _id: typeof item.subjectId === 'object' ? item.subjectId._id : item.subjectId,
          subName: item.subjectName
        })));
      })
      .catch(() => console.error('Ошибка загрузки предметов'));

    axios.get(`/api/students/class/${selectedClass}`)
      .then(res => {
        console.log('Ученики получены:', res.data);
        setStudents(
          res.data.sort((a, b) =>
            (a.surname || '').localeCompare(b.surname || '')
          )
        );
      })
      .catch(err => {
        console.error('Ошибка загрузки учеников', err);
        setError('Ошибка загрузки учеников');
      });
  }, [selectedClass]);

  const fetchLessonDates = () => {
    axios.get('/api/schedule/lesson-dates', {
      params: {
        classId: selectedClass,
        subjectId: selectedSubject,
        term: selectedTerm
      }
    }).then(res => setLessonDates(res.data || []))
      .catch(() => console.error('Ошибка загрузки дат расписания'));
  };

  const fetchAttendance = () => {
    if (!selectedClass || !selectedSubject || !selectedTerm) return;
    axios.get('/api/attendance', {
      params: { classId: selectedClass, subjectId: selectedSubject, term: selectedTerm }
    }).then(res => {
      setRecords(res.data.records || []);
      fetchLessonDates();
    }).catch(() => setError('Ошибка загрузки посещаемости'));
  };

  const fetchReport = () => {
    if (!selectedClass || !selectedSubject || !selectedTerm) {
      setError('Пожалуйста, выберите класс, предмет и четверть');
      return;
    }

    axios.get('/api/attendance/report', {
      params: { classId: selectedClass, subjectId: selectedSubject, term: selectedTerm }
    })
      .then(res => {
        setReport(res.data || []);
        setError('');
      })
      .catch(() => {
        setReport([]);
        setError('Ошибка загрузки отчёта');
      });
  };

  const handleNavigateToReport = () => {
    if (!selectedClass || !selectedSubject || !selectedTerm) {
      setError('Пожалуйста, выберите класс, предмет и четверть');
      return;
    }

    navigate('/Admin/attendance-report', {
      state: {
        classId: selectedClass,
        subjectId: selectedSubject,
        term: selectedTerm
      }
    });
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(report);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Отчёт по посещаемости');
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'Attendance_Report.xlsx');
  };

  const dateMap = {};
  records.forEach(r => {
    const key = `${new Date(r.date).toISOString().split('T')[0]}_${r.studentId}`;
    dateMap[key] = r.status === 'present' ? ' ' : '-';
  });

  return (
    <Box p={4}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
         Посещаемость учеников
      </Typography>

      <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Класс</InputLabel>
          <Select value={selectedClass} label="Класс" onChange={e => setSelectedClass(e.target.value)}>
            {classes.map(c => (
              <MenuItem key={c._id} value={c._id}>{c.sclassName}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Предмет</InputLabel>
          <Select value={selectedSubject} label="Предмет" onChange={e => setSelectedSubject(e.target.value)}>
            {subjects.map(s => (
              <MenuItem key={s._id} value={s._id}>{s.subName}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Четверть</InputLabel>
          <Select value={selectedTerm} label="Четверть" onChange={e => setSelectedTerm(e.target.value)}>
            {[1, 2, 3, 4].map(t => (
              <MenuItem key={t} value={t}>Четверть {t}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box display="flex" gap={1} alignItems="center">
          <Button variant="outlined" onClick={fetchAttendance}>🔍 Показать</Button>
          <Button variant="contained" color="info" onClick={handleNavigateToReport}> Отчёт</Button>
          {report.length > 0 && (
            <Button variant="contained" color="success" onClick={exportToExcel}> Excel</Button>
          )}
        </Box>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {lessonDates.length > 0 && (
        <TableContainer component={Paper}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={headerCell}>№</TableCell>
                <TableCell sx={headerCell}>Ученик</TableCell>
                {lessonDates.map((d, idx) => (
                  <TableCell key={idx} sx={headerCell}>{formatDate(d)}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((s, i) => (
                <TableRow key={s._id}>
                  <TableCell sx={bodyCell}>{i + 1}</TableCell>
                  <TableCell sx={bodyCell}>{`${s.surname || ''} ${s.name || ''}`}</TableCell>
                  {lessonDates.map(d => {
                    const key = `${new Date(d).toISOString().split('T')[0]}_${s._id}`;
                    return (
                      <TableCell key={key} sx={bodyCellCenter}>
                        {dateMap[key] || ''}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {report.length > 0 && (
        <Box mt={5}>
          <Typography variant="h6" gutterBottom>Отчёт по посещаемости</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>№</TableCell>
                  <TableCell>Ученик</TableCell>
                  <TableCell align="center">Всего</TableCell>
                  <TableCell align="center">Присутствовал</TableCell>
                  <TableCell align="center">Отсутствовал</TableCell>
                  <TableCell align="center">%</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{r.studentName}</TableCell>
                    <TableCell align="center">{r.totalLessons}</TableCell>
                    <TableCell align="center">{r.present}</TableCell>
                    <TableCell align="center">{r.absent}</TableCell>
                    <TableCell align="center">{r.percent}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

// Стили
const headerCell = {
  backgroundColor: '#212121',
  color: 'white',
  fontWeight: 'bold',
  border: '1px solid #ccc',
  whiteSpace: 'nowrap'
};
const bodyCell = {
  border: '1px solid #ccc',
  whiteSpace: 'nowrap'
};
const bodyCellCenter = {
  ...bodyCell,
  textAlign: 'center'
};

export default AttendanceJournal;

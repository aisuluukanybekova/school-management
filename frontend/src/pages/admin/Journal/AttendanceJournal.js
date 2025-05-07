import React, { useEffect, useState } from 'react';
import {
  Box, Typography, FormControl, InputLabel, MenuItem, Select,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, Button
} from '@mui/material';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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

  useEffect(() => {
    axios.get('/api/classes')
      .then(res => setClasses(res.data))
      .catch(() => console.error('Ошибка загрузки классов'));
  }, []);

  useEffect(() => {
    if (selectedClass) {
      axios.get(`/api/teacherSubjectClass/assigned/${selectedClass}`)
        .then(res => {
          const mapped = res.data.map(item => ({
            _id: item.subjectId,
            subName: item.subjectName
          }));
          setSubjects(mapped);
        })
        .catch(() => console.error('Ошибка загрузки предметов'));

      axios.get(`/api/students/class/${selectedClass}`)
        .then(res => setStudents(res.data))
        .catch(() => console.error('Ошибка загрузки учеников'));
    }
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
      params: {
        classId: selectedClass,
        subjectId: selectedSubject,
        term: selectedTerm
      }
    }).then(res => {
      setRecords(res.data.records || []);
      fetchLessonDates();
    }).catch(() => setError('Ошибка загрузки посещаемости'));
  };

  const fetchReport = () => {
    if (!selectedClass || !selectedSubject || !selectedTerm) return;

    axios.get('/api/attendance/report', {
      params: {
        classId: selectedClass,
        subjectId: selectedSubject,
        term: selectedTerm
      }
    }).then(res => setReport(res.data || []))
      .catch(() => setError('Ошибка загрузки отчёта'));
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(report);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Отчёт по посещаемости');

    const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'Attendance_Report.xlsx');
  };

  const dateMap = {};
  records.forEach(r => {
    const key = `${r.date}_${r.studentId}`;
    dateMap[key] = r.status === 'Присутствовал' ? '✓' : '—';
  });

  return (
    <Box p={4}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        📊 Посещаемость учеников
      </Typography>

      <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
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
            {[1, 2, 3, 4].map(term => (
              <MenuItem key={term} value={term}>Четверть {term}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box display="flex" alignItems="center" gap={1}>
          <Button variant="outlined" onClick={fetchAttendance}>🔍 Показать</Button>
          <Button variant="contained" color="info" onClick={fetchReport}>📄 Отчёт</Button>
          {report.length > 0 && (
            <Button variant="contained" color="success" onClick={exportToExcel}>⬇️ Excel</Button>
          )}
        </Box>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {/* Таблица по датам */}
      {lessonDates.length > 0 ? (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Ученик</TableCell>
                {lessonDates.map((d, idx) => (
                  <TableCell key={idx}>{new Date(d).toLocaleDateString()}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map(student => (
                <TableRow key={student._id}>
                  <TableCell>{student.name}</TableCell>
                  {lessonDates.map(d => (
                    <TableCell key={d}>
                      {dateMap[`${d}_${student._id}`] || '✓'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography mt={3}>Нет данных о занятиях по расписанию</Typography>
      )}

      {/* Отчёт */}
      {report.length > 0 && (
        <>
          <Typography variant="h6" mt={5} gutterBottom>
            📄 Отчёт по посещаемости
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Ученик</TableCell>
                  <TableCell align="center">Всего занятий</TableCell>
                  <TableCell align="center">Присутствовал</TableCell>
                  <TableCell align="center">Отсутствовал</TableCell>
                  <TableCell align="center">% посещаемости</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.studentName}</TableCell>
                    <TableCell align="center">{row.totalLessons}</TableCell>
                    <TableCell align="center">{row.present}</TableCell>
                    <TableCell align="center">{row.absent}</TableCell>
                    <TableCell align="center">{row.percent}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};

export default AttendanceJournal;

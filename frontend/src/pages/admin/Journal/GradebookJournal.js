import React, { useEffect, useState } from 'react';
import {
  Box, Typography,
  FormControl, InputLabel, MenuItem, Select,
  Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
  Alert, Button
} from '@mui/material';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';

axios.defaults.baseURL = 'http://localhost:5001';

const GradebookJournal = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [allDates, setAllDates] = useState([]);
  const [error, setError] = useState('');

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  const navigate = useNavigate();

  const formatDate = (iso) => {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(2);
    return `${dd}.${mm}.${yy}`;
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
          _id: item.subjectId,
          subName: item.subjectName
        })));
      })
      .catch(() => console.error('Ошибка загрузки предметов'));

    axios.get(`/api/students/class/${selectedClass}`)
      .then(res => {
        setStudents(res.data.sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(() => console.error('Ошибка загрузки учеников'));
  }, [selectedClass]);

  const fetchGrades = async () => {
    if (!selectedClass || !selectedSubject || !selectedTerm) {
      setError('Выберите класс, предмет и четверть');
      return;
    }
    try {
      const { data: dates } = await axios.get('/api/schedule/lesson-dates', {
        params: { classId: selectedClass, subjectId: selectedSubject, term: selectedTerm }
      });
      setAllDates(dates.map(d => d.split('T')[0]));

      const res = await axios.get('/api/journal/grades', {
        params: { classId: selectedClass, subjectId: selectedSubject, term: selectedTerm }
      });
      const raw = res.data.grades || res.data.gradebook?.grades || [];

      // Построим map для быстрого доступа
      const map = {};
      raw.forEach(ent => {
        ent.values?.forEach(({ date, grade }) => {
          map[`${ent.studentId}_${date.slice(0,10)}`] = grade;
        });
      });
      setGrades(map);
      setError('');
    } catch (e) {
      console.error(e);
      setError('Ошибка загрузки оценок или расписания');
    }
  };

  const fetchReportAndOpen = async () => {
  try {
    const res = await axios.get('/api/journal/grades', {
      params: { classId: selectedClass, subjectId: selectedSubject, term: selectedTerm }
    });
    const raw = res.data.grades || res.data.gradebook?.grades || [];

    const data = students.map(st => {
      const vals = raw.find(r => r.studentId === st._id)?.values || [];
      const nums = vals.map(v => Number(v.grade)).filter(g => !isNaN(g));
      const count = nums.length;
      const avg = count ? (nums.reduce((a,b)=>a+b,0)/count).toFixed(2) : '-';
      return {
        name: st.name,
        rollNum: st.rollNum || '',
        count, average: avg, grades: nums
      };
    });

    // Добавляем сохранение имени предмета:
    const subjectName = subjects.find(s => s._id === selectedSubject)?.subName || 'Предмет не указан';
    localStorage.setItem('selected_subject', subjectName);

    localStorage.setItem('gradebook_report', JSON.stringify(data));
    navigate('/Admin/report');
  } catch (e) {
    console.error(e);
  }
};


  const exportReportToExcel = () => {
    const data = JSON.parse(localStorage.getItem('gradebook_report') || '[]');
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Отчёт');
    const buf = XLSX.write(wb, { bookType:'xlsx', type:'array' });
    saveAs(new Blob([buf]), 'Grade_Report.xlsx');
  };

  return (
    <Box p={4}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Успеваемость учеников
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
        <FormControl sx={{ minWidth:160 }}>
          <InputLabel>Класс</InputLabel>
          <Select value={selectedClass} label="Класс" onChange={e=>setSelectedClass(e.target.value)}>
            {classes.map(c=> <MenuItem key={c._id} value={c._id}>{c.sclassName}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth:160 }}>
          <InputLabel>Предмет</InputLabel>
          <Select value={selectedSubject} label="Предмет" onChange={e=>setSelectedSubject(e.target.value)}>
            {subjects.map(s=> <MenuItem key={s._id} value={s._id}>{s.subName}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth:140 }}>
          <InputLabel>Четверть</InputLabel>
          <Select value={selectedTerm} label="Четверть" onChange={e=>setSelectedTerm(e.target.value)}>
            {[1,2,3,4].map(t=> <MenuItem key={t} value={t}>Четверть {t}</MenuItem>)}
          </Select>
        </FormControl>
        <Box display="flex" gap={1}>
          <Button variant="outlined" onClick={fetchGrades}> Показать</Button>
          <Button variant="contained" color="info" onClick={fetchReportAndOpen}>Отчёт</Button>
          <Button variant="contained" color="success" onClick={exportReportToExcel}>Excel</Button>
        </Box>
      </Box>
      {error && <Alert severity="error">{error}</Alert>}
      {students.length>0 && allDates.length>0 ? (
        <TableContainer component={Paper} sx={{
          width:'100%', borderRadius:2, overflowX:'auto',
          boxShadow:'0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={headerCell}>№</TableCell>
                <TableCell sx={headerCell}>Ученик</TableCell>
                {allDates.map((d,i)=>(
                  <TableCell key={i} sx={headerCell}>{formatDate(d)}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((s,idx)=>(
                <TableRow key={s._id} hover>
                  <TableCell sx={bodyCell}>{idx+1}</TableCell>
                  <TableCell sx={bodyCell}>{s.name}</TableCell>
                  {allDates.map(d=>(
                    <TableCell key={d} sx={bodyCellCenter}>
                      {grades[`${s._id}_${d}`] ?? ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ): (
        <Typography mt={3}>Нет оценок или данных</Typography>
      )}
    </Box>
  );
};

// Общие стили ячеек
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

export default GradebookJournal;

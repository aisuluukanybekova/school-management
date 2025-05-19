import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Typography, Table, TableHead, TableBody, TableRow,
  TableCell, Paper, CircularProgress, FormControl,
  InputLabel, Select, MenuItem, Button, TableSortLabel, TextField, Tabs, Tab
} from '@mui/material';
import { useSelector } from 'react-redux';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

axios.defaults.baseURL = 'http://localhost:5001';

const HomeroomDashboardExtended = () => {
  const teacher = useSelector(state => state.user.currentUser);
  const [data, setData] = useState([]);
  const [term, setTerm] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [tabIndex, setTabIndex] = useState(0);

  const classId = typeof teacher.homeroomFor === 'object'
    ? teacher.homeroomFor._id
    : teacher.homeroomFor;

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        if (!classId) return;
        const res = await axios.get(`/api/teacherSubjectClass/by-class/${classId}`);
        setSubjects(res.data);
      } catch (e) {
        console.error('Ошибка получения предметов:', e);
      }
    };
    fetchSubjects();
  }, [classId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!classId || !term) return;
        setLoading(true);
        const params = { term };
        if (selectedSubject) params.subjectId = selectedSubject;
        const res = await axios.get(`/api/homeroom/class/${classId}/summary`, { params });
        const sorted = [...res.data.students].sort((a, b) =>
          a.name.localeCompare(b.name, 'ru', { sensitivity: 'base' })
        );
        setData(sorted);
      } catch (err) {
        console.error('Ошибка получения данных:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [classId, term, selectedSubject]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedData = [...data].sort((a, b) => {
    const direction = sortConfig.direction === 'asc' ? 1 : -1;
    if (sortConfig.key === 'name') {
      return a.name.localeCompare(b.name, 'ru', { sensitivity: 'base' }) * direction;
    }
    if (sortConfig.key === 'absentCount') {
      return (a.absentCount - b.absentCount) * direction;
    }
    if (sortConfig.key === 'avg') {
      const aAvg = a.grades.reduce((acc, g) => acc + g.avg, 0) / a.grades.length || 0;
      const bAvg = b.grades.reduce((acc, g) => acc + g.avg, 0) / b.grades.length || 0;
      return (aAvg - bAvg) * direction;
    }
    return 0;
  });

  const filteredData = sortedData.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Отчет по успеваемости', 14, 16);
    autoTable(doc, {
      head: [['№', 'ФИО', 'Телефон', 'Пропуски', 'Оценки']],
      body: filteredData.map((s, i) => [
        i + 1,
        s.name.replace(/\n/g, ' '),
        s.phone || '-',
        s.absentCount,
        s.grades.map(g => Math.round(g.avg)).join(', ')
      ])
    });
    doc.save('homeroom-summary.pdf');
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((s, i) => ({
        '№': i + 1,
        'ФИО': s.name.replace(/\n/g, ' '),
        'Телефон': s.phone || '-',
        'Пропуски': s.absentCount,
        'Оценки': s.grades.map(g => Math.round(g.avg)).join(', ')
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Summary');
    XLSX.writeFile(workbook, 'homeroom-summary.xlsx');
  };
const chartData = data.map((s, idx) => {
  const subject = subjects.find(sub => sub.subjectId === selectedSubject);
  const subjectName = subject?.subjectName || '';

  let avg = 0;
  let hasGrade = false;

  if (selectedSubject) {
    const gradeObj = s.grades?.find(g => g.subject === subjectName);
    if (gradeObj && typeof gradeObj.avg === 'number') {
      avg = Math.round(gradeObj.avg);
      hasGrade = true;
    }
  } else {
    const validGrades = s.grades?.map(g => g.avg).filter(n => typeof n === 'number') || [];
    if (validGrades.length) {
      avg = Math.round(validGrades.reduce((a, b) => a + b, 0) / validGrades.length);
      hasGrade = true;
    }
  }

  return {
    name: `${idx + 1}. ${s.name.replace(/\n/g, ' ')}`,
    avg: hasGrade ? avg : 0, // Show 0 if no grade, but render anyway
    absents: typeof s.absentCount === 'number' ? s.absentCount : 0
  };
});


  const termAverageData = [1, 2, 3, 4].map(t => {
    const res = data.filter(s => s.term === t || s.term === undefined);
    const totalGrades = res.flatMap(s => s.grades.map(g => g.avg));
    const avg = totalGrades.length ? totalGrades.reduce((a, b) => a + b, 0) / totalGrades.length : 0;
    return { term: `Четверть ${t}`, avg: Number(avg.toFixed(2)) };
  });

  const gradeSegments = [5, 4, 3, 2].map(grade => ({
    grade,
    count: data.filter(s => {
      const all = s.grades.map(g => g.avg);
      const avg = all.reduce((a, b) => a + b, 0) / (all.length || 1);
      return Math.round(avg) === grade;
    }).length
  }));

  if (loading) return <CircularProgress sx={{ m: 4 }} />;

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Общая информация по классу
      </Typography>

      <Box display="flex" gap={2} flexWrap="wrap" mt={2} mb={3}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="term-label">Четверть</InputLabel>
          <Select labelId="term-label" value={term} label="Четверть" onChange={e => setTerm(e.target.value)}>
            {[1, 2, 3, 4].map(n => (
              <MenuItem key={n} value={n}>Четверть {n}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel id="subject-label">Предмет</InputLabel>
          <Select labelId="subject-label" value={selectedSubject} label="Предмет" onChange={e => setSelectedSubject(e.target.value)}>
            <MenuItem value="">Все предметы</MenuItem>
            {subjects.map((s, i) => (
              <MenuItem key={i} value={s.subjectId}>{s.subjectName}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="outlined" onClick={exportPDF}>Скачать PDF</Button>
        <Button variant="outlined" onClick={exportExcel}>Скачать Excel</Button>
      </Box>

      <Box mt={2} mb={2}>
        <TextField
          label="Поиск ученика"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      <Tabs value={tabIndex} onChange={(_, val) => setTabIndex(val)} sx={{ mb: 3 }}>
        <Tab label="Таблица" />
        <Tab label="Диаграммы" />
      </Tabs>

      {tabIndex === 0 ? (
        <Paper sx={{ overflowX: 'auto', borderRadius: 2, boxShadow: 2 }}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>№</strong></TableCell>
                <TableCell>
                  <TableSortLabel active={sortConfig.key === 'name'} direction={sortConfig.direction} onClick={() => handleSort('name')}>
                    ФИО
                  </TableSortLabel>
                </TableCell>
                <TableCell><strong>Телефон</strong></TableCell>
                <TableCell>
                  <TableSortLabel active={sortConfig.key === 'absentCount'} direction={sortConfig.direction} onClick={() => handleSort('absentCount')}>
                    Пропуски
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel active={sortConfig.key === 'avg'} direction={sortConfig.direction} onClick={() => handleSort('avg')}>
                    Оценки
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">Нет совпадений</TableCell>
                </TableRow>
              ) : (
                filteredData.map((s, i) => (
                  <TableRow key={s._id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{s.name.replace(/\n/g, ' ')}</TableCell>
                    <TableCell>{s.phone || '-'}</TableCell>
                    <TableCell>{s.absentCount}</TableCell>
                    <TableCell>{s.grades.map(g => Math.round(g.avg)).join(', ') || '—'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
      ) : (
        <Box>
          {chartData.length > 0 && (
            <Box mt={4}>
              {selectedSubject && (
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Успеваемость по предмету
                </Typography>
              )}
            <ResponsiveContainer width="100%" height={500}>
  <BarChart
    layout="vertical"
    data={chartData}
    margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis type="number" domain={[0, 5]} />
    <YAxis
      type="category"
      dataKey="name"
      width={200}
      interval={0} 
      tick={{ fontSize: 12 }}
    />
    <Tooltip />
    {selectedSubject && <Bar dataKey="avg" radius={[0, 4, 4, 0]} />}
  </BarChart>
</ResponsiveContainer>

            </Box>
          )}

        <Box mt={6}>
  <Typography variant="h6" fontWeight="bold" gutterBottom>
    Пропуски по ученикам 
  </Typography>
  <ResponsiveContainer width="100%" height={500}>
    <BarChart layout="vertical" data={chartData} margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis type="number" />
      <YAxis
        type="category"
        dataKey="name"
        width={200}
        interval={0} //  Показывает всех учеников
        tick={{ fontSize: 12 }}
      />
      <Tooltip />
      <Bar dataKey="absents" radius={[0, 4, 4, 0]} />
    </BarChart>
  </ResponsiveContainer>
</Box>


          <Box mt={6}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Средний балл по четвертям
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={termAverageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="term" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avg" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Box>

          <Box mt={6}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Распределение по средним оценкам 
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeSegments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" label={{ value: 'Оценка', position: 'insideBottom', offset: -5 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default HomeroomDashboardExtended;

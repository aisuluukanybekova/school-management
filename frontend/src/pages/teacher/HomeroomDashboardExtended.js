import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Typography, Table, TableHead, TableBody, TableRow,
  TableCell, Paper, CircularProgress, FormControl,
  InputLabel, Select, MenuItem, Button, TableSortLabel, TextField
} from '@mui/material';
import { useSelector } from 'react-redux';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
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
        s.name,
        s.phone || '-',
        s.absentCount,
        s.grades.map(g => g.avg).join(', ')
      ])
    });
    doc.save('homeroom-summary.pdf');
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((s, i) => ({
        '№': i + 1,
        'ФИО': s.name,
        'Телефон': s.phone || '-',
        'Пропуски': s.absentCount,
        'Оценки': s.grades.map(g => g.avg).join(', ')
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Summary');
    XLSX.writeFile(workbook, 'homeroom-summary.xlsx');
  };

  const chartData = filteredData.map(s => ({
    name: s.name,
    avg: selectedSubject
      ? s.grades.find(g => g.subject === subjects.find(sub => sub.subjectId === selectedSubject)?.subjectName)?.avg || 0
      : 0,
    absents: s.absentCount
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

      <Paper sx={{ overflowX: 'auto', borderRadius: 2, boxShadow: 2 }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>№</strong></TableCell>
              <TableCell sortDirection={sortConfig.key === 'name' ? sortConfig.direction : false}>
                <TableSortLabel
                  active={sortConfig.key === 'name'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('name')}
                >
                  ФИО
                </TableSortLabel>
              </TableCell>
              <TableCell><strong>Телефон</strong></TableCell>
              <TableCell sortDirection={sortConfig.key === 'absentCount' ? sortConfig.direction : false}>
                <TableSortLabel
                  active={sortConfig.key === 'absentCount'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('absentCount')}
                >
                  Пропуски
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortConfig.key === 'avg' ? sortConfig.direction : false}>
                <TableSortLabel
                  active={sortConfig.key === 'avg'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('avg')}
                >
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
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.phone || '-'}</TableCell>
                  <TableCell>{s.absentCount}</TableCell>
                  <TableCell>{s.grades.map(g => g.avg).join(', ') || '—'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {selectedSubject && chartData.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Успеваемость по предмету
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={80} />
              <YAxis allowDecimals={false} domain={[0, 5]} />
              <Tooltip />
              <Bar dataKey="avg" fill="#1976d2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}

      {chartData.length > 0 && (
        <Box mt={6}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Пропуски по ученикам
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={80} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="absents" fill="#ef5350" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
};

export default HomeroomDashboardExtended;

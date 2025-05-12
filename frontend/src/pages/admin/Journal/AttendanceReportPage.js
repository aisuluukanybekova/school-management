import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Alert, Button
} from '@mui/material';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const AttendanceReportPage = () => {
  const location = useLocation();
  const { classId, subjectId, term } = location.state || {};

  const [report, setReport] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!classId || !subjectId || !term) {
      setError('Недостаточно данных для отчёта');
      return;
    }

    axios.get('/api/attendance/report', {
      params: { classId, subjectId, term }
    })
      .then(res => setReport(res.data || []))
      .catch(() => setError('Ошибка загрузки отчёта'));
  }, [classId, subjectId, term]);

  const exportToExcel = () => {
    const data = report.map((r, i) => ({
      '№': i + 1,
      'Ученик': r.studentName,
      'Всего': r.totalLessons,
      'Присутствовал': r.present,
      'Отсутствовал': r.absent,
      '%': r.percent
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Отчёт');
    const buf = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'Отчёт_по_посещаемости.xlsx');
  };

  return (
    <Box p={4}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        📄 Отчёт по посещаемости
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      {!error && report.length > 0 && (
        <>
          <Box mb={2}>
            <Button variant="contained" color="success" onClick={exportToExcel}>
              ⬇️ Excel
            </Button>
          </Box>

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
        </>
      )}

      {!error && report.length === 0 && (
        <Alert severity="info">Данные для отчёта не найдены</Alert>
      )}
    </Box>
  );
};

export default AttendanceReportPage;

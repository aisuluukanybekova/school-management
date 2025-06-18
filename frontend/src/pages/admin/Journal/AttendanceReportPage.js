import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Alert, Button,
} from '@mui/material';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// CSS стили для печати
const printStyle = `
@media print {
  body * {
    visibility: hidden;
  }
  .print-area, .print-area * {
    visibility: visible;
  }
  .print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    padding: 20px;
  }
}
`;

function AttendanceReportPage() {
  const location = useLocation();
  const {
    classId, subjectId, term, subjectName,
  } = location.state || {};
  const [report, setReport] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!classId || !subjectId || !term) {
      setError('Недостаточно данных для отчёта');
      return;
    }

    axios.get('/api/attendance/report', {
      params: { classId, subjectId, term },
    })
      .then((res) => setReport(res.data || []))
      .catch(() => setError('Ошибка загрузки отчёта'));
  }, [classId, subjectId, term]);

  const exportToExcel = () => {
    const data = report.map((r, i) => ({
      '№': i + 1,
      Ученик: r.studentName,
      'Всего занятий': r.totalLessons,
      Отсутствовал: r.absent,
      '%': r.percent,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Отчёт');
    const buf = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'Отчёт_по_посещаемости.xlsx');
  };

  return (
    <>
      {/* Вставка стилей для печати */}
      <style>{printStyle}</style>

      <Box p={4}>
        {/* Обернули печатную часть */}
        <div className="print-area">
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            📄 Отчёт по посещаемости
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Предмет: <strong>{subjectName || 'Неизвестен'}</strong>
          </Typography>

          {!error && report.length > 0 && (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>№</TableCell>
                    <TableCell>Ученик</TableCell>
                    <TableCell align="center">Всего занятий</TableCell>
                    <TableCell align="center">Отсутствовал</TableCell>
                    <TableCell align="center">%</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.map((r, i) => (
                    <TableRow key={r.studentId || `${r.studentName}-${r.totalLessons}-${i}`}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{r.studentName}</TableCell>
                      <TableCell align="center">{r.totalLessons}</TableCell>
                      <TableCell align="center">{r.absent}</TableCell>
                      <TableCell align="center">{r.percent}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {!error && report.length === 0 && (
            <Alert severity="info">Данные для отчёта не найдены</Alert>
          )}
        </div>

        {/* Кнопки только для экрана */}
        {!error && report.length > 0 && (
          <Box mt={2} sx={{ display: 'flex', gap: 2 }} className="no-print">
            <Button variant="contained" color="success" onClick={exportToExcel}>
              Excel
            </Button>
            <Button variant="contained" color="primary" onClick={() => window.print()}>
              Печать
            </Button>
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}
      </Box>
    </>
  );
}

export default AttendanceReportPage;

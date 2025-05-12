import React from 'react';
import {
  Box, Typography, Table, TableContainer, TableHead, TableBody,
  TableRow, TableCell, Paper, Button
} from '@mui/material';

const GradebookReport = () => {
  const raw = JSON.parse(localStorage.getItem('gradebook_report') || '[]');

  // Если в report ещё нет rollNum, добавим пустое поле
  const report = raw.map((r, i) => ({
    ...r,
    rollNum: r.rollNum || `—`, // можно заменить если есть номера
    min: r.grades?.length ? Math.min(...r.grades) : '—',
    max: r.grades?.length ? Math.max(...r.grades) : '—',
    weak: r.grades?.filter(g => g < 3).length || 0,
    status: r.average !== '-' && r.average < 3 ? 'Поддержка' : 'Успевает'
  }));

  const handlePrint = () => window.print();

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">
          📄 Отчёт по успеваемости
        </Typography>
        <Button variant="outlined" onClick={handlePrint}>
          🖨️ Печать
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>№</TableCell>
              <TableCell>ФИО</TableCell>
              <TableCell align="center">Номер</TableCell>
              <TableCell align="center">Оценок</TableCell>
              <TableCell align="center">Средний</TableCell>
              <TableCell align="center">Мин</TableCell>
              <TableCell align="center">Макс</TableCell>
              <TableCell align="center">&lt; 3</TableCell>
              <TableCell align="center">Статус</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {report.map((r, i) => (
              <TableRow key={i}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell align="center">{r.rollNum}</TableCell>
                <TableCell align="center">{r.count}</TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: r.average !== '-' && r.average < 3 ? 'red' : 'inherit',
                    fontWeight: r.average !== '-' && r.average < 3 ? 'bold' : 'normal'
                  }}
                >
                  {r.average}
                </TableCell>
                <TableCell align="center">{r.min ?? '—'}</TableCell>
                <TableCell align="center">{r.max ?? '—'}</TableCell>
                <TableCell align="center">{r.weak}</TableCell>
                <TableCell align="center">
                  {r.status === 'Поддержка'
                    ? <span style={{ color: 'red', fontWeight: 600 }}>{r.status}</span>
                    : r.status}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default GradebookReport;

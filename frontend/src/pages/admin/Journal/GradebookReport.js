import React from 'react';
import {
  Box, Typography, Table, TableContainer, TableHead, TableBody,
  TableRow, TableCell, Paper, Button,
} from '@mui/material';


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
    top: 0;
    left: 0;
    width: 100%;
    padding: 20px;
    background-color: white;
  }
  .no-print {
    display: none;
  }
}
`;

function GradebookReport() {
  const raw = JSON.parse(localStorage.getItem('gradebook_report') || '[]');
  const subject = localStorage.getItem('selected_subject') || 'Предмет не указан';

  const report = raw.map((r) => {
    const roundedAverage = r.average !== '-' ? Math.round(r.average) : '-';

    return {
      ...r,
      rollNum: r.rollNum || '—',
      min: r.grades?.length ? Math.min(...r.grades) : '—',
      max: r.grades?.length ? Math.max(...r.grades) : '—',
      weak: r.grades?.filter((g) => g < 3).length || 0,
      final: roundedAverage,
      status: roundedAverage !== '-' && roundedAverage < 3 ? 'Поддержка' : 'Успевает',
    };
  });

  const handlePrint = () => window.print();

  return (
    <>
      {/* Вставка стилей для печати */}
      <style>{printStyle}</style>

      <Box p={4}>
        {/* Область, которая будет напечатана */}
        <div className="print-area">
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            📄 Отчёт по успеваемости
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Предмет: <strong>{subject}</strong>
          </Typography>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>№</TableCell>
                  <TableCell>ФИО</TableCell>
                  <TableCell align="center">Номер</TableCell>
                  <TableCell align="center">Оценок</TableCell>
                  <TableCell align="center">Итог</TableCell>
                  <TableCell align="center">Мин</TableCell>
                  <TableCell align="center">Макс</TableCell>
                  <TableCell align="center">&lt; 3</TableCell>
                  <TableCell align="center">Статус</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.map((r, idx) => (
                  <TableRow key={`${r.name}-${r.rollNum}`}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell align="center">{r.rollNum}</TableCell>
                    <TableCell align="center">{r.count}</TableCell>
                    <TableCell
                      align="center"
                      style={{
                        color: r.final !== '-' && r.final < 3 ? 'red' : 'inherit',
                        fontWeight: r.final !== '-' && r.final < 3 ? 'bold' : 'normal',
                      }}
                    >
                      {r.final}
                    </TableCell>
                    <TableCell align="center">{r.min}</TableCell>
                    <TableCell align="center">{r.max}</TableCell>
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
        </div>

        {/* Кнопка печати только для экрана */}
        <Box mt={2} className="no-print">
          <Button variant="contained" onClick={handlePrint}>🖨️ Печать</Button>
        </Box>
      </Box>
    </>
  );
}

export default GradebookReport;

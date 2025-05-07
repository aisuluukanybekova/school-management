import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TableContainer
} from '@mui/material';
import { differenceInBusinessDays, format } from 'date-fns';
import ruLocale from 'date-fns/locale/ru';

axios.defaults.baseURL = 'http://localhost:5001';

const TermOverview = ({ schoolId }) => {
  const [terms, setTerms] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!schoolId) return;

    axios.get(`/api/terms/school/${schoolId}`)
      .then(res => setTerms(res.data))
      .catch(err => {
        console.error('Ошибка загрузки четвертей:', err);
        setError('Не удалось загрузить данные о четвертях');
      });
  }, [schoolId]);

  const formatDate = (dateStr) =>
    format(new Date(dateStr), 'dd MMMM yyyy', { locale: ruLocale });

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        📅 Четверти и учебные дни
      </Typography>

      {error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell align="center"><b>№</b></TableCell>
                <TableCell align="center"><b>Начало</b></TableCell>
                <TableCell align="center"><b>Окончание</b></TableCell>
                <TableCell align="center"><b>Учебных дней</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {terms.map((term, idx) => (
                <TableRow
                  key={term._id}
                  hover
                  sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}
                >
                  <TableCell align="center">{term.termNumber || idx + 1}</TableCell>
                  <TableCell align="center">{formatDate(term.startDate)}</TableCell>
                  <TableCell align="center">{formatDate(term.endDate)}</TableCell>
                  <TableCell align="center">
                    {differenceInBusinessDays(new Date(term.endDate), new Date(term.startDate)) + 1}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default TermOverview;

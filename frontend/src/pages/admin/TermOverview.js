import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
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
  TableContainer,
} from '@mui/material';
import { format, isWeekend, eachDayOfInterval } from 'date-fns';
import ruLocale from 'date-fns/locale/ru';

axios.defaults.baseURL = 'http://localhost:5001';

const KYRGYZ_HOLIDAYS = [
  '01-01', '08-03', '21-03',
  '01-05', '05-05', '09-05', '31-08', '07-11',
];

const isHolidayInKyrgyzstan = (date) => {
  const dayMonth = format(date, 'dd-MM');
  return KYRGYZ_HOLIDAYS.includes(dayMonth);
};

const countSchoolDays = (startDate, endDate) => {
  const days = eachDayOfInterval({ start: new Date(startDate), end: new Date(endDate) });
  return days.filter((date) => !isWeekend(date) && !isHolidayInKyrgyzstan(date)).length;
};

const countHolidaysInRange = (startDate, endDate) => {
  const days = eachDayOfInterval({ start: new Date(startDate), end: new Date(endDate) });
  return days.filter((date) => isHolidayInKyrgyzstan(date)).length;
};

function TermOverview({ schoolId }) {
  const [terms, setTerms] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!schoolId) return;

    axios.get(`/api/terms/school/${schoolId}`)
      .then((res) => setTerms(res.data))
      .catch((err) => {
        console.error('Ошибка загрузки четвертей:', err);
        setError('Не удалось загрузить данные о четвертях');
      });
  }, [schoolId]);

  const formatDate = (dateStr) => format(new Date(dateStr), 'dd MMMM yyyy', { locale: ruLocale });

  const totalDays = terms.reduce((sum, term) => (
    sum + countSchoolDays(term.startDate, term.endDate)
  ), 0);

  const maxHolidays = Math.max(
    ...terms.map((term) => countHolidaysInRange(term.startDate, term.endDate)),
  );

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Учебные дни
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
                <TableCell align="center"><b>Праздников</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {terms.map((term, idx) => {
                const daysCount = countSchoolDays(term.startDate, term.endDate);
                const holidaysCount = countHolidaysInRange(term.startDate, term.endDate);

                return (
                  <TableRow
                    key={term._id}
                    hover
                    sx={{
                      '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                      backgroundColor:
                        holidaysCount === maxHolidays ? '#ffe0e0' : undefined,
                    }}
                  >
                    <TableCell align="center">{term.termNumber || idx + 1}</TableCell>
                    <TableCell align="center">{formatDate(term.startDate)}</TableCell>
                    <TableCell align="center">{formatDate(term.endDate)}</TableCell>
                    <TableCell align="center">{daysCount}</TableCell>
                    <TableCell align="center">{holidaysCount}</TableCell>
                  </TableRow>
                );
              })}

              <TableRow sx={{ backgroundColor: '#e0f7fa' }}>
                <TableCell align="right" colSpan={3}><b>Итого</b></TableCell>
                <TableCell align="center"><b>{totalDays}</b></TableCell>
                <TableCell align="center">—</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

//  PropTypes
TermOverview.propTypes = {
  schoolId: PropTypes.string.isRequired,
};

export default TermOverview;

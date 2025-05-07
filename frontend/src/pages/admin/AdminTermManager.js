import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Button, Paper, TableContainer
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { useSelector } from 'react-redux';

axios.defaults.baseURL = 'http://localhost:5001';

const AdminTermManager = () => {
  const admin = useSelector((state) => state.user.currentUser);
  const schoolId = admin?._id;

  const [terms, setTerms] = useState([]);

  useEffect(() => {
    if (!schoolId) return;

    axios.get(`/api/terms/school/${schoolId}`)
      .then(res => setTerms(res.data))
      .catch(err => console.error("Ошибка при загрузке четвертей:", err));
  }, [schoolId]);

  const handleChange = (termNumber, field, value) => {
    setTerms(prev => {
      const updated = [...prev];
      const index = updated.findIndex(t => t.termNumber === termNumber);
      if (index !== -1) {
        updated[index] = { ...updated[index], [field]: value };
      } else {
        updated.push({
          termNumber,
          startDate: field === 'startDate' ? value : '',
          endDate: field === 'endDate' ? value : '',
          school: schoolId
        });
      }
      return updated;
    });
  };

  const getWeekdaysCount = (start, end) => {
    let count = 0;
    let current = new Date(start);
    const last = new Date(end);
    while (current <= last) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  const saveTerm = async (termNumber) => {
    const term = terms.find(t => t.termNumber === termNumber);
    if (!term) return;

    if (!schoolId) {
      alert("Ошибка: schoolId отсутствует");
      return;
    }

    if (!term.startDate || !term.endDate) {
      alert("Введите обе даты");
      return;
    }

    if (new Date(term.startDate) > new Date(term.endDate)) {
      alert("Дата начала должна быть раньше даты окончания");
      return;
    }

    const workingDays = getWeekdaysCount(term.startDate, term.endDate);
    const payload = {
      ...term,
      school: schoolId,
      workingDays,
      startDate: new Date(term.startDate).toISOString(),
      endDate: new Date(term.endDate).toISOString()
    };

    try {
      const response = term._id
        ? await axios.put(`/api/terms/${term._id}`, payload)
        : await axios.post(`/api/terms`, payload);

      alert(`Сохранено! Учебных дней: ${workingDays}`);
      const res = await axios.get(`/api/terms/school/${schoolId}`);
      setTerms(res.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Неизвестная ошибка";
      alert(`Ошибка сохранения: ${errorMessage}`);
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        📘 Управление учебными четвертями
      </Typography>

      <TableContainer component={Paper} elevation={4}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell align="center"><b>№</b></TableCell>
              <TableCell align="center"><b>Начало</b></TableCell>
              <TableCell align="center"><b>Окончание</b></TableCell>
              <TableCell align="center"><b>Действие</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {[1, 2, 3, 4].map((num) => {
              const term = terms.find(t => t.termNumber === num) || { termNumber: num };
              return (
                <TableRow
                  key={num}
                  hover
                  sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}
                >
                  <TableCell align="center">{num}</TableCell>
                  <TableCell align="center">
                    <TextField
                      type="date"
                      size="small"
                      value={term.startDate?.slice(0, 10) || ''}
                      onChange={(e) => handleChange(num, 'startDate', e.target.value)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      type="date"
                      size="small"
                      value={term.endDate?.slice(0, 10) || ''}
                      onChange={(e) => handleChange(num, 'endDate', e.target.value)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<Save />}
                      onClick={() => saveTerm(num)}
                    >
                      Сохранить
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminTermManager;

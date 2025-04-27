import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Button
} from '@mui/material';
import { useSelector } from 'react-redux';

axios.defaults.baseURL = 'http://localhost:5001';

const AdminTermManager = () => {
  const admin = useSelector((state) => state.user.currentUser);
  const schoolId = admin?._id;

  const [terms, setTerms] = useState([]);

  useEffect(() => {
    if (!schoolId) {
      console.error("schoolId отсутствует");
      return;
    }

    axios.get(`/api/terms/${schoolId}`)
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

  const isValidTerm = (term) => {
    return term.startDate && term.endDate && new Date(term.startDate) <= new Date(term.endDate);
  };

  const saveTerm = async (termNumber) => {
    const term = terms.find(t => t.termNumber === termNumber);
    if (!term) return;
  
    if (!schoolId) {
      alert("Ошибка: schoolId отсутствует");
      return;
    }
  
    // Улучшенная валидация
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
      // Явное преобразование дат в ISO-формат
      startDate: new Date(term.startDate).toISOString(),
      endDate: new Date(term.endDate).toISOString()
    };
  
    try {
      const response = term._id
        ? await axios.put(`/api/terms/${term._id}`, payload)
        : await axios.post(`/api/terms`, payload);
      
      alert(`Сохранено успешно! Учебных дней: ${workingDays}`);
      // Обновляем данные после сохранения
      const res = await axios.get(`/api/terms/${schoolId}`);
      setTerms(res.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          "Неизвестная ошибка";
      console.error("Полная ошибка:", err.response || err);
      alert(`Ошибка сохранения: ${errorMessage}`);
    }
  };
  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Управление учебными четвертями
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>№</TableCell>
            <TableCell>Начало</TableCell>
            <TableCell>Конец</TableCell>
            <TableCell>Сохранить</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[1, 2, 3, 4].map((num) => {
            const term = terms.find(t => t.termNumber === num) || { termNumber: num };
            return (
              <TableRow key={num}>
                <TableCell>{num}</TableCell>
                <TableCell>
                  <TextField
                    type="date"
                    value={term.startDate?.slice(0, 10) || ''}
                    onChange={(e) => handleChange(num, 'startDate', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="date"
                    value={term.endDate?.slice(0, 10) || ''}
                    onChange={(e) => handleChange(num, 'endDate', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Button variant="contained" onClick={() => saveTerm(num)}>
                    СОХРАНИТЬ
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
};

export default AdminTermManager;

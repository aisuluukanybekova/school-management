import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Button
} from '@mui/material';

axios.defaults.baseURL = 'http://localhost:5001';

const AdminTermManager = ({ schoolId }) => {
  const [terms, setTerms] = useState([]);

  useEffect(() => {
    if (!schoolId) return;
    axios.get(`/api/terms/${schoolId}`)
      .then(res => setTerms(res.data))
      .catch(err => console.error("Ошибка при загрузке четвертей", err));
  }, [schoolId]);

  const handleChange = (termNumber, field, value) => {
    setTerms(prev => {
      const existingIndex = prev.findIndex(t => t.termNumber === termNumber);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], [field]: value };
        return updated;
      } else {
        return [...prev, {
          termNumber,
          startDate: field === 'startDate' ? value : '',
          endDate: field === 'endDate' ? value : '',
          school: schoolId
        }];
      }
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

  const saveTerm = async (term) => {
    const workingDays = getWeekdaysCount(term.startDate, term.endDate);
    console.log('schoolId из пропса:', schoolId);
    const payload = {
      termNumber: term.termNumber,
      startDate: term.startDate,
      endDate: term.endDate,
      workingDays,
      school: schoolId,
    };
  
    console.log("📦 payload", payload);
  
    try {
      if (term._id) {
        await axios.put(`/api/terms/${term._id}`, payload);
      } else {
        await axios.post('/api/terms', payload);
      }
      alert(`✅ Сохранено. Учебных дней: ${workingDays}`);
    } catch (err) {
      console.error("❌ Ошибка при сохранении", err.response?.data || err);
      alert("❌ Ошибка при сохранении");
    }
  };
  

  return (
    <Box p={3}>
      <Typography variant="h5">Настройка четвертей</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>№ Четверти</TableCell>
            <TableCell>Дата начала</TableCell>
            <TableCell>Дата окончания</TableCell>
            <TableCell>Сохранить</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[1, 2, 3, 4].map(num => {
            const term = terms.find(t => t.termNumber === num) || {};
            return (
              <TableRow key={num}>
                <TableCell>{num}</TableCell>
                <TableCell>
                  <TextField
                    type="date"
                    value={term.startDate?.slice(0, 10) || ''}
                    onChange={e => handleChange(num, 'startDate', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="date"
                    value={term.endDate?.slice(0, 10) || ''}
                    onChange={e => handleChange(num, 'endDate', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                <Button variant="contained" onClick={() => {
  const term = terms.find(t => t.termNumber === num);
  if (!term || !term.startDate || !term.endDate) {
    alert("Заполните обе даты!");
    return;
  }
  saveTerm(term);
}}>
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

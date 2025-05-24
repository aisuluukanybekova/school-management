import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, TextField, MenuItem, Button, Snackbar, Alert,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const REACT_APP_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5001';

function StudentProfile() {
  const { id } = useParams();
  const [student, setStudent] = useState({});
  const [classList, setClassList] = useState([]);
  const [newClassId, setNewClassId] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentRes = await axios.get(`${REACT_APP_BASE_URL}/api/students/${id}`);
        setStudent(studentRes.data);

        const schoolId = studentRes.data.school?._id || studentRes.data.school;
        const classRes = await axios.get(`${REACT_APP_BASE_URL}/api/sclasses/${schoolId}`);
        setClassList(classRes.data);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        setErrorMessage('Ошибка загрузки данных');
        setSnackbarOpen(true);
      }
    };
    fetchData();
  }, [id]);

  const handleClassChange = async () => {
    try {
      await axios.put(`${REACT_APP_BASE_URL}/api/students/${id}`, { sclassName: newClassId });
      setSnackbarOpen(true);
      setErrorMessage('Ученик успешно переведён');
    } catch (err) {
      console.error('Ошибка при смене класса:', err);
      setErrorMessage('Ошибка при переводе ученика');
      setSnackbarOpen(true);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Профиль ученика</Typography>
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography>
          <strong>Имя:</strong>
          {' '}
          {student.name}
        </Typography>
        <Typography>
          <strong>Номер:</strong>
          {' '}
          {student.rollNum}
        </Typography>
        <Typography>
          <strong>Класс:</strong>
          {' '}
          {student.sclassName?.sclassName}
        </Typography>

        <Box mt={2}>
          <TextField
            select
            fullWidth
            label="Перевести в другой класс"
            value={newClassId}
            onChange={(e) => setNewClassId(e.target.value)}
          >
            {classList.map((cls) => (
              <MenuItem key={cls._id} value={cls._id}>{cls.sclassName}</MenuItem>
            ))}
          </TextField>
          <Button
            sx={{ mt: 2 }}
            variant="contained"
            onClick={handleClassChange}
            disabled={!newClassId}
          >
            СОХРАНИТЬ ПЕРЕВОД
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={errorMessage.includes('успешно') ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default StudentProfile;

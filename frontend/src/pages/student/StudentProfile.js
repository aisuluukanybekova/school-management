import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import { useSelector } from 'react-redux';
import axios from 'axios';

const REACT_APP_BASE_URL = 'http://localhost:5001';

const StudentProfile = () => {
  const { currentUser } = useSelector((state) => state.user);

  const [editData, setEditData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    password: '',
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const data = editData.password ? editData : { ...editData, password: undefined };

      await axios.put(`${REACT_APP_BASE_URL}/Student/${currentUser._id}`, data);
      setSnackbar({ open: true, message: 'Данные обновлены!', severity: 'success' });
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Ошибка при обновлении', severity: 'error' });
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 600 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar sx={{ width: 60, height: 60 }}>
            {currentUser.name.charAt(0)}
          </Avatar>
          <Typography variant="h5">Профиль ученика</Typography>
        </Box>

        <Typography variant="body1" gutterBottom>
          Класс: <strong>{currentUser?.sclassName?.sclassName}</strong><br />
          Школа: <strong>{currentUser?.school?.schoolName}</strong><br />
          Роль: <strong>Ученик</strong>
        </Typography>

        <Divider sx={{ my: 2 }} />

        <TextField
          fullWidth
          margin="normal"
          label="Имя"
          name="name"
          value={editData.name}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Email"
          name="email"
          value={editData.email}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Новый пароль"
          name="password"
          type="password"
          value={editData.password}
          onChange={handleChange}
        />

        <Box mt={3} textAlign="right">
          <Button variant="contained" onClick={handleSave}>
            Сохранить изменения
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentProfile;

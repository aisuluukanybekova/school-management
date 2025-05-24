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
  Alert,
} from '@mui/material';
import { useSelector } from 'react-redux';
import axios from 'axios';

const BASE_URL = 'http://localhost:5001/api';

function StudentProfile() {
  const { currentUser } = useSelector((state) => state.user);

  const [editData, setEditData] = useState({
    name: currentUser.name,
    email: currentUser.email,
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordUpdate = async () => {
    const { oldPassword, newPassword, confirmPassword } = passwordData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return setSnackbar({ open: true, message: 'Заполните все поля пароля', severity: 'warning' });
    }

    if (newPassword !== confirmPassword) {
      return setSnackbar({ open: true, message: 'Новые пароли не совпадают', severity: 'warning' });
    }

    try {
      await axios.put(`${BASE_URL}/students/update-password/${currentUser._id}`, {
        oldPassword,
        newPassword,
      });
      setSnackbar({ open: true, message: 'Пароль успешно обновлён!', severity: 'success' });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      const msg = error?.response?.data?.message || 'Ошибка при смене пароля';
      setSnackbar({ open: true, message: msg, severity: 'error' });
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
          Школа:
          {' '}
          <strong>{currentUser?.school?.schoolName}</strong>
          <br />
          Роль:
          {' '}
          <strong>Ученик</strong>
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
        {/* <TextField
          fullWidth
          margin="normal"
          label="Email"
          name="email"
          value={editData.email}
          onChange={handleChange}
        /> */}

        {/* Блок редактирования отключён. Чтобы включить — раскомментируйте:
        <Box mt={3} textAlign="right">
          <Button variant="contained" onClick={handleSave}>
            Сохранить изменения
          </Button>
        </Box> */}

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Смена пароля
        </Typography>
        <TextField
          fullWidth
          margin="normal"
          label="Старый пароль"
          name="oldPassword"
          type="password"
          value={passwordData.oldPassword}
          onChange={handlePasswordChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Новый пароль"
          name="newPassword"
          type="password"
          value={passwordData.newPassword}
          onChange={handlePasswordChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Подтвердите новый пароль"
          name="confirmPassword"
          type="password"
          value={passwordData.confirmPassword}
          onChange={handlePasswordChange}
        />

        <Box mt={2} textAlign="right">
          <Button variant="contained" color="secondary" onClick={handlePasswordUpdate}>
            Сменить пароль
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
}

export default StudentProfile;

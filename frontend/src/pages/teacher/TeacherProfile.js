import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card, CardContent, Typography, TextField, Button, Box, Snackbar, Alert,
} from '@mui/material';
import axios from 'axios';
import { updateUser } from '../../redux/userRelated/userHandle';

function TeacherProfile() {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [editData, setEditData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
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

  const handleUpdate = async () => {
    try {
      await dispatch(updateUser(editData, currentUser._id, 'Teacher'));
      setSnackbar({ open: true, message: 'Профиль обновлён!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Ошибка при обновлении профиля.', severity: 'error' });
    }
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
      await axios.put(`/api/teachers/update-password/${currentUser._id}`, {
        oldPassword,
        newPassword,
      });
      setSnackbar({ open: true, message: 'Пароль успешно обновлён', severity: 'success' });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Ошибка при смене пароля';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const teachSchool = currentUser?.school;

  return (
    <Box display="flex" justifyContent="center" alignItems="flex-start" flexDirection="column" height="100%" p={3}>
      <Card sx={{
        maxWidth: 600, width: '100%', borderRadius: 3, boxShadow: 5, mb: 4, alignSelf: 'center',
      }}
      >
        <CardContent>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Профиль учителя
          </Typography>

          <Box mb={2}>
            <Typography variant="body1">
              Школа:
              {' '}
              <strong>{teachSchool?.schoolName || '—'}</strong>
            </Typography>
          </Box>

          <TextField
            fullWidth
            label="Имя"
            name="name"
            value={editData.name}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={editData.email}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
          />

          <Box mt={3}>
            <Button variant="contained" onClick={handleUpdate} fullWidth>
              Сохранить изменения
            </Button>
          </Box>

          <Box mt={5}>
            <Typography variant="h6" gutterBottom>
              Смена пароля
            </Typography>
            <TextField
              fullWidth
              label="Старый пароль"
              name="oldPassword"
              type="password"
              value={passwordData.oldPassword}
              onChange={handlePasswordChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Новый пароль"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Подтвердите новый пароль"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              margin="normal"
            />
            <Box mt={2}>
              <Button variant="contained" color="secondary" fullWidth onClick={handlePasswordUpdate}>
                Сменить пароль
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

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

export default TeacherProfile;

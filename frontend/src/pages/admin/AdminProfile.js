import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser, deleteUser } from '../../redux/userRelated/userHandle';
import { authLogout } from '../../redux/userRelated/userSlice';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, Typography, TextField, Button, Box, Snackbar, Alert, Divider, Grid
} from '@mui/material';
import axios from 'axios';

const AdminProfile = () => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [editData, setEditData] = useState({
    name: currentUser.name,
    email: currentUser.email,
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
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
      await axios.put(`/api/admins/update-password/${currentUser._id}`, {
        oldPassword,
        newPassword
      });
      setSnackbar({ open: true, message: 'Пароль успешно обновлён', severity: 'success' });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Ошибка при смене пароля';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteUser(currentUser._id, 'Students'));
      await dispatch(deleteUser(currentUser._id, 'Admin'));
      dispatch(authLogout());
      navigate('/');
    } catch {
      setSnackbar({ open: true, message: 'Ошибка при удалении.', severity: 'error' });
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" p={3}>
      <Card sx={{ width: '100%', maxWidth: 600, p: 2 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {currentUser.schoolName}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Профиль администратора
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Имя" name="name" value={editData.name} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Email" name="email" value={editData.email} onChange={handleChange} type="email" />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" gutterBottom>
            Смена пароля
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Старый пароль" name="oldPassword" type="password" value={passwordData.oldPassword} onChange={handlePasswordChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Новый пароль" name="newPassword" type="password" value={passwordData.newPassword} onChange={handlePasswordChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Подтвердите новый пароль" name="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={handlePasswordChange} />
            </Grid>
            <Grid item xs={12}>
              <Button fullWidth variant="contained" color="secondary" onClick={handlePasswordUpdate}>
                Сменить пароль
              </Button>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Button fullWidth variant="outlined" color="error" onClick={handleDelete}>
            Удалить аккаунт
          </Button>
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
};

export default AdminProfile;

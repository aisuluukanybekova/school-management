import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser, deleteUser } from '../../redux/userRelated/userHandle';
import { authLogout } from '../../redux/userRelated/userSlice';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, Typography, TextField, Button, Box, Snackbar, Alert,
} from '@mui/material';

const AdminProfile = () => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [editData, setEditData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    schoolName: currentUser.schoolName,
    password: '',
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const data = editData.password
        ? editData
        : { ...editData, password: undefined };

      await dispatch(updateUser(data, currentUser._id, 'Admin'));
      setSnackbar({ open: true, message: 'Профиль обновлён!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Ошибка при обновлении.', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteUser(currentUser._id, 'Students'));
      await dispatch(deleteUser(currentUser._id, 'Admin'));
      dispatch(authLogout());
      navigate('/');
    } catch (err) {
      setSnackbar({ open: true, message: 'Ошибка при удалении.', severity: 'error' });
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100%" p={3}>
      <Card sx={{ maxWidth: 600, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Профиль администратора
          </Typography>

          <TextField
            fullWidth
            label="Имя"
            name="name"
            value={editData.name}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Название школы"
            name="schoolName"
            value={editData.schoolName}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={editData.email}
            onChange={handleChange}
            margin="normal"
            type="email"
          />
          <TextField
            fullWidth
            label="Новый пароль"
            name="password"
            type="password"
            value={editData.password}
            onChange={handleChange}
            margin="normal"
          />

          <Box mt={3} display="flex" justifyContent="space-between">
            <Button variant="outlined" color="error" onClick={handleDelete}>
              Удалить аккаунт
            </Button>
            <Button variant="contained" onClick={handleUpdate}>
              Сохранить изменения
            </Button>
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
};

export default AdminProfile;
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../../redux/userRelated/userHandle';
import {
  Card, CardContent, Typography, TextField, Button, Box, Snackbar, Alert,
} from '@mui/material';
import AttendanceChart from '../../components/charts/AttendanceChart';

const TeacherProfile = () => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [editData, setEditData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    password: '',
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const data = editData.password ? editData : { ...editData, password: undefined };
      await dispatch(updateUser(data, currentUser._id, 'Teacher'));
      setSnackbar({ open: true, message: 'Профиль обновлён!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Ошибка при обновлении.', severity: 'error' });
    }
  };

  const teachSclass = currentUser.teachSclass;
  const teachSubject = currentUser.teachSubject;
  const teachSchool = currentUser.school;

  return (
    <Box display="flex" justifyContent="center" alignItems="flex-start" flexDirection="column" height="100%" p={3}>
      <Card sx={{ maxWidth: 600, width: '100%', borderRadius: 3, boxShadow: 5, mb: 4, alignSelf: 'center' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Профиль преподавателя
          </Typography>

          <Box mb={2}>
            <Typography variant="body1">Класс: <strong>{teachSclass.sclassName}</strong></Typography>
            <Typography variant="body1">Предмет: <strong>{teachSubject.subName}</strong></Typography>
            <Typography variant="body1">Школа: <strong>{teachSchool.schoolName}</strong></Typography>
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
          <TextField
            fullWidth
            label="Новый пароль"
            name="password"
            type="password"
            value={editData.password}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
          />

          <Box mt={3} display="flex" justifyContent="center">
            <Button variant="contained" onClick={handleUpdate} sx={{ px: 4, py: 1 }}>
              Сохранить изменения
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Box width="100%" maxWidth="600px" alignSelf="center">
        <Typography variant="h6" gutterBottom textAlign="center">
          График посещаемости
        </Typography>
        <AttendanceChart teacherId={currentUser._id} />
      </Box>

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

export default TeacherProfile;

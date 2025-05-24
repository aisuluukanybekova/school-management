import React, { useEffect, useState } from 'react';
import {
  Paper, Typography, Switch, FormControlLabel,
  MenuItem, Select, InputLabel, FormControl,
  Box, Button, Divider, TextField, Avatar,
} from '@mui/material';
import axios from 'axios';
import { useSelector } from 'react-redux';

const REACT_APP_BASE_URL = 'http://localhost:5001';

function TeacherSettings() {
  const { currentUser } = useSelector((state) => state.user);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('ru');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleSave = async () => {
    try {
      if (newPassword) {
        await axios.put(`${REACT_APP_BASE_URL}/Teacher/${currentUser._id}`, {
          password: newPassword,
        });
        alert('Пароль успешно обновлён');
      }

      console.log({
        darkMode,
        language,
        itemsPerPage,
        notificationsEnabled,
      });

      alert('Настройки успешно сохранены');
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      alert('Ошибка при сохранении настроек');
    }
  };

  return (
    <Paper sx={{
      p: 4, maxWidth: 600, margin: 'auto', mt: 4,
    }}
    >
      <Typography variant="h5" gutterBottom>
        Настройки преподавателя
      </Typography>

      <Box display="flex" alignItems="center" gap={2} mt={2}>
        <Avatar sx={{ width: 60, height: 60 }}>
          {currentUser?.name?.charAt(0)}
        </Avatar>
        <Button variant="outlined" component="label">
          Изменить аватар
          <input hidden type="file" accept="image/*" />
        </Button>
      </Box>

      <Divider sx={{ my: 3 }} />

      <FormControlLabel
        control={<Switch checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />}
        label="Темная тема"
      />

      <FormControl fullWidth margin="normal">
        <InputLabel id="lang-label">Язык</InputLabel>
        <Select
          labelId="lang-label"
          value={language}
          label="Язык"
          onChange={(e) => setLanguage(e.target.value)}
        >
          <MenuItem value="ru">Русский</MenuItem>
          <MenuItem value="en">English</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel id="items-label">Элементов на странице</InputLabel>
        <Select
          labelId="items-label"
          value={itemsPerPage}
          label="Элементов на странице"
          onChange={(e) => setItemsPerPage(e.target.value)}
        >
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={25}>25</MenuItem>
        </Select>
      </FormControl>

      <FormControlLabel
        control={<Switch checked={notificationsEnabled} onChange={(e) => setNotificationsEnabled(e.target.checked)} />}
        label="Уведомления"
      />

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6">Смена пароля</Typography>
      <TextField
        fullWidth
        label="Старый пароль"
        type="password"
        margin="normal"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
      />
      <TextField
        fullWidth
        label="Новый пароль"
        type="password"
        margin="normal"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <Box mt={3}>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Сохранить изменения
        </Button>
      </Box>
    </Paper>
  );
}

export default TeacherSettings;

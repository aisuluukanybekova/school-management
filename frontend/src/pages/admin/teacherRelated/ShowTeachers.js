import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Paper, Box, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Button, Grid, Typography,
  FormControl, MenuItem,
} from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import EditIcon from '@mui/icons-material/Edit';
import SchoolIcon from '@mui/icons-material/School';

import { getAllTeachers } from '../../../redux/teacherRelated/teacherHandle';
import { BlueButton } from '../../../components/buttonStyles';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import TableTemplate from '../../../components/TableTemplate';
import Popup from '../../../components/Popup';

const BASE_URL = 'http://localhost:5001/api/teachers';

function ShowTeachers() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { teachersList, loading } = useSelector((state) => state.teacher);
  const { currentUser } = useSelector((state) => state.user);

  const [editTeacher, setEditTeacher] = useState({});
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [homeroomModalOpen, setHomeroomModalOpen] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');

  const [searchName, setSearchName] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (currentUser?.school?._id) {
      dispatch(getAllTeachers(currentUser.school._id));
      axios.get(`/api/classes/school/${currentUser.school._id}`).then((res) => setClasses(res.data));
    }
  }, [dispatch, currentUser]);

  const deleteHandler = async (id, address) => {
    try {
      const url = address === 'Teachers'
        ? `/api/teachers/school/${id}`
        : `/api/teachers/${id}`;
      await axios.delete(url);
      dispatch(getAllTeachers(currentUser.school._id));
      setMessage('Преподаватель(и) удалён(ы) успешно.');
      setShowPopup(true);
    } catch (err) {
      console.error('Ошибка при удалении:', err);
      setMessage('Ошибка при удалении преподавателя.');
      setShowPopup(true);
    }
  };

  const handleEditClick = (row) => {
    setEditTeacher({ name: row.name, _id: row._id });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`${BASE_URL}/${editTeacher._id}`, editTeacher);
      setEditModalOpen(false);
      dispatch(getAllTeachers(currentUser.school._id));
      setMessage('Преподаватель обновлен успешно.');
      setShowPopup(true);
    } catch (error) {
      console.error('Ошибка при обновлении преподавателя:', error);
      setMessage('Ошибка при обновлении преподавателя');
      setShowPopup(true);
    }
  };

  const handleAssignHomeroom = (row) => {
    setEditTeacher(row);
    setSelectedClass(row.homeroomFor?._id || '');
    setHomeroomModalOpen(true);
  };

  const handleSaveHomeroom = async () => {
    try {
      await axios.put(`${BASE_URL}/${editTeacher._id}`, { homeroomFor: selectedClass });
      setHomeroomModalOpen(false);
      dispatch(getAllTeachers(currentUser.school._id));
      setMessage('Классное руководство обновлено.');
      setShowPopup(true);
    } catch (error) {
      console.error('Ошибка при сохранении homeroomFor', error);
      setMessage('Ошибка при сохранении классного руководства');
      setShowPopup(true);
    }
  };

  const teacherColumns = [
    { id: 'name', label: 'Имя', minWidth: 170 },
    { id: 'email', label: 'Email', minWidth: 200 },
  ];

  const teacherRows = Array.isArray(teachersList)
    ? [...teachersList]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((t) => ({
        _id: t._id,
        name: t.name,
        email: t.email,
        homeroomFor: t.homeroomFor,
      }))
    : [];

  const filteredRows = teacherRows.filter((row) => row.name.toLowerCase().includes(searchName.toLowerCase()));

  function TeacherButtonHaver({ row }) {
    return (
      <>
        <IconButton onClick={() => deleteHandler(row._id, 'Teacher')}>
          <PersonRemoveIcon color="error" />
        </IconButton>
        <IconButton onClick={() => handleEditClick(row)}>
          <EditIcon />
        </IconButton>
        <IconButton onClick={() => handleAssignHomeroom(row)}>
          <SchoolIcon color="primary" />
        </IconButton>
        <BlueButton variant="contained" onClick={() => navigate(`/Admin/teachers/teacher/${row._id}`)}>
          Просмотр
        </BlueButton>
      </>
    );
  }

  TeacherButtonHaver.propTypes = {
    row: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string,
      homeroomFor: PropTypes.any,
    }).isRequired,
  };

  const actions = [
    {
      icon: <PersonAddAlt1Icon color="primary" />,
      name: 'Добавить преподавателя',
      action: () => navigate('/Admin/teachers/addteacher'),
    },
    {
      icon: <PersonRemoveIcon color="error" />,
      name: 'Удалить всех преподавателей',
      action: () => deleteHandler(currentUser.school._id, 'Teachers'),
    },
  ];

  return (
    <>
      {loading ? (
        <div>Загрузка...</div>
      ) : (
        <>
          <Box sx={{ mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Поиск по имени"
                  fullWidth
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Список преподавателей
            </Typography>
            <BlueButton
              variant="contained"
              onClick={() => navigate('/Admin/teachers/addteacher')}
              sx={{ fontWeight: 'bold', px: 3, py: 1 }}
            >
              Добавить преподавателя
            </BlueButton>
          </Box>

          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            {filteredRows.length > 0 ? (
              <TableTemplate buttonHaver={TeacherButtonHaver} columns={teacherColumns} rows={filteredRows} />
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>Преподаватели не найдены</Box>
            )}
            <SpeedDialTemplate actions={actions} />
          </Paper>
        </>
      )}

      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <DialogTitle>Редактировать преподавателя</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Имя"
            value={editTeacher.name || ''}
            onChange={(e) => setEditTeacher({ ...editTeacher, name: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Сохранить</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={homeroomModalOpen} onClose={() => setHomeroomModalOpen(false)}>
        <DialogTitle>Назначить классное руководство</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <TextField
              select
              label="Выберите класс"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <MenuItem value="">Не назначать</MenuItem>
              {classes.map((cls) => (
                <MenuItem key={cls._id} value={cls._id}>
                  {cls.sclassName}
                </MenuItem>
              ))}
            </TextField>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHomeroomModalOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSaveHomeroom}>Сохранить</Button>
        </DialogActions>
      </Dialog>

      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </>
  );
}

export default ShowTeachers;

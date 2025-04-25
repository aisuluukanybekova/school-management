import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Paper, Box, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Button, Grid
} from '@mui/material';

import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import EditIcon from '@mui/icons-material/Edit';

import { deleteUser } from '../../../redux/userRelated/userHandle';
import { getAllTeachers } from '../../../redux/teacherRelated/teacherHandle';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import TableTemplate from '../../../components/TableTemplate';
import Popup from '../../../components/Popup';
import axios from 'axios';

const REACT_APP_BASE_URL = "http://localhost:5001";

const ShowTeachers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { teachersList, loading, error, response } = useSelector((state) => state.teacher);
  const { currentUser } = useSelector((state) => state.user);

  const [editTeacher, setEditTeacher] = useState({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const [searchName, setSearchName] = useState("");
  const [searchSubject, setSearchSubject] = useState("");
  const [searchClass, setSearchClass] = useState("");

  useEffect(() => {
    dispatch(getAllTeachers(currentUser._id));
  }, [currentUser._id, dispatch]);

  const deleteHandler = (deleteID, address) => {
    dispatch(deleteUser(deleteID, address)).then(() => {
      dispatch(getAllTeachers(currentUser._id));
    });
  };

  const handleEditClick = (row) => {
    setEditTeacher({ name: row.name, _id: row.id });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const res = await axios.put(`${REACT_APP_BASE_URL}/Teacher/${editTeacher._id}`, editTeacher);
      setEditModalOpen(false);
      dispatch(getAllTeachers(currentUser._id));
    } catch (error) {
      console.error("Ошибка при обновлении:", error.response?.data || error.message);
    }
  };

  const teacherColumns = [
    { id: 'name', label: 'Имя', minWidth: 170 },
    { id: 'teachSubject', label: 'Предмет', minWidth: 170 },
    { id: 'teachSclass', label: 'Класс', minWidth: 170 },
  ];

  const teacherRows = teachersList.map((teacher) => ({
    name: teacher.name,
    teachSubject: teacher.teachSubject?.subName || '—',
    teachSclass: teacher.teachSclass?.sclassName || '—',
    id: teacher._id,
    teachSclassID: teacher.teachSclass?._id
  }));

  const filteredRows = teacherRows.filter(row =>
    row.name.toLowerCase().includes(searchName.toLowerCase()) &&
    row.teachSubject.toLowerCase().includes(searchSubject.toLowerCase()) &&
    row.teachSclass.toLowerCase().includes(searchClass.toLowerCase())
  );

  const TeacherButtonHaver = ({ row }) => (
    <>
      <IconButton onClick={() => deleteHandler(row.id, "Teacher")}>
        <PersonRemoveIcon color="error" />
      </IconButton>
      <IconButton onClick={() => handleEditClick(row)}>
        <EditIcon />
      </IconButton>
      <BlueButton variant="contained" onClick={() => navigate("/Admin/teachers/teacher/" + row.id)}>
        Просмотр
      </BlueButton>
    </>
  );

  const actions = [
    {
      icon: <PersonAddAlt1Icon color="primary" />,
      name: 'Добавить преподавателя',
      action: () => navigate("/Admin/teachers/chooseclass"),
    },
    {
      icon: <PersonRemoveIcon color="error" />,
      name: 'Удалить всех преподавателей',
      action: () => deleteHandler(currentUser._id, "Teachers"),
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
                  fullWidth
                  label="Поиск по имени"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Поиск по предмету"
                  value={searchSubject}
                  onChange={(e) => setSearchSubject(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Поиск по классу"
                  value={searchClass}
                  onChange={(e) => setSearchClass(e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>

          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            {filteredRows.length > 0 ? (
              <TableTemplate buttonHaver={TeacherButtonHaver} columns={teacherColumns} rows={filteredRows} />
            ) : (
              <Box sx={{ p: 3, textAlign: "center" }}>Преподаватели не найдены</Box>
            )}
            <SpeedDialTemplate actions={actions} />
          </Paper>
        </>
      )}

      {/* Модалка редактирования */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <DialogTitle>Редактировать преподавателя</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Имя"
            value={editTeacher.name || ""}
            onChange={(e) => setEditTeacher({ ...editTeacher, name: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Сохранить</Button>
        </DialogActions>
      </Dialog>

      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </>
  );
};

export default ShowTeachers;

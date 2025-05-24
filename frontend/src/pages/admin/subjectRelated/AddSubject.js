import React, { useState, useEffect } from 'react';
import {
  Box, Grid, TextField, Typography, Button,
  CircularProgress, IconButton, Table, TableBody,
  TableCell, TableHead, TableRow, Paper, InputAdornment,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { useDispatch, useSelector } from 'react-redux';
import Popup from '../../../components/Popup';
import {
  getAllSubjects,
  addSubject,
  updateSubject,
  deleteSubject,
} from '../../../redux/subjectRelated/subjectHandle';

function AddSubject() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { subjectsList, loading } = useSelector((state) => state.subject);

  const [subjectName, setSubjectName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState('');

  const schoolId = currentUser?.school?._id;

  useEffect(() => {
    if (schoolId) {
      dispatch(getAllSubjects(schoolId));
    }
  }, [dispatch, schoolId]);

  const showMessage = (msg) => {
    setMessage(msg);
    setShowPopup(true);
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    const name = subjectName.trim();

    if (!name) return showMessage('Пожалуйста, введите название предмета');
    if (!/^[\p{L}\p{N}\s]+$/u.test(name)) return showMessage('Название может содержать только буквы и цифры');

    const duplicate = subjectsList.some(
      (s) => s.subName.toLowerCase() === name.toLowerCase(),
    );
    if (duplicate) return showMessage('Такой предмет уже существует');

    try {
      await dispatch(addSubject({
        subName: name,
        adminID: schoolId,
      }));
      setSubjectName('');
      showMessage('Предмет успешно добавлен');
    } catch {
      showMessage('Ошибка при добавлении предмета');
    }
  };

  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditedName(name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedName('');
  };

  const handleSaveEdit = async () => {
    const name = editedName.trim();

    if (!name) return showMessage('Пожалуйста, введите название');
    if (!/^[\p{L}\p{N}\s]+$/u.test(name)) return showMessage('Название может содержать только буквы и цифры');

    const duplicate = subjectsList.some(
      (s) => s.subName.toLowerCase() === name.toLowerCase() && s._id !== editingId,
    );
    if (duplicate) return showMessage('Такой предмет уже существует');

    try {
      await dispatch(updateSubject(editingId, {
        subName: name,
        school: schoolId,
      }));
      setEditingId(null);
      setEditedName('');
      showMessage('Предмет успешно обновлён');
    } catch {
      showMessage('Ошибка при обновлении предмета');
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteSubject(id, schoolId));
      showMessage('Предмет удалён');
    } catch {
      showMessage('Ошибка при удалении предмета');
    }
  };

  const filteredSubjects = subjectsList
    .filter((s) => s.subName.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.subName.localeCompare(b.subName));

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Добавить предмет</Typography>

      <form onSubmit={handleAddSubject}>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Название предмета"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4} display="flex" alignItems="center">
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'СОХРАНИТЬ'}
            </Button>
          </Grid>
        </Grid>
      </form>

      <Typography variant="h6" gutterBottom>Список предметов</Typography>

      <TextField
        fullWidth
        placeholder="Поиск по названию..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {filteredSubjects.length === 0 ? (
        <Typography>Пока нет предметов</Typography>
      ) : (
        <Paper sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>№</TableCell>
                <TableCell>Название</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubjects.map((subj, idx) => (
                <TableRow key={subj._id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>
                    {editingId === subj._id ? (
                      <TextField
                        value={editedName}
                        size="small"
                        fullWidth
                        onChange={(e) => setEditedName(e.target.value)}
                      />
                    ) : (
                      subj.subName
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {editingId === subj._id ? (
                      <>
                        <Button onClick={handleCancelEdit} variant="outlined" size="small" sx={{ mr: 1 }}>
                          Отмена
                        </Button>
                        <Button onClick={handleSaveEdit} variant="contained" size="small">
                          Сохранить
                        </Button>
                      </>
                    ) : (
                      <>
                        <IconButton onClick={() => handleEdit(subj._id, subj.subName)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(subj._id)}>
                          <DeleteIcon color="error" />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </Box>
  );
}

export default AddSubject;

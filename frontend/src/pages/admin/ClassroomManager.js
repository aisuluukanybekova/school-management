import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, Button, Table, TableHead, TableBody,
  TableRow, TableCell, Paper, TableContainer, IconButton, Alert, Stack
} from '@mui/material';
import { Delete, Edit, Save } from '@mui/icons-material';
import axios from 'axios';
import { useSelector } from 'react-redux';

axios.defaults.baseURL = 'http://localhost:5001';

function ClassroomManager() {
  const admin = useSelector((state) => state.user.currentUser);
  const [cabinets, setCabinets] = useState([]);
  const [newCabinet, setNewCabinet] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const schoolId = admin?.schoolId || admin?.school?._id;

  const fetchCabinets = async () => {
    try {
      const { data } = await axios.get(`/api/cabinets/${schoolId}`);
      setCabinets(data.cabinets);
    } catch (err) {
      setError('Ошибка загрузки кабинетов.');
    }
  };

  useEffect(() => {
    if (schoolId) fetchCabinets();
  }, [schoolId]);

  const handleAdd = async () => {
    if (!newCabinet.trim()) return;
    try {
      await axios.post('/api/cabinets', { name: newCabinet.trim(), schoolId });
      setNewCabinet('');
      setSuccess('Кабинет добавлен.');
      setError('');
      fetchCabinets();
    } catch (err) {
      setError('Ошибка при добавлении кабинета.');
      setSuccess('');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/cabinets/${id}`);
      setSuccess('Кабинет удалён.');
      setError('');
      fetchCabinets();
    } catch (err) {
      setError('Ошибка при удалении кабинета.');
      setSuccess('');
    }
  };

  const handleEdit = (cabinet) => {
    setEditingId(cabinet._id);
    setEditedName(cabinet.name);
  };

  const handleUpdate = async () => {
    if (!editedName.trim()) return;
    try {
      await axios.put(`/api/cabinets/${editingId}`, { name: editedName.trim() });
      setSuccess('Кабинет обновлён.');
      setError('');
      setEditingId(null);
      setEditedName('');
      fetchCabinets();
    } catch (err) {
      setError('Ошибка при обновлении кабинета.');
      setSuccess('');
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Управление кабинетами
      </Typography>

      <Stack spacing={2} my={2}>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
      </Stack>

      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Новый кабинет"
          size="small"
          value={newCabinet}
          onChange={(e) => setNewCabinet(e.target.value)}
        />
        <Button variant="contained" onClick={handleAdd}>
          Добавить
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Кабинет</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cabinets.map((cabinet) => (
              <TableRow key={cabinet._id}>
                <TableCell>
                  {editingId === cabinet._id ? (
                    <TextField
                      size="small"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                    />
                  ) : (
                    cabinet.name
                  )}
                </TableCell>
                <TableCell align="right">
                  {editingId === cabinet._id ? (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Save />}
                      onClick={handleUpdate}
                    >
                      Сохранить
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => handleEdit(cabinet)}
                      >
                        Редактировать
                      </Button>
                      <IconButton color="error" onClick={() => handleDelete(cabinet._id)}>
                        <Delete />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ClassroomManager;

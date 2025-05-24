import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Paper, Box, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, InputAdornment, MenuItem, Button,
} from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';

const REACT_APP_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5001';

function ShowStudents() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    studentsList, loading, error, response,
  } = useSelector((state) => state.student);
  const { currentUser } = useSelector((state) => state.user);

  const [showPopup, setShowPopup] = useState(false);
  const [editStudent, setEditStudent] = useState({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('Все');

  useEffect(() => {
    dispatch(getAllStudents(currentUser._id));
  }, [currentUser._id, dispatch]);

  const deleteHandler = (deleteID, address) => {
    dispatch(deleteUser(deleteID, address))
      .then(() => dispatch(getAllStudents(currentUser._id)));
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`${REACT_APP_BASE_URL}/api/students/${editStudent._id}`, editStudent);
      setEditModalOpen(false);
      dispatch(getAllStudents(currentUser._id));
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
    }
  };

  const classOptions = ['Все', ...[...new Set(
    studentsList.map((s) => s.sclassName?.sclassName).filter(Boolean),
  )].sort((a, b) => a.localeCompare(b, 'ru', { numeric: true }))];

  const filteredStudents = [...studentsList]
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((student) => {
      const nameMatch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
      const classMatch = selectedClass === 'Все' || (student?.sclassName?.sclassName === selectedClass);
      return nameMatch && classMatch;
    });

  const studentRows = [...filteredStudents]
    .sort((a, b) => {
      const classA = a.sclassName?.sclassName || '';
      const classB = b.sclassName?.sclassName || '';
      const classCompare = classA.localeCompare(classB, 'ru', { numeric: true });
      if (classCompare !== 0) return classCompare;
      return a.name.localeCompare(b.name, 'ru');
    })
    .map((student) => ({
      name: student.name,
      rollNum: student.rollNum,
      sclassName: student.sclassName?.sclassName || '',
      id: student._id,
    }));

  const studentColumns = [
    { id: 'name', label: 'Имя', minWidth: 170 },
    { id: 'rollNum', label: 'Номер ученика', minWidth: 100 },
    { id: 'sclassName', label: 'Класс', minWidth: 170 },
  ];

  function StudentButtonHaver({ row }) {
    const handleEditClick = () => {
      setEditStudent({ name: row.name, rollNum: row.rollNum, _id: row.id });
      setEditModalOpen(true);
    };

    return (
      <>
        <IconButton onClick={() => deleteHandler(row.id, 'students')}>
          <PersonRemoveIcon color="error" />
        </IconButton>
        <IconButton onClick={handleEditClick}>
          <EditIcon />
        </IconButton>
        <BlueButton
          variant="contained"
          onClick={() => navigate(`/Admin/students/student/${row.id}`)}
        >
          Просмотр
        </BlueButton>
      </>
    );
  }

  // ✅ Валидация пропсов
  StudentButtonHaver.propTypes = {
    row: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      rollNum: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }).isRequired,
  };

  const actions = [
    {
      icon: <PersonAddAlt1Icon color="primary" />,
      name: 'Добавить ученика',
      action: () => navigate('/Admin/addstudents'),
    },
    {
      icon: <PersonRemoveIcon color="error" />,
      name: 'Удалить всех учеников',
      action: () => deleteHandler(currentUser._id, 'students'),
    },
  ];

  return (
    <>
      {loading ? (
        <div>Загрузка...</div>
      ) : error ? (
        <Box sx={{ p: 4, textAlign: 'center', color: 'red' }}>
          Ошибка загрузки студентов
        </Box>
      ) : (
        <>
          {response ? (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <GreenButton
                variant="contained"
                onClick={() => navigate('/Admin/addstudents')}
              >
                Добавить учеников
              </GreenButton>
            </Box>
          ) : (
            <Paper sx={{ width: '100%', overflow: 'hidden', p: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  label="Поиск по имени"
                  variant="outlined"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  select
                  label="Фильтр по классу"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  sx={{ minWidth: 200 }}
                >
                  {classOptions.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </TextField>
              </Box>

              {filteredStudents.length > 0 ? (
                <TableTemplate
                  buttonHaver={StudentButtonHaver}
                  columns={studentColumns}
                  rows={studentRows}
                />
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  Нет студентов для отображения
                </Box>
              )}
              <SpeedDialTemplate actions={actions} />
            </Paper>
          )}
        </>
      )}

      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <DialogTitle>Редактировать ученика</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Имя"
            value={editStudent.name || ''}
            onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Номер ученика"
            value={editStudent.rollNum || ''}
            onChange={(e) => setEditStudent({ ...editStudent, rollNum: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Сохранить</Button>
        </DialogActions>
      </Dialog>

      <Popup showPopup={showPopup} setShowPopup={setShowPopup} message="" />
    </>
  );
}

export default ShowStudents;

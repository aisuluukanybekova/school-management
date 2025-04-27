import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import { Paper, Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, ButtonGroup, InputAdornment, MenuItem } from '@mui/material';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import EditIcon from '@mui/icons-material/Edit';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Popper from '@mui/material/Popper';
import MenuList from '@mui/material/MenuList';
import SearchIcon from '@mui/icons-material/Search';
import { BlackButton, BlueButton, GreenButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import axios from 'axios';
import { deleteUser } from '../../../redux/userRelated/userHandle';

const REACT_APP_BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5001";

const ShowStudents = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { studentsList, loading, error, response } = useSelector((state) => state.student);
  const { currentUser } = useSelector(state => state.user);

  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
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
      await axios.put(`${REACT_APP_BASE_URL}/Student/${editStudent._id}`, editStudent);
      setEditModalOpen(false);
      dispatch(getAllStudents(currentUser._id));
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
    }
  };

  const classOptions = ['Все', ...new Set(studentsList.map(s => s.sclassName?.sclassName).filter(Boolean))];

  const filteredStudents = studentsList.filter(student => {
    const nameMatch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const classMatch = selectedClass === 'Все' || (student?.sclassName?.sclassName === selectedClass);
    return nameMatch && classMatch;
  });

  const studentRows = filteredStudents.map((student) => ({
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

  const StudentButtonHaver = ({ row }) => {
    const options = ['Отметить посещаемость', 'Выставить оценки'];
    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleClick = () => {
      if (selectedIndex === 0) navigate("/Admin/students/student/attendance/" + row.id);
      else if (selectedIndex === 1) navigate("/Admin/students/student/marks/" + row.id);
    };

    const handleEditClick = () => {
      setEditStudent({ name: row.name, rollNum: row.rollNum, _id: row.id });
      setEditModalOpen(true);
    };

    return (
      <>
        <IconButton onClick={() => deleteHandler(row.id, "Student")}><PersonRemoveIcon color="error" /></IconButton>
        <IconButton onClick={handleEditClick}><EditIcon /></IconButton>
        <BlueButton variant="contained" onClick={() => navigate("/Admin/students/student/" + row.id)}>Просмотр</BlueButton>
        <ButtonGroup variant="contained" ref={anchorRef}>
          <Button onClick={handleClick}>{options[selectedIndex]}</Button>
          <BlackButton size="small" onClick={() => setOpen(prev => !prev)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </BlackButton>
        </ButtonGroup>
        <Popper open={open} anchorEl={anchorRef.current} transition disablePortal sx={{ zIndex: 1 }}>
          {({ TransitionProps, placement }) => (
            <Grow {...TransitionProps} style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}>
              <Paper>
                <ClickAwayListener onClickAway={() => setOpen(false)}>
                  <MenuList autoFocusItem>
                    {options.map((option, index) => (
                      <MenuItem key={option} selected={index === selectedIndex} onClick={() => { setSelectedIndex(index); setOpen(false); }}>
                        {option}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </>
    );
  };

  const actions = [
    { icon: <PersonAddAlt1Icon color="primary" />, name: 'Добавить ученика', action: () => navigate("/Admin/addstudents") },
    { icon: <PersonRemoveIcon color="error" />, name: 'Удалить всех учеников', action: () => deleteHandler(currentUser._id, "Students") },
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
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <GreenButton variant="contained" onClick={() => navigate("/Admin/addstudents")}>Добавить учеников</GreenButton>
            </Box>
          ) : (
            <Paper sx={{ width: '100%', overflow: 'hidden', p: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label="Поиск по имени"
                  variant="outlined"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  fullWidth
                  InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
                />
                <TextField
                  select
                  label="Фильтр по классу"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  sx={{ minWidth: 200 }}
                >
                  {classOptions.map((option, index) => (
                    <MenuItem key={index} value={option}>{option}</MenuItem>
                  ))}
                </TextField>
              </Box>

              {filteredStudents.length > 0 ? (
                <TableTemplate buttonHaver={StudentButtonHaver} columns={studentColumns} rows={studentRows} />
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
            value={editStudent.name || ""}
            onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Номер ученика"
            value={editStudent.rollNum || ""}
            onChange={(e) => setEditStudent({ ...editStudent, rollNum: e.target.value })}
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

export default ShowStudents;

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
} from '@mui/material';
import { getClassStudents } from '../../redux/sclassRelated/sclassHandle';
import TableTemplate from '../../components/TableTemplate';

const REACT_APP_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5001';

function TeacherClassForm() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { sclassStudents, loading } = useSelector((state) => state.sclass);

  const [teacherClasses, setTeacherClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');

  const teacherId = currentUser?._id;

  const fetchTeacherClasses = useCallback(async () => {
    try {
      const res = await axios.get(
        `${REACT_APP_BASE_URL}/api/teacherSubjectClass/by-teacher/${teacherId}`
      );
      setTeacherClasses(res.data);
    } catch (err) {
      console.error('Ошибка загрузки классов учителя:', err);
    }
  }, [teacherId]);

  useEffect(() => {
    if (teacherId) {
      fetchTeacherClasses();
    }
  }, [teacherId, fetchTeacherClasses]);

  useEffect(() => {
    if (selectedClass) {
      dispatch(getClassStudents(selectedClass));
    }
  }, [selectedClass, dispatch]);

  const uniqueClasses = [
    ...new Map(
      teacherClasses.map((item) => [
        item.sclassId,
        { id: item.sclassId, name: item.sclassName },
      ])
    ).values(),
  ];

  const studentColumns = [
    { id: 'name', label: 'Имя', minWidth: 170 },
    { id: 'rollNum', label: 'Номер', minWidth: 100 },
  ];

  const studentRows = sclassStudents.map((s) => ({
    name: s.name,
    rollNum: s.rollNum,
    id: s._id,
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Выберите класс</Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Класс</InputLabel>
        <Select
          value={selectedClass}
          label="Класс"
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          {uniqueClasses.map((cls) => (
            <MenuItem key={cls.id} value={cls.id}>
              {cls.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading ? (
        <Typography>Загрузка студентов...</Typography>
      ) : sclassStudents.length > 0 ? (
        <Paper sx={{ mt: 3 }}>
          <TableTemplate
            columns={studentColumns}
            rows={studentRows}
          />
        </Paper>
      ) : (
        <Typography color="text.secondary">
          Нет студентов для выбранного класса.
        </Typography>
      )}
    </Box>
  );
}

export default TeacherClassForm;

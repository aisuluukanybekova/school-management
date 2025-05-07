import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HomeroomDashboard = () => {
  const teacher = useSelector(state => state.user.currentUser);
  const [students, setStudents] = useState([]);
  const [klass, setKlass] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadHomeroomData = async () => {
      try {
        const homeroomId = typeof teacher.homeroomFor === 'string'
          ? teacher.homeroomFor
          : teacher.homeroomFor?._id;

        if (!homeroomId) {
          setLoading(false);
          return;
        }

        const classRes = await axios.get(`/api/classes/${homeroomId}`);
        setKlass(classRes.data);

        const studentRes = await axios.get(`/api/classes/${homeroomId}/students`);
        setStudents(studentRes.data);
      } catch (err) {
        console.error('Ошибка загрузки данных классного руководителя:', err);
      } finally {
        setLoading(false);
      }
    };

    if (teacher?.homeroomFor) {
      loadHomeroomData();
    } else {
      setLoading(false);
    }
  }, [teacher]);

  if (loading) return <CircularProgress sx={{ m: 4 }} />;

  if (!klass) {
    return (
      <Typography variant="h6" sx={{ m: 3 }}>
        Вы не являетесь классным руководителем
      </Typography>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Класс: {klass.sclassName} ({klass.school?.schoolName || 'Без названия школы'})
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Всего учеников: {students.length}
      </Typography>

      <Button
        variant="contained"
        sx={{ mt: 2, mb: 2 }}
        onClick={() => navigate('/teacher/homeroom-extended')}
      >
        Перейти к расширенной панели
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>№</strong></TableCell>
              <TableCell><strong>Имя ученика</strong></TableCell>
              <TableCell><strong>Телефон</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student, index) => (
              <TableRow key={student._id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.rollNum || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default HomeroomDashboard;

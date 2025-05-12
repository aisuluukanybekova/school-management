import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import {
  Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress, Button
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
        console.error('Ошибка загрузки:', err);
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (!klass) {
    return (
      <Typography variant="h6" sx={{ m: 4 }}>
        Вы не являетесь классным руководителем
      </Typography>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Класс: {klass.sclassName}
      </Typography>

      <Typography variant="body1" color="text.secondary" gutterBottom>
        Всего учеников: <strong>{students.length}</strong>
      </Typography>

      <Box display="flex" justifyContent="flex-end" my={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/teacher/homeroom-extended')}
        >
          Расширенная панель
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{
        borderRadius: 3,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        mt: 1
      }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{
                backgroundColor: 'black',
                color: 'white',
                fontWeight: 'bold',
                fontSize: { xs: '12px', md: '16px' },
              }}>
                №
              </TableCell>
              <TableCell align="center" sx={{
                backgroundColor: 'black',
                color: 'white',
                fontWeight: 'bold',
                fontSize: { xs: '12px', md: '16px' },
              }}>
                Имя ученика
              </TableCell>
              <TableCell align="center" sx={{
                backgroundColor: 'black',
                color: 'white',
                fontWeight: 'bold',
                fontSize: { xs: '12px', md: '16px' },
              }}>
                Номер
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.length > 0 ? students.map((student, index) => (
              <TableRow
                hover
                key={student._id}
                sx={{
                  transition: 'background-color 0.3s',
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }}
              >
                <TableCell align="center" sx={{ fontSize: { xs: '12px', md: '14px' } }}>
                  {index + 1}
                </TableCell>
                <TableCell align="center" sx={{ fontSize: { xs: '12px', md: '14px' } }}>
                  {student.name}
                </TableCell>
                <TableCell align="center" sx={{ fontSize: { xs: '12px', md: '14px' } }}>
                  {student.rollNum || '-'}
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ p: 4 }}>
                  Нет данных для отображения
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default HomeroomDashboard;

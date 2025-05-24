import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  TableContainer,
  Box,
  Divider,
  Stack,
  CircularProgress,
} from '@mui/material';
import {
  getSubjectsWithTeachers,
  getClassDetails,
} from '../../redux/sclassRelated/sclassHandle';
import { getUserDetails } from '../../redux/userRelated/userHandle';

function StudentSubjects() {
  const dispatch = useDispatch();
  const { subjectsList, sclassDetails } = useSelector((state) => state.sclass);
  const { userDetails, currentUser, loading } = useSelector((state) => state.user);

  const [subjectMarks, setSubjectMarks] = useState([]);

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(getUserDetails(currentUser._id, 'students'));
    }
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (userDetails?.examResult) {
      setSubjectMarks(userDetails.examResult);
    }
  }, [userDetails]);

  useEffect(() => {
    const classId = currentUser?.sclassName?._id;
    if (classId) {
      dispatch(getSubjectsWithTeachers(classId));
      dispatch(getClassDetails(classId));
    }
  }, [dispatch, currentUser]);

  if (loading || !currentUser || !currentUser?.sclassName?._id) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box mb={4}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Профиль ученика
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="subtitle1">
          <strong>Имя:</strong> {currentUser?.name || '—'}
        </Typography>
        <Typography variant="subtitle1">
          <strong>Класс:</strong> {sclassDetails?.sclassName || currentUser?.sclassName?.sclassName || '—'}
        </Typography>
      </Box>

      <Stack spacing={4}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            📘 Предметы и преподаватели
          </Typography>

          {subjectsList?.length ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Предмет</strong></TableCell>
                    <TableCell><strong>Преподаватель</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subjectsList.map((item) => (
                    <TableRow key={item._id || item.subjectId}>
                      <TableCell>{item.subjectName}</TableCell>
                      <TableCell>
                        {item.teachers?.length
                          ? item.teachers.map((t) => t.name).join(', ')
                          : 'не назначен'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" sx={{ mt: 1 }}>Предметы не найдены</Typography>
          )}
        </Paper>

        {Array.isArray(subjectMarks) && subjectMarks.length > 0 && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
               Итоговые оценки
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Предмет</strong></TableCell>
                    <TableCell><strong>Оценка</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subjectMarks.map((result) => (
                    result.subName && result.marksObtained != null && (
                      <TableRow key={result._id || result.subName._id}>
                        <TableCell>{result.subName.subName}</TableCell>
                        <TableCell>{result.marksObtained}</TableCell>
                      </TableRow>
                    )
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}

export default StudentSubjects;

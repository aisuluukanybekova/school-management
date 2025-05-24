import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Table, TableBody, TableContainer, TableHead, Typography, Paper,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { getTeacherFreeClassSubjects } from '../../../redux/sclassRelated/sclassHandle';
import { updateTeachSubject } from '../../../redux/teacherRelated/teacherHandle';
import { GreenButton, PurpleButton } from '../../../components/buttonStyles';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';

function ChooseSubject({ situation }) {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [classID, setClassID] = useState('');
  const [teacherID, setTeacherID] = useState('');
  const [loader, setLoader] = useState(false);

  const {
    subjectsList, loading, error, response,
  } = useSelector((state) => state.sclass);

  useEffect(() => {
    if (situation === 'Norm') {
      const classId = params.id;
      setClassID(classId);
      dispatch(getTeacherFreeClassSubjects(classId));
    } else if (situation === 'Teacher') {
      const { classID: cID, teacherID: tID } = params;
      setClassID(cID);
      setTeacherID(tID);
      dispatch(getTeacherFreeClassSubjects(cID));
    }
  }, [dispatch, params, situation]);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (response) {
    return (
      <div>
        <h1>Извините, у всех предметов уже назначены преподаватели</h1>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <PurpleButton
            variant="contained"
            onClick={() => navigate(`/Admin/addsubject/${classID}`)}
          >
            Добавить предметы
          </PurpleButton>
        </Box>
      </div>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: 'red' }}>
        Ошибка загрузки предметов. Пожалуйста, попробуйте позже.
      </Box>
    );
  }

  const updateSubjectHandler = (teacherId, teachSubject) => {
    setLoader(true);
    dispatch(updateTeachSubject(teacherId, teachSubject));
    navigate('/Admin/teachers');
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Typography variant="h6" gutterBottom component="div">
        Выберите предмет
      </Typography>

      <TableContainer>
        <Table aria-label="sclasses table">
          <TableHead>
            <StyledTableRow>
              <StyledTableCell />
              <StyledTableCell align="center">Название предмета</StyledTableCell>
              <StyledTableCell align="center">Код предмета</StyledTableCell>
              <StyledTableCell align="center">Действия</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(subjectsList) && subjectsList.length > 0 && subjectsList.map((subject, index) => (
              <StyledTableRow key={subject._id}>
                <StyledTableCell component="th" scope="row" style={{ color: 'white' }}>
                  {index + 1}
                </StyledTableCell>
                <StyledTableCell align="center">{subject.subName}</StyledTableCell>
                <StyledTableCell align="center">{subject.subCode}</StyledTableCell>
                <StyledTableCell align="center">
                  {situation === 'Norm' ? (
                    <GreenButton
                      variant="contained"
                      onClick={() => navigate(`/Admin/teachers/addteacher/${subject._id}`)}
                    >
                      Выбрать
                    </GreenButton>
                  ) : (
                    <GreenButton
                      variant="contained"
                      disabled={loader}
                      onClick={() => updateSubjectHandler(teacherID, subject._id)}
                    >
                      {loader ? <div className="load" /> : 'Выбрать предмет'}
                    </GreenButton>
                  )}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

//  Валидация пропсов
ChooseSubject.propTypes = {
  situation: PropTypes.string.isRequired,
};

export default ChooseSubject;

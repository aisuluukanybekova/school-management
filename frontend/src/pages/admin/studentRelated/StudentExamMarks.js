// ✅ Исправленный StudentExamMarks.js — устранение бесконечной загрузки

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getUserDetails } from '../../../redux/userRelated/userHandle';
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { updateStudentFields } from '../../../redux/studentRelated/studentHandle';

import Popup from '../../../components/Popup';
import { BlueButton } from '../../../components/buttonStyles';

import {
  Box, InputLabel, MenuItem, Select, Typography, Stack,
  TextField, CircularProgress, FormControl
} from '@mui/material';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ru } from 'date-fns/locale';

const StudentExamMarks = ({ situation }) => {
  const dispatch = useDispatch();
  const { currentUser, userDetails, loading } = useSelector((state) => state.user);
  const { subjectsList } = useSelector((state) => state.sclass);
  const { response, error, statestatus } = useSelector((state) => state.student);
  const params = useParams();

  const [studentID, setStudentID] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [chosenSubName, setChosenSubName] = useState('');
  const [marksObtained, setMarksObtained] = useState('');
  const [date, setDate] = useState(new Date());

  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    if (situation === 'Student') {
      dispatch(getUserDetails(params.id, 'Student'));
      setStudentID(params.id);
    } else if (situation === 'Subject') {
      const { studentID, subjectID } = params;
      dispatch(getUserDetails(studentID, 'Student'));
      setStudentID(studentID);
      setChosenSubName(subjectID);
    }
  }, [dispatch, params, situation]);

  useEffect(() => {
    if (userDetails?.sclassName && situation === 'Student') {
      dispatch(getSubjectList(userDetails.sclassName._id, 'ClassSubjects'));
    }
  }, [dispatch, userDetails?.sclassName, situation]);

  const changeHandler = (event) => {
    const selectedSubject = subjectsList.find(
      (subject) => subject.subName === event.target.value
    );
    setSubjectName(selectedSubject?.subName || '');
    setChosenSubName(selectedSubject?._id || '');
  };

  const fields = {
    subName: chosenSubName,
    marksObtained,
    date,
  };

  const submitHandler = (event) => {
    event.preventDefault();
    setLoader(true);
    dispatch(updateStudentFields(studentID, fields, 'UpdateExamResult'));
  };

  useEffect(() => {
    if (response) {
      setLoader(false);
      setShowPopup(true);
      setMessage(response);
    } else if (error) {
      setLoader(false);
      setShowPopup(true);
      setMessage('Ошибка сети');
    } else if (statestatus === 'added') {
      setLoader(false);
      setShowPopup(true);
      setMessage('Успешно добавлено');
    }
  }, [response, statestatus, error]);

  return (
    <>
      {loading ? (
        <div>Загрузка...</div>
      ) : (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
          <Box sx={{ flex: '1 1 auto', alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ maxWidth: 550, px: 3, py: '100px', width: '100%' }}>
              <Stack spacing={1} sx={{ mb: 3 }}>
                <Typography variant="h4">
                  Ученик: {userDetails?.name}
                </Typography>
                {currentUser?.teachSubject && (
                  <Typography variant="h4">
                    Предмет: {currentUser.teachSubject?.subName}
                  </Typography>
                )}
              </Stack>

              <form onSubmit={submitHandler}>
                <Stack spacing={3}>
                  {situation === 'Student' && (
                    <FormControl fullWidth>
                      <InputLabel id="subject-select-label">Выберите предмет</InputLabel>
                      <Select
                        labelId="subject-select-label"
                        id="subject-select"
                        value={subjectName}
                        label="Предмет"
                        onChange={changeHandler}
                        required
                      >
                        {subjectsList?.length > 0 ? (
                          subjectsList.map((subject, index) => (
                            <MenuItem key={index} value={subject.subName}>
                              {subject.subName}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem value="">Добавьте предметы</MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  )}

                  <TextField
                    type="number"
                    label="Введите баллы"
                    value={marksObtained}
                    required
                    onChange={(e) => setMarksObtained(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />

                  <DatePicker
                    label="Дата оценки"
                    value={date}
                    onChange={(newDate) => setDate(newDate)}
                    maxDate={new Date()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                      }
                    }}
                  />
                </Stack>

                <BlueButton
                  fullWidth
                  size="large"
                  sx={{ mt: 3 }}
                  variant="contained"
                  type="submit"
                  disabled={loader}
                >
                  {loader ? <CircularProgress size={24} color="inherit" /> : 'Сохранить'}
                </BlueButton>
              </form>
            </Box>
          </Box>
          <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </LocalizationProvider>
      )}
    </>
  );
};

export default StudentExamMarks;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Grid, TextField, MenuItem, Typography, Button, CircularProgress,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Popup from '../../../components/Popup';

axios.defaults.baseURL = 'http://localhost:5001';

function AssignSubject() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [subjectId, setSubjectId] = useState('');
  const [classId, setClassId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [sessionsPerWeek, setSessionsPerWeek] = useState('');
  const [loader, setLoader] = useState(false);
  const [message, setMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  // Получаем schoolId из currentUser
  const schoolId = currentUser.schoolId || currentUser.school?._id || currentUser._id;

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [subjectRes, classRes, teacherRes] = await Promise.all([
          axios.get(`/api/subjects/school/${schoolId}`),
          axios.get(`/api/classes/school/${schoolId}`),
          axios.get(`/api/teachers/school/${schoolId}`),
        ]);
        setSubjects(subjectRes.data);
        setClasses(classRes.data);
        setTeachers(teacherRes.data);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        setMessage('Ошибка загрузки данных');
        setShowPopup(true);
      }
    };
    fetchAll();
  }, [schoolId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subjectId || !classId || !teacherId || !sessionsPerWeek) {
      setMessage('Пожалуйста, заполните все поля');
      setShowPopup(true);
      return;
    }

    const payload = {
      teacherID: teacherId,
      subjectId,
      sclassName: classId,
      sessions: sessionsPerWeek,
      school: schoolId, // ✅ Обязательно передаём school
    };

    try {
      setLoader(true);
      await axios.post('/api/teacherSubjectClass', payload);
      navigate('/Admin/subjects');
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      setMessage(error?.response?.data?.message || 'Ошибка при сохранении назначения');
      setShowPopup(true);
    } finally {
      setLoader(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box mb={2}>
        <Typography variant="h6">Назначить предмет классу и учителю</Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            select
            label="Предмет"
            fullWidth
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            required
          >
            {subjects.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.subName}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            select
            label="Класс"
            fullWidth
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            required
          >
            {classes.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.sclassName}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            select
            label="Учитель"
            fullWidth
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            required
          >
            {teachers.map((t) => (
              <MenuItem key={t._id} value={t._id}>
                {t.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Занятий в неделю"
            type="number"
            fullWidth
            value={sessionsPerWeek}
            onChange={(e) => setSessionsPerWeek(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end">
            <Button variant="contained" type="submit" disabled={loader}>
              {loader ? <CircularProgress size={24} /> : 'Сохранить'}
            </Button>
          </Box>
        </Grid>
      </Grid>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </form>
  );
}

export default AssignSubject;

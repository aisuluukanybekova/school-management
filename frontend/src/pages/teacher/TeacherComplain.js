import { useState, useEffect } from 'react';
import {
  Box, TextField, MenuItem, Typography, CircularProgress, Stack, Alert
} from '@mui/material';
import { BlueButton } from '../../components/buttonStyles';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../redux/userRelated/userHandle';

const TeacherComplain = () => {
  const dispatch = useDispatch();
  const { currentUser, status, error } = useSelector(state => state.user);

  const [complaintType, setComplaintType] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [loader, setLoader] = useState(false);
  const [message, setMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [isError, setIsError] = useState(false);

  const fields = {
    teacher: currentUser?._id,
    school: currentUser?.school?._id,
    complaintType,
    description,
    date
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!complaintType || description.trim().length < 10) {
      setMessage("Опишите проблему более подробно (минимум 10 символов).");
      setIsError(true);
      setShowPopup(true);
      return;
    }
    setLoader(true);
    dispatch(addStuff(fields, "teacher-complains"));
  };

  useEffect(() => {
    if (status === "added") {
      setLoader(false);
      setMessage("Жалоба отправлена успешно!");
      setIsError(false);
      setShowPopup(true);
      setComplaintType('');
      setDescription('');
      setDate(new Date().toISOString().substring(0, 10));
    } else if (error) {
      setLoader(false);
      setMessage("Ошибка отправки жалобы");
      setIsError(true);
      setShowPopup(true);
    }
  }, [status, error]);

  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => setShowPopup(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  return (
    <Box sx={{ maxWidth: 550, mx: 'auto', mt: 6 }}>
      <Stack spacing={2}>
        <Typography variant="h5">Оставить жалобу</Typography>

        <TextField
          select
          fullWidth
          label="Тип жалобы"
          value={complaintType}
          onChange={(e) => setComplaintType(e.target.value)}
        >
          <MenuItem value="schedule">Расписание</MenuItem>
          <MenuItem value="student">Ученик</MenuItem>
          <MenuItem value="admin">Администрация</MenuItem>
          <MenuItem value="tech">Техническая проблема</MenuItem>
          <MenuItem value="other">Другое</MenuItem>
        </TextField>

        <TextField
          type="date"
          fullWidth
          label="Дата"
          InputLabelProps={{ shrink: true }}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <TextField
          multiline
          fullWidth
          rows={4}
          label="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={description && description.length < 10}
          helperText={
            description && description.length < 10
              ? "Описание должно быть минимум 10 символов"
              : ""
          }
        />

        <BlueButton
          onClick={submitHandler}
          disabled={loader || !complaintType || description.trim().length < 10}
        >
          {loader ? <CircularProgress size={24} /> : "Отправить"}
        </BlueButton>

        {showPopup && (
          <Alert severity={isError ? "error" : "success"}>
            {message}
          </Alert>
        )}
      </Stack>
    </Box>
  );
};

export default TeacherComplain;

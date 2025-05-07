import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import Popup from '../../../components/Popup';
import { CircularProgress, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import axios from 'axios';

const AddTeacher = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, response, error, currentUser } = useSelector(state => state.user);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [homeroomFor, setHomeroomFor] = useState('');
  const [classes, setClasses] = useState([]);

  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');
  const [loader, setLoader] = useState(false);

  // ✅ Безопасная нормализация school ID
  const school =
    typeof currentUser?.school === 'object'
      ? currentUser.school._id
      : currentUser?.schoolId || currentUser?.school || "";

  useEffect(() => {
    const loadClasses = async () => {
      try {
        if (!school) return;
        const res = await axios.get(`/api/classes/school/${school}`);
        setClasses(res.data);
      } catch (err) {
        console.error('Ошибка загрузки классов', err);
        setMessage('Ошибка загрузки классов');
        setShowPopup(true);
      }
    };
    loadClasses();
  }, [school]);

  const fields = {
    name,
    email,
    password,
    role: "Teacher",
    school,
    ...(homeroomFor ? { homeroomFor } : {})
  };

  const submitHandler = (event) => {
    event.preventDefault();
    setLoader(true);

    console.log("➡️ Отправка данных:", fields); // ✅ DEBUG

    dispatch(registerUser(fields, "Teacher"));
  };

  useEffect(() => {
    if (status === 'added') {
      dispatch(underControl());
      navigate("/Admin/teachers");
    } else if (status === 'failed') {
      setMessage(response?.message || "Ошибка при добавлении");
      setShowPopup(true);
      setLoader(false);
    } else if (status === 'error') {
      setMessage("Ошибка сети");
      setShowPopup(true);
      setLoader(false);
    }
  }, [status, navigate, error, response, dispatch]);

  return (
    <div>
      <div className="register">
        <form className="registerForm" onSubmit={submitHandler}>
          <span className="registerTitle">Добавить преподавателя</span>

          <label>Имя</label>
          <input
            className="registerInput"
            type="text"
            placeholder="Введите имя преподавателя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Почта</label>
          <input
            className="registerInput"
            type="email"
            placeholder="Введите почту преподавателя"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Пароль</label>
          <input
            className="registerInput"
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="homeroom-label">Классный руководитель для</InputLabel>
            <Select
              labelId="homeroom-label"
              value={homeroomFor}
              onChange={(e) => setHomeroomFor(e.target.value)}
              displayEmpty
              label="Классный руководитель для"
            >
              <MenuItem value="">Не назначать</MenuItem>
              {classes.map(cls => (
                <MenuItem key={cls._id} value={cls._id}>
                  {cls.sclassName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <button className="registerButton" type="submit" disabled={loader}>
            {loader ? <CircularProgress size={24} color="inherit" /> : 'Зарегистрировать'}
          </button>
        </form>
      </div>

      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </div>
  );
};

export default AddTeacher;

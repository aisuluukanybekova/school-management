import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { updateUser, getUserDetails } from '../../../redux/userRelated/userHandle';
import { getRequest, underControl } from '../../../redux/userRelated/userSlice';
import Popup from '../../../components/Popup';
import { CircularProgress, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import axios from 'axios';

const EditTeacher = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { userDetails, status, error, response, currentUser } = useSelector((state) => state.user);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [homeroomFor, setHomeroomFor] = useState('');
  const [classes, setClasses] = useState([]);

  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');
  const [loader, setLoader] = useState(false);

  const school =
    typeof currentUser?.school === 'object'
      ? currentUser.school._id
      : currentUser?.schoolId || currentUser?.school || "";

  useEffect(() => {
    dispatch(getUserDetails(id, 'teachers'));

    const loadClasses = async () => {
      try {
        const res = await axios.get(`/api/classes/school/${school}`);
        setClasses(res.data);
      } catch (err) {
        console.error("Ошибка загрузки классов", err);
      }
    };

    loadClasses();
  }, [dispatch, id, school]);

  useEffect(() => {
    if (userDetails) {
      setName(userDetails.name || '');
      setEmail(userDetails.email || '');
      setHomeroomFor(userDetails.homeroomFor?._id || '');
    }
  }, [userDetails]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoader(true);

    const updatedData = {
      name,
      email,
      ...(password && { password }),
      ...(homeroomFor && { homeroomFor })
    };

    dispatch(updateUser(updatedData, id, 'teachers'));
  };

  useEffect(() => {
    if (status === 'success') {
      dispatch(underControl());
      navigate('/Admin/teachers');
    } else if (status === 'failed' || status === 'error') {
      setMessage(response || error || "Ошибка");
      setShowPopup(true);
      setLoader(false);
    }
  }, [status, response, error, dispatch, navigate]);

  return (
    <div>
      <form className="registerForm" onSubmit={handleSubmit}>
        <span className="registerTitle">Редактировать преподавателя</span>

        <label>Имя</label>
        <input
          className="registerInput"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label>Почта</label>
        <input
          className="registerInput"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Новый пароль</label>
        <input
          className="registerInput"
          type="password"
          placeholder="Если хотите обновить"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="homeroom-label">Классный руководитель для</InputLabel>
          <Select
            labelId="homeroom-label"
            value={homeroomFor}
            onChange={(e) => setHomeroomFor(e.target.value)}
            label="Классный руководитель для"
          >
            <MenuItem value="">Не назначать</MenuItem>
            {classes.map((cls) => (
              <MenuItem key={cls._id} value={cls._id}>
                {cls.sclassName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <button className="registerButton" type="submit" disabled={loader}>
          {loader ? <CircularProgress size={24} /> : 'Сохранить'}
        </button>
      </form>

      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </div>
  );
};

export default EditTeacher;

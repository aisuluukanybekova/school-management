import React, { useEffect, useState, useCallback } from 'react'; // useCallback добавлен
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CircularProgress } from '@mui/material';
import { registerUser } from '../../../redux/userRelated/userHandle';
import Popup from '../../../components/Popup';
import { underControl } from '../../../redux/userRelated/userSlice';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';

function AddStudent({ situation }) {
  const dispatch = useDispatch();
  const params = useParams();

  const {
    status, currentUser, response,
  } = useSelector((state) => state.user);
  const { sclassesList } = useSelector((state) => state.sclass);

  const [name, setName] = useState('');
  const [rollNum, setRollNum] = useState('');
  const [password, setPassword] = useState('');
  const [className, setClassName] = useState('');
  const [sclassName, setSclassName] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');
  const [loader, setLoader] = useState(false);

  const adminID = currentUser._id;
  const role = 'Student';
  const attendance = [];

  useEffect(() => {
    if (situation === 'Class') {
      setSclassName(params.id);
    }
  }, [params.id, situation]);

  useEffect(() => {
    dispatch(getAllSclasses(adminID));
  }, [adminID, dispatch]);

  const changeHandler = (e) => {
    const selected = e.target.value;
    const foundClass = sclassesList.find((c) => c.sclassName === selected);
    if (foundClass) {
      setClassName(foundClass.sclassName);
      setSclassName(foundClass._id);
    } else {
      setClassName('');
      setSclassName('');
    }
  };

  // ✅ useCallback для стабилизации ссылки на функцию
  const resetForm = useCallback(() => {
    setName('');
    setRollNum('');
    setPassword('');
    setClassName('');
    if (situation === 'Student') setSclassName('');
  }, [situation]);

  const fields = {
    name, rollNum, password, sclassName, adminID, role, attendance,
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!sclassName) {
      setMessage('Пожалуйста, выберите класс');
      setShowPopup(true);
      return;
    }
    setLoader(true);
    dispatch(registerUser(fields, role));
  };

  useEffect(() => {
    if (status === 'added') {
      resetForm();
      setMessage('Ученик успешно добавлен!');
      setShowPopup(true);
      setLoader(false);
      dispatch(underControl());
    } else if (status === 'failed') {
      setMessage(response || 'Ошибка при добавлении ученика');
      setShowPopup(true);
      setLoader(false);
    } else if (status === 'error') {
      setMessage('Ошибка сети');
      setShowPopup(true);
      setLoader(false);
    }
  }, [status, dispatch, resetForm, response]); // ✅ resetForm безопасно включён

  return (
    <>
      <div className="register">
        <form className="registerForm" onSubmit={submitHandler}>
          <span className="registerTitle">Добавить ученика</span>

          <label htmlFor="studentName">Имя</label>
          <input
            id="studentName"
            className="registerInput"
            type="text"
            placeholder="Введите имя ученика..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />

          {situation === 'Student' && (
            <>
              <label htmlFor="studentClass">Класс</label>
              <select
                id="studentClass"
                className="registerInput"
                value={className}
                onChange={changeHandler}
                required
              >
                <option value="">Выберите класс</option>
                {sclassesList.map((cls) => (
                  <option key={cls._id} value={cls.sclassName}>{cls.sclassName}</option>
                ))}
              </select>
            </>
          )}

          <label htmlFor="rollNum">Номер ученика</label>
          <input
            id="rollNum"
            className="registerInput"
            type="number"
            placeholder="Введите номер ученика..."
            value={rollNum}
            onChange={(e) => setRollNum(e.target.value)}
            required
          />

          <label htmlFor="studentPassword">Пароль</label>
          <input
            id="studentPassword"
            className="registerInput"
            type="password"
            placeholder="Введите пароль ученика..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          <button className="registerButton" type="submit" disabled={loader}>
            {loader ? <CircularProgress size={24} color="inherit" /> : 'Добавить'}
          </button>
        </form>
      </div>
      <Popup message={message} showPopup={showPopup} setShowPopup={setShowPopup} />
    </>
  );
}

AddStudent.propTypes = {
  situation: PropTypes.string.isRequired,
};

export default AddStudent;

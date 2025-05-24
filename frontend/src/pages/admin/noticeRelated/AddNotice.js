import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CircularProgress } from '@mui/material';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import Popup from '../../../components/Popup';

function AddNotice() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, response, error } = useSelector((state) => state.user);
  const { currentUser } = useSelector((state) => state.user);

  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [date, setDate] = useState('');
  const schoolId = currentUser._id;

  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');

  const address = 'notice';

  const fields = {
    title,
    details,
    date,
    schoolId,
  };

  const resetForm = () => {
    setTitle('');
    setDetails('');
    setDate('');
  };

  const submitHandler = (event) => {
    event.preventDefault();
    setLoader(true);
    dispatch(addStuff(fields, address));
  };

  useEffect(() => {
    if (status === 'added') {
      setMessage('Объявление успешно добавлено!');
      setShowPopup(true);
      resetForm();
      setLoader(false);
      dispatch(underControl());
      navigate('/Admin/notices');
    } else if (status === 'failed') {
      setMessage(response || 'Ошибка при добавлении объявления');
      setShowPopup(true);
      setLoader(false);
    } else if (status === 'error') {
      setMessage('Ошибка сети');
      setShowPopup(true);
      setLoader(false);
    }
  }, [status, navigate, error, response, dispatch]);

  return (
    <>
      <div className="register">
        <form className="registerForm" onSubmit={submitHandler}>
          <span className="registerTitle">Добавить объявление</span>

          <label htmlFor="noticeTitle">Заголовок</label>
          <input
            id="noticeTitle"
            className="registerInput"
            type="text"
            placeholder="Введите заголовок объявления..."
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />

          <label htmlFor="noticeDetails">Описание</label>
          <input
            id="noticeDetails"
            className="registerInput"
            type="text"
            placeholder="Введите описание объявления..."
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            required
          />

          <label htmlFor="noticeDate">Дата</label>
          <input
            id="noticeDate"
            className="registerInput"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />

          <button className="registerButton" type="submit" disabled={loader}>
            {loader ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Добавить'
            )}
          </button>
        </form>
      </div>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </>
  );
}

export default AddNotice;

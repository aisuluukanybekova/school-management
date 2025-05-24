import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Box,
  CircularProgress,
  Backdrop,
  Typography,
  Avatar,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import PropTypes from 'prop-types';
import { loginUser } from '../redux/userRelated/userHandle';
import Popup from '../components/Popup';

const GlobalStyle = createGlobalStyle`
  html {
    scroll-behavior: smooth;
  }
`;

function ChooseUser({ visitor }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const password = 'zxc';

  const { status, currentUser, currentRole } = useSelector((state) => state.user);

  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');

  const navigateHandler = (user) => {
    if (visitor !== 'guest') {
      navigate(`/${user}login`);
      return;
    }
    const credentials = {
      Admin: { email: 'yogendra@12', password },
      Student: { rollNum: '1', studentName: 'Dipesh Awasthi', password },
      Teacher: { email: 'tony@12', password },
    };

    setLoader(true);
    dispatch(loginUser(credentials[user], user));
  };

  useEffect(() => {
    if (status === 'success' || currentUser) {
      navigate(`/${currentRole}/dashboard`);
    } else if (status === 'error') {
      setLoader(false);
      setMessage('Ошибка сети');
      setShowPopup(true);
    }
  }, [status, currentRole, navigate, currentUser]);

  const roles = [
    {
      key: 'Admin',
      icon: <Avatar src="/avatars/admin.png" sx={{ width: 36, height: 36 }} />,
      title: 'Администратор',
      description: 'Управление школой, пользователями и аналитикой.',
    },
    {
      key: 'Teacher',
      icon: <Avatar src="/avatars/teacher.png" sx={{ width: 36, height: 36 }} />,
      title: 'Учитель',
      description: 'Ведение журнала, оценок и расписания.',
    },
    {
      key: 'Student',
      icon: <Avatar src="/avatars/student.png" sx={{ width: 36, height: 36 }} />,
      title: 'Ученик',
      description: 'Просмотр оценок, заданий и расписания.',
    },
  ];

  return (
    <>
      <GlobalStyle />
      <Background>
        <VerticalContainer>
          <HeaderContainer>
            <Typography variant="body1" gutterBottom sx={{ color: 'white' }}>
              Выберите роль для входа в систему
            </Typography>
          </HeaderContainer>
          <CardStack>
            {roles.map(({
              key, icon, title, description,
            }) => (
              <StyledPaper key={key} elevation={4} onClick={() => navigateHandler(key)}>
                <Box className="paperContent">
                  {icon}
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 1 }}>{title}</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{description}</Typography>
                </Box>
              </StyledPaper>
            ))}
          </CardStack>
        </VerticalContainer>
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loader}>
          <CircularProgress color="inherit" />
          <Box ml={2}>Пожалуйста, подождите...</Box>
        </Backdrop>
        <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
      </Background>
    </>
  );
}

ChooseUser.propTypes = {
  visitor: PropTypes.string.isRequired,
};

export default ChooseUser;

// === Animations & Styles ===

const glow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Background = styled.div`
  min-height: 100vh;
  padding: 1rem;
  background: radial-gradient(circle at 10% 20%, #2d0060, #1f003b, #340068);
  background-size: 400% 400%;
  animation: ${glow} 12s ease infinite;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
`;

const CardStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  margin-top: -30px; 
`;

const StyledPaper = styled(Paper)`
  width: 360px;
  height: 180px;
  padding: 1.2rem;
  background-color: #ffffff;
  color: #333;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0px 6px 16px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  animation: ${fadeInUp} 0.6s ease forwards;
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  &:hover {
    background-color: #f6f6f6;
    transform: scale(1.06);
    box-shadow: 0 0 24px rgba(255, 255, 255, 0.75);
  }

  &:active {
    background-color: #eaeaea;
    transform: scale(0.99);
    box-shadow: 0 0 28px rgba(255, 255, 255, 0.85);
  }

  .paperContent {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
`;

const VerticalContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 4vh; 
`;

const HeaderContainer = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

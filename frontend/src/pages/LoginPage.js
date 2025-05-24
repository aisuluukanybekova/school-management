import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid, Box, Typography, Paper, Checkbox, FormControlLabel,
  TextField, CssBaseline, IconButton, InputAdornment, CircularProgress, Backdrop,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import styled, { keyframes } from 'styled-components';
import PropTypes from 'prop-types';
import bgpic from '../assets/designlogin.jpg';
import { LightPurpleButton } from '../components/buttonStyles';
import { loginUser } from '../redux/userRelated/userHandle';
import Popup from '../components/Popup';

const defaultTheme = createTheme();

function LoginPage({ userRole }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    status, currentUser, response, error, currentRole,
  } = useSelector((state) => state.user);

  const [toggle, setToggle] = useState(false);
  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');

  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [rollNumberError, setRollNumberError] = useState(false);
  const [studentNameError, setStudentNameError] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (userRole === 'Student') {
      const rollNum = event.target.rollNumber.value;
      const studentName = event.target.studentName.value;
      const password = event.target.password.value;

      if (!rollNum || !studentName || !password) {
        if (!rollNum) setRollNumberError(true);
        if (!studentName) setStudentNameError(true);
        if (!password) setPasswordError(true);
        return;
      }

      const fields = { rollNum, studentName, password };
      setLoader(true);
      dispatch(loginUser(fields, userRole));
    } else {
      const email = event.target.email.value;
      const password = event.target.password.value;

      if (!email || !password) {
        if (!email) setEmailError(true);
        if (!password) setPasswordError(true);
        return;
      }

      const fields = { email, password };
      setLoader(true);
      dispatch(loginUser(fields, userRole));
    }
  };

  const handleInputChange = (event) => {
    const { name } = event.target;
    if (name === 'email') setEmailError(false);
    if (name === 'password') setPasswordError(false);
    if (name === 'rollNumber') setRollNumberError(false);
    if (name === 'studentName') setStudentNameError(false);
  };

  useEffect(() => {
    if (status === 'success' || currentUser !== null) {
      if (currentRole === 'Admin') navigate('/Admin/dashboard');
      else if (currentRole === 'Student') navigate('/Student/dashboard');
      else if (currentRole === 'Teacher') navigate('/Teacher/dashboard');
    } else if (status === 'failed') {
      setMessage(response);
      setShowPopup(true);
      setLoader(false);
    } else if (status === 'error') {
      setMessage('Ошибка сети');
      setShowPopup(true);
      setLoader(false);
    }
  }, [status, currentRole, navigate, error, response, currentUser]);

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid item xs={12} sm={8} md={5} component={StyledPaper} elevation={6} square>
          <StyledFormContainer>
            <Typography
              variant="h4"
              sx={{
                mb: 2, color: '#2c2143', fontWeight: 700, textAlign: 'center',
              }}
            >
              {userRole === 'Admin' ? 'Администратор — вход'
                : userRole === 'Teacher' ? 'Преподаватель — вход'
                  : userRole === 'Student' ? 'Ученик — вход' : 'Вход'}
            </Typography>
            <Typography variant="body1" sx={{ textAlign: 'center', mb: 3, color: '#444' }}>
              Добро пожаловать! Пожалуйста, введите свои данные
            </Typography>

            <Box component="form" noValidate onSubmit={handleSubmit}>
              {userRole === 'Student' ? (
                <>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="rollNumber"
                    label="Номер студента"
                    name="rollNumber"
                    autoComplete="off"
                    type="number"
                    error={rollNumberError}
                    helperText={rollNumberError && 'Номер обязателен'}
                    onChange={handleInputChange}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="studentName"
                    label="Имя"
                    name="studentName"
                    autoComplete="name"
                    error={studentNameError}
                    helperText={studentNameError && 'Имя обязательно'}
                    onChange={handleInputChange}
                  />
                </>
              ) : (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  error={emailError}
                  helperText={emailError && 'Email обязателен'}
                  onChange={handleInputChange}
                />
              )}
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Пароль"
                type={toggle ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                error={passwordError}
                helperText={passwordError && 'Пароль обязателен'}
                onChange={handleInputChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setToggle(!toggle)}>
                        {toggle ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Grid container sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <FormControlLabel
                  control={<Checkbox value="remember" color="primary" />}
                  label="Запомнить меня"
                />
                <StyledLink href="#">Забыли пароль?</StyledLink>
              </Grid>
              <LightPurpleButton
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3 }}
              >
                {loader ? <CircularProgress size={24} color="inherit" /> : 'Войти'}
              </LightPurpleButton>
              {userRole === 'Admin' && (
                <Grid container justifyContent="center" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Нет аккаунта?
                    {' '}
                    <StyledLink to="/Adminregister">Зарегистрироваться</StyledLink>
                  </Typography>
                </Grid>
              )}
            </Box>
          </StyledFormContainer>
        </Grid>

        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: `url(${bgpic})`,
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) => (t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900]),
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </Grid>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={false}>
        <CircularProgress color="primary" />
        Пожалуйста, подождите...
      </Backdrop>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </ThemeProvider>
  );
}

LoginPage.propTypes = {
  userRole: PropTypes.string.isRequired,
};

export default LoginPage;

const StyledLink = styled(Link)`
  margin-top: 9px;
  text-decoration: none;
  color: #7f56da;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
    color: #5a38b2;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const StyledFormContainer = styled(Box)`
  margin-top: clamp(30px, 5vh, 60px);
  margin-left: 32px;
  margin-right: 32px;
  padding: 32px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.6s ease-out;
`;

const StyledPaper = styled(Paper)`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background-color: transparent;
`;

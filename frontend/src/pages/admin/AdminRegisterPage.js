import * as React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid,
  Typography,
  Checkbox,
  FormControlLabel,
  TextField,
  CssBaseline,
  IconButton,
  InputAdornment,
  CircularProgress,
  Box,
  Paper,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import bgpic from "../../assets/designlogin.jpg";
import { LightPurpleButton } from '../../components/buttonStyles';
import { registerUser } from '../../redux/userRelated/userHandle';
import styled, { keyframes } from 'styled-components';
import Popup from '../../components/Popup';

const defaultTheme = createTheme();

const AdminRegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { status, currentUser, response, error, currentRole } = useSelector(state => state.user);

  const [toggle, setToggle] = useState(false);
  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [adminNameError, setAdminNameError] = useState(false);
  const [schoolNameError, setSchoolNameError] = useState(false);

  const role = "Admin";

  const handleSubmit = (event) => {
    event.preventDefault();

    const name = event.target.adminName.value;
    const schoolName = event.target.schoolName.value;
    const email = event.target.email.value;
    const password = event.target.password.value;

    if (!name || !schoolName || !email || !password) {
      if (!name) setAdminNameError(true);
      if (!schoolName) setSchoolNameError(true);
      if (!email) setEmailError(true);
      if (!password) setPasswordError(true);
      return;
    }

    const fields = { name, email, password, role, schoolName };
    setLoader(true);
    dispatch(registerUser(fields, role));
  };

  const handleInputChange = (event) => {
    const { name } = event.target;
    if (name === 'email') setEmailError(false);
    if (name === 'password') setPasswordError(false);
    if (name === 'adminName') setAdminNameError(false);
    if (name === 'schoolName') setSchoolNameError(false);
  };

  useEffect(() => {
    if (status === 'success' || (currentUser !== null && currentRole === 'Admin')) {
      navigate('/Admin/dashboard');
    } else if (status === 'failed') {
      setMessage(response);
      setShowPopup(true);
      setLoader(false);
    } else if (status === 'error') {
      console.log(error);
    }
  }, [status, currentUser, currentRole, navigate, error, response]);

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid item xs={12} sm={8} md={5} component={StyledPaper} elevation={6} square>
          <StyledFormContainer>
          <Typography variant="h4" sx={{ mb: 2, color: "#2c2143", fontWeight: 700, textAlign: 'center' }}>
               Регистрация администратора
             </Typography>
             <Typography variant="body2" sx={{ mb: 3, textAlign: "center", color: "#555" }}>
               Создайте свою школу и начните управлять учениками и преподавателями
               </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="adminName"
                label="Ваше имя"
                name="adminName"
                autoComplete="name"
                autoFocus
                error={adminNameError}
                helperText={adminNameError && 'Имя обязательно'}
                onChange={handleInputChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="schoolName"
                label="Название школы"
                name="schoolName"
                autoComplete="off"
                error={schoolNameError}
                helperText={schoolNameError && 'Укажите название школы'}
                onChange={handleInputChange}
              />
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
              <Grid container sx={{ display: "flex", justifyContent: "space-between" }}>
                <FormControlLabel
                  control={<Checkbox value="remember" color="primary" />}
                  label="Запомнить меня"
                />
              </Grid>
              <LightPurpleButton
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                {loader ? <CircularProgress size={24} color="inherit" /> : "Зарегистрироваться"}
              </LightPurpleButton>
              <Grid container justifyContent="center">
                <Typography variant="body2">
                  Уже есть аккаунт?{' '}
                  <StyledLink to="/Adminlogin">Войти</StyledLink>
                </Typography>
              </Grid>
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
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </Grid>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </ThemeProvider>
  );
};

export default AdminRegisterPage;

// === Styled Components ===

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
  margin-top: clamp(10px, 4vh, 60px);
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

const StyledLink = styled(Link)`
  text-decoration: none;
  color: #7f56da;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
    color: #5a38b2;
  }
`;


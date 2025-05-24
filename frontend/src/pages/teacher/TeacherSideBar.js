import React from 'react';
import {
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Tooltip,
  Box,
  Typography,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import HomeIcon from '@mui/icons-material/Home';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import GradeIcon from '@mui/icons-material/Grade';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SubjectIcon from '@mui/icons-material/Subject';
import { useSelector } from 'react-redux';

function TeacherSideBar() {
  const { currentUser } = useSelector((state) => state.user);
  const sclassName = currentUser.teachSclass;
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  const navItems = [
    {
      text: 'Главная', full: 'Главная', icon: <HomeIcon />, path: '/',
    },
    {
      text: `Класс ${sclassName?.sclassName || ''}`,
      full: 'Управление классом',
      icon: <ClassOutlinedIcon />,
      path: '/Teacher/class',
    },
    {
      text: 'Журнал оценок',
      full: 'Журнал оценок',
      icon: <GradeIcon />,
      path: '/Teacher/gradebook',
    },
    {
      text: 'Журнал посещаемости',
      full: 'Журнал посещаемости',
      icon: <EventAvailableIcon />,
      path: '/Teacher/attendance',
    },
    {
      text: 'Моё расписание',
      full: 'Расписание учителя',
      icon: <CalendarMonthIcon />,
      path: '/Teacher/schedule',
    },
    {
      text: 'Жалоба',
      full: 'Жалоба',
      icon: <AnnouncementOutlinedIcon />,
      path: '/Teacher/complain',
    },
    {
      text: 'Темы уроков',
      full: 'Темы уроков',
      icon: <SubjectIcon />,
      path: '/Teacher/topics',
    },
  ];

  const userItems = [
    {
      text: 'Профиль', full: 'Профиль', icon: <AccountCircleOutlinedIcon />, path: '/Teacher/profile',
    },
    {
      text: 'Выйти', full: 'Выход', icon: <ExitToAppIcon />, path: '/logout',
    },
  ];

  return (
    <Box sx={{ px: 1 }}>
      <Typography
        variant="h6"
        noWrap
        sx={{
          px: 2,
          py: 2,
          fontWeight: 'bold',
          fontSize: '18px',
          display: { xs: 'none', sm: 'block' },
        }}
      >
        Панель учителя
      </Typography>

      {navItems.map(({
        text, full, icon, path,
      }) => (
        <Tooltip title={full} placement="right" key={text} arrow>
          <ListItemButton
            component={Link}
            to={path}
            selected={isActive(path)}
            sx={{ borderRadius: 2, my: 0.5 }}
          >
            <ListItemIcon sx={{ color: isActive(path) ? 'primary.main' : 'inherit' }}>
              {icon}
            </ListItemIcon>
            <ListItemText
              primary={text}
              primaryTypographyProps={{
                noWrap: true,
                sx: {
                  fontSize: '14px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: { xs: 'none', sm: 'block' },
                },
              }}
            />
          </ListItemButton>
        </Tooltip>
      ))}

      {/* 🔥 Классный руководитель */}
      {currentUser?.homeroomFor && (
        <>
          <Divider sx={{ my: 2 }} />
          <ListSubheader component="div" inset>Дополнительно</ListSubheader>
          <Tooltip title="Классный руководитель" placement="right" arrow>
            <ListItemButton
              component={Link}
              to="/Teacher/homeroom"
              selected={isActive('/Teacher/homeroom')}
              sx={{ borderRadius: 2, my: 0.5 }}
            >
              <ListItemIcon sx={{ color: isActive('/Teacher/homeroom') ? 'primary.main' : 'inherit' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText
                primary="Классный руководитель"
                primaryTypographyProps={{
                  noWrap: true,
                  sx: {
                    fontSize: '14px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: { xs: 'none', sm: 'block' },
                  },
                }}
              />
            </ListItemButton>
          </Tooltip>
        </>
      )}

      <Divider sx={{ my: 2 }} />
      <ListSubheader component="div" inset>Пользователь</ListSubheader>

      {userItems.map(({
        text, full, icon, path,
      }) => (
        <Tooltip title={full} placement="right" key={text} arrow>
          <ListItemButton
            component={Link}
            to={path}
            selected={isActive(path)}
            sx={{ borderRadius: 2, my: 0.5 }}
          >
            <ListItemIcon sx={{ color: isActive(path) ? 'primary.main' : 'inherit' }}>
              {icon}
            </ListItemIcon>
            <ListItemText
              primary={text}
              primaryTypographyProps={{
                noWrap: true,
                sx: {
                  fontSize: '14px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: { xs: 'none', sm: 'block' },
                },
              }}
            />
          </ListItemButton>
        </Tooltip>
      ))}
    </Box>
  );
}

export default TeacherSideBar;

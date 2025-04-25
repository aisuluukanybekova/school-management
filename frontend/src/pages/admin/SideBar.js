import * as React from 'react';
import {
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Tooltip,
  Box
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import HomeIcon from "@mui/icons-material/Home";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import ReportIcon from '@mui/icons-material/Report';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SettingsIcon from '@mui/icons-material/Settings';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import DateRangeIcon from '@mui/icons-material/DateRange';
const SideBar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);

  const navItems = [
    { text: 'Главная', full: 'Главная', icon: <HomeIcon />, path: '/' },
    { text: 'Классы', full: 'Классы', icon: <ClassOutlinedIcon />, path: '/Admin/classes' },
    { text: 'Предметы', full: 'Предметы', icon: <AssignmentIcon />, path: '/Admin/subjects' },
    { text: 'Учителя', full: 'Учителя', icon: <SupervisorAccountOutlinedIcon />, path: '/Admin/teachers' },
    { text: 'Расписание', full: 'Расписание учителей', icon: <AssignmentIcon />, path: '/Admin/teacher-schedule' },
    { text: 'Ученики', full: 'Ученики', icon: <PersonOutlineIcon />, path: '/Admin/students' },
    { text: 'Объявления', full: 'Объявления', icon: <AnnouncementOutlinedIcon />, path: '/Admin/notices' },
    { text: 'Жалобы', full: 'Жалобы', icon: <ReportIcon />, path: '/Admin/complains' },
    { text: 'Журнал', full: 'Журнал оценок', icon: <LibraryBooksIcon />, path: '/Admin/journal' },
    { text: 'Посещаемость', full: 'Журнал посещаемости', icon: <EventAvailableIcon />, path: '/Admin/attendance' },
    { text: 'Четверти', full: 'Управление четвертями', icon: <DateRangeIcon />, path: '/Admin/terms' },
    {
      text: 'Четверти (таблица)',
      full: 'Обзор четвертей',
      icon: <DateRangeIcon />,
      path: '/Admin/term-overview'
    }
  ];

  const userItems = [
    { text: 'Профиль', full: 'Профиль', icon: <AccountCircleOutlinedIcon />, path: '/Admin/profile' },
    { text: 'Настройки', full: 'Настройки', icon: <SettingsIcon />, path: '/Admin/settings' },
    { text: 'Выход', full: 'Выход', icon: <ExitToAppIcon />, path: '/logout' },
  ];

  return (
    <Box sx={{ px: 1 }}>
      {navItems.map(({ text, full, icon, path }) => (
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
                }
              }}
            />
          </ListItemButton>
        </Tooltip>
      ))}

      <Divider sx={{ my: 2 }} />

      <ListSubheader component="div" inset>Пользователь</ListSubheader>
      {userItems.map(({ text, full, icon, path }) => (
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
                }
              }}
            />
          </ListItemButton>
        </Tooltip>
      ))}
    </Box>
  );
};

export default SideBar;

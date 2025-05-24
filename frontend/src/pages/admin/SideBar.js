import * as React from 'react';
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
import { motion } from 'framer-motion';

import HomeIcon from '@mui/icons-material/Home';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import ReportIcon from '@mui/icons-material/Report';
import AssignmentIcon from '@mui/icons-material/Assignment';
// import SettingsIcon from '@mui/icons-material/Settings';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

function SideBar() {
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);

  const navItems = [
    { text: 'Главная', icon: <HomeIcon />, path: '/' },
    { text: 'Классы', icon: <ClassOutlinedIcon />, path: '/Admin/classes' },
    { text: 'Предметы', icon: <AssignmentIcon />, path: '/Admin/subjects' },
    { text: 'Учителя', icon: <SupervisorAccountOutlinedIcon />, path: '/Admin/teachers' },
    { text: 'Ученики', icon: <PersonOutlineIcon />, path: '/Admin/students' },
    { text: 'Просмотр оценок', icon: <LibraryBooksIcon />, path: '/Admin/journal' },
    { text: 'Просмотр посещаемости', icon: <EventAvailableIcon />, path: '/Admin/attendance' },
    { text: 'Объявления', icon: <AnnouncementOutlinedIcon />, path: '/Admin/notices' },
    { text: 'Жалобы', icon: <ReportIcon />, path: '/Admin/complains' },
    { text: 'Четверти', icon: <DateRangeIcon />, path: '/Admin/terms' },
    { text: 'Расписание', icon: <AssignmentIcon />, path: '/Admin/teacher-schedule' },
    { text: 'Создать расписание', icon: <AddCircleOutlineIcon />, path: '/Admin/add-schedule' },
  ];

  const userItems = [
    { text: 'Профиль', icon: <AccountCircleOutlinedIcon />, path: '/Admin/profile' },
    // { text: 'Настройки', icon: <SettingsIcon />, path: '/Admin/settings' },
    { text: 'Выход', icon: <ExitToAppIcon />, path: '/logout' },
  ];

  return (
    <Box sx={{ px: 1 }}>
      {/* Заголовок вверху */}
      <Box sx={{ py: 3, textAlign: 'center', display: { xs: 'none', sm: 'block' } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
          Панель администратора
        </Typography>
      </Box>

      {navItems.map(({ text, icon, path }) => (
        <Tooltip title={text} placement="right" key={text} arrow>
          <motion.div whileHover={{ scale: 1.03 }}>
            <ListItemButton
              component={Link}
              to={path}
              selected={isActive(path)}
              sx={{
                borderRadius: 2,
                my: 0.5,
                px: 2,
                bgcolor: isActive(path) ? 'primary.light' : 'transparent',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ListItemIcon sx={{ color: isActive(path) ? 'primary.main' : 'inherit' }}>
                {icon}
              </ListItemIcon>
              <ListItemText
                primary={text}
                primaryTypographyProps={{
                  sx: {
                    fontSize: '14px',
                    display: { xs: 'none', sm: 'block' },
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  },
                }}
              />
            </ListItemButton>
          </motion.div>
        </Tooltip>
      ))}

      <Divider sx={{ my: 2 }} />

      <ListSubheader component="div" inset sx={{ display: { xs: 'none', sm: 'block' } }}>
        Пользователь
      </ListSubheader>

      {userItems.map(({ text, icon, path }) => (
        <Tooltip title={text} placement="right" key={text} arrow>
          <motion.div whileHover={{ scale: 1.03 }}>
            <ListItemButton
              component={Link}
              to={path}
              selected={isActive(path)}
              sx={{
                borderRadius: 2,
                my: 0.5,
                px: 2,
                bgcolor: isActive(path) ? 'primary.light' : 'transparent',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ListItemIcon sx={{ color: isActive(path) ? 'primary.main' : 'inherit' }}>
                {icon}
              </ListItemIcon>
              <ListItemText
                primary={text}
                primaryTypographyProps={{
                  sx: {
                    fontSize: '14px',
                    display: { xs: 'none', sm: 'block' },
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  },
                }}
              />
            </ListItemButton>
          </motion.div>
        </Tooltip>
      ))}
    </Box>
  );
}

export default SideBar;

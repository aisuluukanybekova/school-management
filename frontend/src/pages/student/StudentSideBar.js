import React from 'react';
import {
  Box,
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Tooltip,
  Typography,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

import HomeIcon from '@mui/icons-material/Home';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GradeIcon from '@mui/icons-material/Grade';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
// import SmartToyIcon from '@mui/icons-material/SmartToy';

function StudentSideBar() {
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);

  const navItems = [
    { text: 'Главная', icon: <HomeIcon />, path: '/' },
    { text: 'Предметы', icon: <AssignmentIcon />, path: '/Student/subjects' },
    { text: 'Посещаемость', icon: <ClassOutlinedIcon />, path: '/Student/attendance' },
    { text: 'Успеваемость', icon: <GradeIcon />, path: '/student/grades' },
    { text: 'Расписание', icon: <CalendarMonthIcon />, path: '/student/schedule' },
    { text: 'Жалоба', icon: <AnnouncementOutlinedIcon />, path: '/Student/complain' },
    // { text: 'AI Помощник', icon: <SmartToyIcon />, path: '/student/ai-tutor' },
  ];

  const userItems = [
    { text: 'Профиль', icon: <AccountCircleOutlinedIcon />, path: '/Student/profile' },
    { text: 'Выход', icon: <ExitToAppIcon />, path: '/logout' },
  ];

  return (
    <Box sx={{ px: 1 }}>
      {/* Sidebar Header (optional) */}
      <Box sx={{ py: 3, textAlign: 'center', display: { xs: 'none', sm: 'block' } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
          Панель ученика
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

export default StudentSideBar;

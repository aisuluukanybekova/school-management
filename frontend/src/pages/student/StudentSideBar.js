import React from 'react';
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
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';

const StudentSideBar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);

  const navItems = [
    { text: 'Главная', full: 'Главная', icon: <HomeIcon />, path: '/' },
    { text: 'Предметы', full: 'Предметы', icon: <AssignmentIcon />, path: '/Student/subjects' },
    { text: 'Посещаемость', full: 'Посещаемость', icon: <ClassOutlinedIcon />, path: '/Student/attendance' },
    { text: 'Жалоба', full: 'Жалоба', icon: <AnnouncementOutlinedIcon />, path: '/Student/complain' },
  ];

  const userItems = [
    { text: 'Профиль', full: 'Профиль', icon: <AccountCircleOutlinedIcon />, path: '/Student/profile' },
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

export default StudentSideBar;

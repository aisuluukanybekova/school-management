// src/pages/Admin/TermTabs.jsx
import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import { useSelector } from 'react-redux';
import AdminTermManager from './AdminTermManager';
import TermOverview from './TermOverview';

function TermTabs() {
  const [tabIndex, setTabIndex] = useState(0);
  const admin = useSelector((state) => state.user.currentUser);
  const schoolId = admin?.schoolId || admin?.school?._id;

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Box>
      <Paper elevation={1} sx={{ mb: 2, borderRadius: 1 }}>
        <Tabs
          value={tabIndex}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Управление" />
          <Tab label="Обзор" />
        </Tabs>
      </Paper>

      <Box mt={2}>
        {tabIndex === 0 && <AdminTermManager />}
        {tabIndex === 1 && <TermOverview schoolId={schoolId} />}
      </Box>
    </Box>
  );
}

export default TermTabs;

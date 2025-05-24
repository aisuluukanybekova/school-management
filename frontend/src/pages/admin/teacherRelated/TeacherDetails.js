import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Avatar, CircularProgress, Container,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import styled from 'styled-components';
import { getGroupedTeacherSubjects } from '../../../redux/teacherRelated/teacherHandle';

function TeacherDetails() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { teachersList, loading } = useSelector((state) => state.teacher);

  useEffect(() => {
    dispatch(getGroupedTeacherSubjects());
  }, [dispatch]);

  const teacher = teachersList.find((t) => t._id === id);

  const grouped = {};
  teacher?.assignments?.forEach(({ subject, class: cls, sessions }) => {
    if (!grouped[subject]) {
      grouped[subject] = [];
    }
    grouped[subject].push({ class: cls, sessions });
  });

  return (
    <Container maxWidth="sm">
      <StyledCard elevation={3}>
        {loading || !teacher ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box p={3}>
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <Avatar sx={{ width: 80, height: 80, mb: 1 }}>
                {teacher.name.charAt(0)}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {teacher.name}
              </Typography>
              <Typography variant="subtitle1">
                Email:
                {' '}
                <strong>{teacher.email}</strong>
              </Typography>
            </Box>

            {Object.keys(grouped).length > 0 ? (
              Object.entries(grouped).map(([subject, entries]) => (
                <Box key={subject} mt={3}>
                  <InfoRow>
                    <LaptopMacIcon color="primary" />
                    <Typography variant="h6" ml={1}>
                      Предмет: <strong>{subject}</strong>
                    </Typography>
                  </InfoRow>
                  {entries.map((entry) => (
                    <Box key={`${entry.class}-${entry.sessions}`} ml={4} mt={1}>
                      <InfoRow>
                        <ClassIcon color="primary" />
                        <Typography variant="subtitle1" ml={1}>
                          Класс: <strong>{entry.class}</strong>
                        </Typography>
                      </InfoRow>
                      <InfoRow>
                        <SchoolIcon color="primary" />
                        <Typography variant="subtitle1" ml={1}>
                          {entry.sessions} занятий в неделю
                        </Typography>
                      </InfoRow>
                    </Box>
                  ))}
                </Box>
              ))
            ) : (
              <Typography align="center" color="text.secondary">
                Нет назначенных предметов
              </Typography>
            )}
          </Box>
        )}
      </StyledCard>
    </Container>
  );
}

export default TeacherDetails;

const StyledCard = styled(Paper)`
  margin-top: 40px;
  padding: 24px;
  border-radius: 16px;
`;

const InfoRow = styled(Box)`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

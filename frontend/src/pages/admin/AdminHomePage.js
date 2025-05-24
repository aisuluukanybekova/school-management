import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Container, Grid, Paper } from '@mui/material';
import styled from 'styled-components';
import CountUp from 'react-countup';
import { useDispatch, useSelector } from 'react-redux';

import SchoolIcon from '@mui/icons-material/School';
import GroupsIcon from '@mui/icons-material/Groups';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { motion } from 'framer-motion';
import { getAllTeachers } from '../../redux/teacherRelated/teacherHandle';
import { getAllSclasses } from '../../redux/sclassRelated/sclassHandle';
import SeeNotice from '../../components/SeeNotice';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';

function StatCard({ icon, label, value, duration = 2.5 }) {
  return (
    <MotionPaper
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <IconWrapper>{icon}</IconWrapper>
      <Label>{label}</Label>
      <Count>
        <CountUp start={0} end={value} duration={duration} />
      </Count>
    </MotionPaper>
  );
}

// PropTypes
StatCard.propTypes = {
  icon: PropTypes.element.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  duration: PropTypes.number,
};

function AdminHomePage() {
  const dispatch = useDispatch();
  const { studentsList } = useSelector((state) => state.student);
  const { sclassesList } = useSelector((state) => state.sclass);
  const { teachersList } = useSelector((state) => state.teacher);
  const { currentUser } = useSelector((state) => state.user);
  const adminID = currentUser._id;

  useEffect(() => {
    dispatch(getAllStudents(adminID));
    dispatch(getAllSclasses(adminID, 'Sclass'));
    dispatch(getAllTeachers(adminID));
  }, [adminID, dispatch]);

  const numberOfStudents = studentsList?.length || 0;
  const numberOfClasses = sclassesList?.length || 0;
  const numberOfTeachers = teachersList?.length || 0;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={<GroupsIcon sx={{ fontSize: 50 }} />}
            label="Ученики"
            value={numberOfStudents}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={<SchoolIcon sx={{ fontSize: 50 }} />}
            label="Классы"
            value={numberOfClasses}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={<MenuBookIcon sx={{ fontSize: 50 }} />}
            label="Учителя"
            value={numberOfTeachers}
          />
        </Grid>

        <Grid item xs={12}>
          <StyledPaper>
            <SeeNotice />
          </StyledPaper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default AdminHomePage;

// === Styled Components ===

const MotionPaper = styled(motion(Paper))`
  padding: 25px;
  height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  text-align: center;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
`;

const IconWrapper = styled.div`
  background: linear-gradient(135deg, #42a5f5, #478ed1);
  padding: 10px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const Label = styled.p`
  font-size: 1.2rem;
  font-weight: 600;
  color: #444;
  margin: 10px 0 0;
`;

const Count = styled.p`
  font-size: 2rem;
  font-weight: bold;
  color: #4caf50;
  margin: 5px 0 0;
`;

const StyledPaper = styled(Paper)`
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

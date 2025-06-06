import React, { useEffect } from 'react';
import {
  Container, Grid, Paper, Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import CountUp from 'react-countup';
import SchoolIcon from '@mui/icons-material/School';
import SeeNotice from '../../components/SeeNotice';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';

function StudentHomePage() {
  const dispatch = useDispatch();

  const {
    currentUser,
  } = useSelector((state) => state.user);
  const { subjectsList } = useSelector((state) => state.sclass);

  const classID = currentUser?.sclassName?._id || currentUser?.sclassName;

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(getUserDetails(currentUser._id, 'students'));
    }

    if (classID) {
      dispatch(getSubjectList(classID, 'subjects'));
    }
  }, [dispatch, currentUser?._id, classID]);

  if (!currentUser || !classID) {
    return <Typography variant="h6">Загрузка данных пользователя...</Typography>;
  }

  const numberOfSubjects = subjectsList?.length || 0;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3} lg={3}>
          <StyledPaper>
            <SchoolIcon fontSize="large" color="primary" />
            <Title>Всего предметов</Title>
            <Data start={0} end={numberOfSubjects} duration={2.5} />
          </StyledPaper>
        </Grid>

        {/* Пример блока с заданиями — раскомментировать при необходимости */}
        {/* <Grid item xs={12} md={3} lg={3}>
          <StyledPaper>
            <AssignmentTurnedInIcon fontSize="large" color="secondary" />
            <Title>Всего заданий</Title>
            <Data start={0} end={15} duration={4} />
          </StyledPaper>
        </Grid> */}

        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <SeeNotice />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default StudentHomePage;

//  Стили

const StyledPaper = styled(Paper)`
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 200px;
  justify-content: space-between;
  align-items: center;
  text-align: center;
`;

const Title = styled.p`
  font-size: 1.25rem;
`;

const Data = styled(CountUp)`
  font-size: calc(1.3rem + .6vw);
  color: green;
`;

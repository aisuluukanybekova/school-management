import {
  Container, Grid, Paper, Typography, Avatar, Box,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import SchoolIcon from '@mui/icons-material/School';
import axios from 'axios';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import SeeNotice from '../../components/SeeNotice';
import { getClassStudents, getSubjectDetails } from '../../redux/sclassRelated/sclassHandle';

function StatCard({ title, value, icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 3,
          backgroundColor: '#ffffff',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Avatar sx={{ bgcolor: '#1976d2', width: 56, height: 56 }}>
          {icon}
        </Avatar>
        <Box ml={2}>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4" color="green" sx={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
        </Box>
      </Paper>
    </motion.div>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node.isRequired,
  delay: PropTypes.number,
};

function TeacherHomePage() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { sclassStudents } = useSelector((state) => state.sclass); // ✅ Removed unused subjectDetails
  const [homeroomClass, setHomeroomClass] = useState(null);

  const classID = currentUser.teachSclass?._id;
  const subjectID = currentUser.teachSubject?._id;

  useEffect(() => {
    if (classID && subjectID) {
      dispatch(getSubjectDetails(subjectID, 'Subject'));
      dispatch(getClassStudents(classID));
    }
  }, [dispatch, subjectID, classID]);

  useEffect(() => {
    const fetchHomeroomClass = async () => {
      if (currentUser?.homeroomFor) {
        try {
          const res = await axios.get(`/api/classes/${currentUser.homeroomFor._id}`);
          setHomeroomClass(res.data);
        } catch (err) {
          console.error('Ошибка при получении класса классного руководителя:', err);
        }
      }
    };
    fetchHomeroomClass();
  }, [currentUser]);

  const numberOfStudents = sclassStudents?.length || 0;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Сообщение о классном руководителе */}
        {homeroomClass && (
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 3,
                backgroundColor: '#e3f2fd',
                borderLeft: '6px solid #1976d2',
                borderRadius: 3,
              }}
            >
              <Typography variant="h6">
                Вы классный руководитель класса: <strong>{homeroomClass.sclassName}</strong>
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* Карточки статистики */}
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Ученики класса"
            value={numberOfStudents}
            icon={<SchoolIcon />}
            delay={0.1}
          />
        </Grid>

        {/* Объявления */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Paper
              elevation={4}
              sx={{
                p: 3,
                borderRadius: 3,
                backgroundColor: '#fafafa',
              }}
            >
              <SeeNotice />
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
}

export default TeacherHomePage;

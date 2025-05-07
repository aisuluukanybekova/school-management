import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSubjectsWithTeachers } from '../../redux/sclassRelated/sclassHandle';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableHead,
  Paper,
  TableContainer,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Divider
} from '@mui/material';
import { StyledTableCell, StyledTableRow } from '../../components/styles';
import CustomBarChart from '../../components/CustomBarChart';

import InsertChartIcon from '@mui/icons-material/InsertChart';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import TableChartIcon from '@mui/icons-material/TableChart';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';

const StudentSubjects = () => {
  const dispatch = useDispatch();
  const { subjectsList, sclassDetails } = useSelector((state) => state.sclass);
  const { userDetails, currentUser, loading } = useSelector((state) => state.user);

  const [subjectMarks, setSubjectMarks] = useState([]);
  const [selectedSection, setSelectedSection] = useState('table');

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(getUserDetails(currentUser._id, 'students'));
    }
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (userDetails?.examResult) {
      setSubjectMarks(userDetails.examResult);
    }
  }, [userDetails]);

  useEffect(() => {
    if (currentUser?.sclassName?._id) {
      dispatch(getSubjectsWithTeachers(currentUser.sclassName._id));
    }
  }, [dispatch, currentUser]);
  

  const handleSectionChange = (event, newSection) => {
    setSelectedSection(newSection);
  };

  const renderTableSection = () => (
    <Box my={3}>
      <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
         Оценки по предметам
      </Typography>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <StyledTableRow>
              <StyledTableCell>Предмет</StyledTableCell>
              <StyledTableCell>Оценка</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {subjectMarks.map((result, index) => {
              if (!result.subName || result.marksObtained == null) return null;
              return (
                <StyledTableRow key={index}>
                  <StyledTableCell>{result.subName.subName}</StyledTableCell>
                  <StyledTableCell>{result.marksObtained}</StyledTableCell>
                </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderChartSection = () => (
    <Box my={3}>
      <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
         График успеваемости
      </Typography>
      <CustomBarChart chartData={subjectMarks} dataKey="marksObtained" />
    </Box>
  );

  const renderClassDetailsSection = () => (
    <Container>
      <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
         Информация о классе
      </Typography>
      <Typography variant="h5" gutterBottom>
        Класс: <strong>{sclassDetails?.sclassName || '—'}</strong>
      </Typography>
      <Typography variant="h6" gutterBottom>
         Предметы и преподаватели:
      </Typography>

      <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
      {subjectsList?.map((item, index) => (
  <Box key={index} mb={1}>
    <Typography variant="subtitle1">
      • <strong>{item.subjectName}</strong> — преподаватель:{' '}
      {item.teachers?.length > 0 ? item.teachers.map(t => t.name).join(', ') : 'не назначен'}
    </Typography>
    {index < subjectsList.length - 1 && <Divider sx={{ my: 1 }} />}
  </Box>
))}
      </Paper>
    </Container>
  );

  if (!currentUser || !currentUser?.sclassName?._id) {
    return <Typography variant="h6">Загрузка информации об ученике...</Typography>;
  }

  return (
    <>
      {loading ? (
        <Typography variant="h6">Загрузка...</Typography>
      ) : (
        <div>
          {Array.isArray(subjectMarks) && subjectMarks.length > 0 ? (
            <>
              {selectedSection === 'table' && renderTableSection()}
              {selectedSection === 'chart' && renderChartSection()}

              <Paper
                sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '1px solid #ddd' }}
                elevation={3}
              >
                <BottomNavigation
                  value={selectedSection}
                  onChange={handleSectionChange}
                  showLabels
                >
                  <BottomNavigationAction
                    label="Таблица"
                    value="table"
                    icon={
                      selectedSection === 'table' ? <TableChartIcon /> : <TableChartOutlinedIcon />
                    }
                  />
                  <BottomNavigationAction
                    label="График"
                    value="chart"
                    icon={
                      selectedSection === 'chart' ? <InsertChartIcon /> : <InsertChartOutlinedIcon />
                    }
                  />
                </BottomNavigation>
              </Paper>
            </>
          ) : (
            renderClassDetailsSection()
          )}
        </div>
      )}
    </>
  );
};

export default StudentSubjects;

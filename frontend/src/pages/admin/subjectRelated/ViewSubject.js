import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Tab,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import { getClassStudents, getSubjectDetails } from '../../../redux/sclassRelated/sclassHandle';
import { BlueButton, GreenButton, PurpleButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

const ViewSubject = () => {
  const navigate = useNavigate();
  const { classID, subjectID } = useParams();
  const dispatch = useDispatch();
  const { subloading, subjectDetails, sclassStudents } = useSelector((state) => state.sclass);

  const [tabValue, setTabValue] = useState('1');
  const [subTab, setSubTab] = useState('attendance');

  useEffect(() => {
    dispatch(getSubjectDetails(subjectID, 'Subject'));
    dispatch(getClassStudents(classID));
  }, [dispatch, subjectID, classID]);

  const studentColumns = [
    { id: 'rollNum', label: 'Номер', minWidth: 100 },
    { id: 'name', label: 'Имя', minWidth: 170 },
  ];

  const studentRows = sclassStudents.map(student => ({
    rollNum: student.rollNum,
    name: student.name,
    id: student._id
  }));

  const StudentsButtonActions = ({ row }) => (
    <>
      <BlueButton onClick={() => navigate(`/Admin/students/student/${row.id}`)}>Просмотр</BlueButton>
      {subTab === 'attendance' ? (
        <PurpleButton onClick={() => navigate(`/Admin/subject/student/attendance/${row.id}/${subjectID}`)}>
          Отметить посещение
        </PurpleButton>
      ) : (
        <PurpleButton onClick={() => navigate(`/Admin/subject/student/marks/${row.id}/${subjectID}`)}>
          Поставить оценку
        </PurpleButton>
      )}
    </>
  );

  const SubjectDetailsSection = () => {
    const numberOfStudents = sclassStudents.length;

    const rows = [
      { label: 'Предмет', value: subjectDetails?.subName },
      { label: 'Занятий', value: subjectDetails?.sessions },
      { label: 'Студентов', value: numberOfStudents },
      { label: 'Класс', value: subjectDetails?.sclassName?.sclassName },
      {
        label: 'Преподаватель',
        value: subjectDetails?.teacher
          ? subjectDetails.teacher.name
          : <GreenButton onClick={() => navigate(`/Admin/teachers/addteacher/${subjectDetails._id}`)}>
              Назначить преподавателя
            </GreenButton>
      }
    ];

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Параметр</strong></TableCell>
              <TableCell><strong>Значение</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i}>
                <TableCell>{row.label}</TableCell>
                <TableCell>{row.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const SubjectStudentsSection = () => (
    <>
      <Typography variant="h5" gutterBottom>Список студентов:</Typography>
      <Box sx={{ mb: 2 }}>
        <BlueButton onClick={() => setSubTab('attendance')} variant={subTab === 'attendance' ? 'contained' : 'outlined'}>Посещаемость</BlueButton>
        <BlueButton onClick={() => setSubTab('marks')} variant={subTab === 'marks' ? 'contained' : 'outlined'} sx={{ ml: 2 }}>Оценки</BlueButton>
      </Box>
      <TableTemplate buttonHaver={StudentsButtonActions} columns={studentColumns} rows={studentRows} />
    </>
  );

  return subloading ? (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
  ) : (
    <Box sx={{ width: '100%' }}>
      <TabContext value={tabValue}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={(e, v) => setTabValue(v)}>
            <Tab label="Детали" value="1" />
            <Tab label="Студенты" value="2" />
          </TabList>
        </Box>
        <Container sx={{ mt: 4, mb: 5 }}>
          <TabPanel value="1"><SubjectDetailsSection /></TabPanel>
          <TabPanel value="2"><SubjectStudentsSection /></TabPanel>
        </Container>
      </TabContext>
    </Box>
  );
};

export default ViewSubject;

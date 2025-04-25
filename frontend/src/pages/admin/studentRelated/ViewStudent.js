// 👇 весь код без изменений логики, только перевод текста
// импорт как был
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteUser, getUserDetails, updateUser } from '../../../redux/userRelated/userHandle';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import {
  Box, Button, Collapse, IconButton, Table, TableBody, TableHead, Typography, Tab, Paper,
  BottomNavigation, BottomNavigationAction, Container
} from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { KeyboardArrowUp, KeyboardArrowDown, Delete as DeleteIcon } from '@mui/icons-material';
import { removeStuff, updateStudentFields } from '../../../redux/studentRelated/studentHandle';
import { calculateOverallAttendancePercentage, calculateSubjectAttendancePercentage, groupAttendanceBySubject } from '../../../components/attendanceCalculator';
import CustomBarChart from '../../../components/CustomBarChart';
import CustomPieChart from '../../../components/CustomPieChart';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';

import InsertChartIcon from '@mui/icons-material/InsertChart';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import TableChartIcon from '@mui/icons-material/TableChart';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import Popup from '../../../components/Popup';

const ViewStudent = () => {
  const [showTab, setShowTab] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();
  const { userDetails, response, loading, error } = useSelector((state) => state.user);
  const studentID = params.id;
  const address = 'Student';

  useEffect(() => {
    dispatch(getUserDetails(studentID, address));
  }, [dispatch, studentID]);

  useEffect(() => {
    if (userDetails?.sclassName?._id) {
      dispatch(getSubjectList(userDetails.sclassName._id, 'ClassSubjects'));
    }
  }, [dispatch, userDetails]);

  const [name, setName] = useState('');
  const [rollNum, setRollNum] = useState('');
  const [password, setPassword] = useState('');
  const [sclassName, setSclassName] = useState('');
  const [studentSchool, setStudentSchool] = useState('');
  const [subjectMarks, setSubjectMarks] = useState('');
  const [subjectAttendance, setSubjectAttendance] = useState([]);
  const [openStates, setOpenStates] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');
  const [value, setValue] = useState('1');
  const [selectedSection, setSelectedSection] = useState('table');

  useEffect(() => {
    if (userDetails) {
      setName(userDetails.name || '');
      setRollNum(userDetails.rollNum || '');
      setSclassName(userDetails.sclassName || '');
      setStudentSchool(userDetails.school || '');
      setSubjectMarks(userDetails.examResult || '');
      setSubjectAttendance(userDetails.attendance || []);
    }
  }, [userDetails]);

  const fields = password === ''
    ? { name, rollNum }
    : { name, rollNum, password };

  const handleChange = (event, newValue) => setValue(newValue);
  const handleSectionChange = (event, newSection) => setSelectedSection(newSection);
  const handleOpen = (subId) => setOpenStates(prev => ({ ...prev, [subId]: !prev[subId] }));

  const submitHandler = (event) => {
    event.preventDefault();
    dispatch(updateUser(fields, studentID, address))
      .then(() => dispatch(getUserDetails(studentID, address)))
      .catch(console.error);
  };

  const deleteHandler = () => {
    setMessage('Удаление временно отключено');
    setShowPopup(true);
  };

  const removeHandler = (id, deladdress) => {
    dispatch(removeStuff(id, deladdress))
      .then(() => dispatch(getUserDetails(studentID, address)));
  };

  const removeSubAttendance = (subId) => {
    dispatch(updateStudentFields(studentID, { subId }, 'RemoveStudentSubAtten'))
      .then(() => dispatch(getUserDetails(studentID, address)));
  };

  const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);
  const chartData = [
    { name: 'Присутствовал', value: overallAttendancePercentage },
    { name: 'Отсутствовал', value: 100 - overallAttendancePercentage }
  ];

  const subjectData = Object.entries(groupAttendanceBySubject(subjectAttendance)).map(([subName, { present, sessions }]) => ({
    subject: subName,
    attendancePercentage: calculateSubjectAttendancePercentage(present, sessions),
    totalClasses: sessions,
    attendedClasses: present
  }));

  const StudentDetailsSection = () => (
    <div>
      Имя: {userDetails.name}
      <br />
      Номер телефона: {userDetails.rollNum}
      <br />
      Класс: {sclassName.sclassName}
      <br />
      Школа: {studentSchool.schoolName}
      <br />
      {subjectAttendance.length > 0 && <CustomPieChart data={chartData} />}
      <Button variant="contained" sx={styles.styledButton} onClick={deleteHandler}>
        Удалить ученика
      </Button>
    </div>
  );

  const StudentAttendanceSection = () => {
    const renderTableSection = () => (
      <>
        <h3>Посещаемость:</h3>
        <Table>
          <TableHead>
            <StyledTableRow>
              <StyledTableCell>Предмет</StyledTableCell>
              <StyledTableCell>Присутствий</StyledTableCell>
              <StyledTableCell>Всего занятий</StyledTableCell>
              <StyledTableCell>% посещаемости</StyledTableCell>
              <StyledTableCell align="center">Действия</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          {Object.entries(groupAttendanceBySubject(subjectAttendance)).map(([subName, { present, allData, subId, sessions }], index) => (
            <TableBody key={index}>
              <StyledTableRow>
                <StyledTableCell>{subName}</StyledTableCell>
                <StyledTableCell>{present}</StyledTableCell>
                <StyledTableCell>{sessions}</StyledTableCell>
                <StyledTableCell>{calculateSubjectAttendancePercentage(present, sessions)}%</StyledTableCell>
                <StyledTableCell align="center">
                  <Button variant="contained" onClick={() => handleOpen(subId)}>
                    {openStates[subId] ? <KeyboardArrowUp /> : <KeyboardArrowDown />} Детали
                  </Button>
                  <IconButton onClick={() => removeSubAttendance(subId)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                  <Button variant="contained" sx={styles.attendanceButton}
                    onClick={() => navigate(`/Admin/subject/student/attendance/${studentID}/${subId}`)}>
                    Изменить
                  </Button>
                </StyledTableCell>
              </StyledTableRow>
              <StyledTableRow>
                <StyledTableCell colSpan={6}>
                  <Collapse in={openStates[subId]} timeout="auto" unmountOnExit>
                    <Box sx={{ margin: 1 }}>
                      <Typography variant="h6">Подробности посещаемости</Typography>
                      <Table size="small">
                        <TableHead>
                          <StyledTableRow>
                            <StyledTableCell>Дата</StyledTableCell>
                            <StyledTableCell align="right">Статус</StyledTableCell>
                          </StyledTableRow>
                        </TableHead>
                        <TableBody>
                          {allData.map((data, i) => {
                            const date = new Date(data.date);
                            return (
                              <StyledTableRow key={i}>
                                <StyledTableCell>{date.toISOString().split('T')[0]}</StyledTableCell>
                                <StyledTableCell align="right">{data.status}</StyledTableCell>
                              </StyledTableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </Box>
                  </Collapse>
                </StyledTableCell>
              </StyledTableRow>
            </TableBody>
          ))}
        </Table>
        <div>Общий процент посещаемости: {overallAttendancePercentage.toFixed(2)}%</div>
        <Button variant="contained" color="error" onClick={() => removeHandler(studentID, 'RemoveStudentAtten')}>
          Удалить всё
        </Button>
        <Button variant="contained" sx={styles.styledButton} onClick={() => navigate(`/Admin/students/student/attendance/${studentID}`)}>
          Добавить посещаемость
        </Button>
      </>
    );

    const renderChartSection = () => (
      <CustomBarChart chartData={subjectData} dataKey="attendancePercentage" />
    );

    return subjectAttendance.length > 0 ? (
      <>
        {selectedSection === 'table' ? renderTableSection() : renderChartSection()}
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
          <BottomNavigation value={selectedSection} onChange={handleSectionChange} showLabels>
            <BottomNavigationAction label="Таблица" value="table" icon={selectedSection === 'table' ? <TableChartIcon /> : <TableChartOutlinedIcon />} />
            <BottomNavigationAction label="График" value="chart" icon={selectedSection === 'chart' ? <InsertChartIcon /> : <InsertChartOutlinedIcon />} />
          </BottomNavigation>
        </Paper>
      </>
    ) : (
      <Button variant="contained" sx={styles.styledButton} onClick={() => navigate(`/Admin/students/student/attendance/${studentID}`)}>
        Добавить посещаемость
      </Button>
    );
  };

  const StudentMarksSection = () => {
    const renderTableSection = () => (
      <>
        <h3>Оценки по предметам:</h3>
        <Table>
          <TableHead>
            <StyledTableRow>
              <StyledTableCell>Предмет</StyledTableCell>
              <StyledTableCell>Баллы</StyledTableCell>
              <StyledTableCell>Дата</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {subjectMarks.map((result, index) => (
              result.subName && result.marksObtained ? (
                <StyledTableRow key={index}>
                  <StyledTableCell>{result.subName?.subName}</StyledTableCell>
                  <StyledTableCell>{result.marksObtained}</StyledTableCell>
                  <StyledTableCell>
                    {result.date ? new Date(result.date).toLocaleDateString('ru-RU') : '—'}
                  </StyledTableCell>
                </StyledTableRow>
              ) : null
            ))}
          </TableBody>
        </Table>
        <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={() => removeHandler(studentID, "RemoveStudentAtten")}>Delete All</Button>
        <Button variant="contained" sx={styles.styledButton} onClick={() => navigate("/Admin/students/student/marks/" + studentID)}>
                        Add Marks
                    </Button>
      </>
    );
  
    const renderChartSection = () => (
      <CustomBarChart chartData={subjectMarks} dataKey="marksObtained" />
    );
  
    return subjectMarks.length > 0 ? (
      <>
        {selectedSection === 'table' ? renderTableSection() : renderChartSection()}
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
          <BottomNavigation value={selectedSection} onChange={handleSectionChange} showLabels>
            <BottomNavigationAction label="Таблица" value="table" icon={selectedSection === 'table' ? <TableChartIcon /> : <TableChartOutlinedIcon />} />
            <BottomNavigationAction label="График" value="chart" icon={selectedSection === 'chart' ? <InsertChartIcon /> : <InsertChartOutlinedIcon />} />
          </BottomNavigation>
        </Paper>
      </>
    ) : (
      <Button variant="contained" sx={styles.styledButton} onClick={() => navigate("/Admin/students/student/marks/" + studentID)}>
      Add Marks
  </Button>
    );
  };  

  return (
    <>
      {loading ? (
        <div>Загрузка...</div>
      ) : (
        <Box sx={{ width: '100%', typography: 'body1' }}>
          <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={handleChange} sx={{ position: 'fixed', width: '100%', bgcolor: 'background.paper', zIndex: 1 }}>
                <Tab label="Информация" value="1" />
                <Tab label="Посещаемость" value="2" />
                <Tab label="Оценки" value="3" />
              </TabList>
            </Box>
            <Container sx={{ marginTop: '3rem', marginBottom: '4rem' }}>
              <TabPanel value="1"><StudentDetailsSection /></TabPanel>
              <TabPanel value="2"><StudentAttendanceSection /></TabPanel>
              <TabPanel value="3"><StudentMarksSection /></TabPanel>
            </Container>
          </TabContext>
        </Box>
      )}
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </>
  );
};

export default ViewStudent;

const styles = {
  attendanceButton: {
    marginLeft: '20px',
    backgroundColor: '#270843',
    '&:hover': {
      backgroundColor: '#3f1068',
    }
  },
  styledButton: {
    margin: '20px',
    backgroundColor: '#02250b',
    '&:hover': {
      backgroundColor: '#106312',
    }
  }
};

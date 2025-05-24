import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  Box, Container, Typography, Tab, IconButton,
} from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import TableTemplate from '../../../components/TableTemplate';
import Popup from '../../../components/Popup';
import { getClassDetails, getClassStudents, getSubjectsWithTeachers } from '../../../redux/sclassRelated/sclassHandle';
import PropTypes from 'prop-types';

axios.defaults.baseURL = 'http://localhost:5001';

function ClassDetails() {
  const params = useParams();
  const dispatch = useDispatch();
  const {
    subjectsList, sclassStudents, sclassDetails, loading,
  } = useSelector((state) => state.sclass);
  const classID = params.id;

  const [value, setValue] = useState('1');
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    dispatch(getClassDetails(classID));
    dispatch(getSubjectsWithTeachers(classID));
    dispatch(getClassStudents(classID));
  }, [dispatch, classID]);

  const handleChange = (e, newValue) => setValue(newValue);

  const deleteHandler = async (deleteID, address) => {
    const confirmed = window.confirm('Вы уверены, что хотите удалить?');
    if (!confirmed) return;

    try {
      let endpoint = '';
      switch (address) {
        case 'Student':
          endpoint = `/api/students/${deleteID}`;
          break;
        case 'Teacher':
          endpoint = `/api/teachers/${deleteID}`;
          break;
        default:
          setMessage('Неизвестный адрес удаления.');
          setShowPopup(true);
          return;
      }

      await axios.delete(endpoint);
      setShowPopup(true);
      setMessage('Удаление прошло успешно!');
      dispatch(getClassDetails(classID));
      dispatch(getSubjectsWithTeachers(classID));
      dispatch(getClassStudents(classID));
    } catch (error) {
      console.error(error);
      setShowPopup(true);
      setMessage('Ошибка при удалении.');
    }
  };

  const studentColumns = [
    { id: 'name', label: 'Имя', minWidth: 170 },
    { id: 'rollNum', label: 'Номер ученика', minWidth: 100 },
  ];

  const studentRows = sclassStudents?.map((student) => ({
    name: student.name,
    rollNum: student.rollNum,
    id: student._id,
  })) || [];

  function StudentsButtonHaver({ row }) {
    return (
      <IconButton onClick={() => deleteHandler(row.id, 'Student')}>
        <PersonRemoveIcon color="error" />
      </IconButton>
    );
  }

  StudentsButtonHaver.propTypes = {
    row: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  };

  const teacherColumns = [
    { id: 'name', label: 'Имя преподавателя', minWidth: 170 },
    { id: 'email', label: 'Email', minWidth: 100 },
    { id: 'subject', label: 'Предмет', minWidth: 100 },
  ];

  const teacherRows = subjectsList?.flatMap((subject) =>
    subject.teachers?.map((teacher) => ({
      name: teacher.name,
      email: teacher.email || '—',
      subject: subject.subjectName,
      id: `${teacher._id}-${subject.subjectName}`,
    }))
  ) || [];

  function TeacherButtonHaver({ row }) {
    return (
      <IconButton onClick={() => deleteHandler(row.id, 'Teacher')}>
        <DeleteIcon color="error" />
      </IconButton>
    );
  }

  TeacherButtonHaver.propTypes = {
    row: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  };

  return (
    <>
      {loading ? (
        <div>Загрузка...</div>
      ) : (
        <Box sx={{ width: '100%', typography: 'body1' }}>
          <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList
                onChange={handleChange}
                sx={{
                  position: 'fixed',
                  width: '100%',
                  bgcolor: 'background.paper',
                  zIndex: 1,
                }}
              >
                <Tab label="Информация" value="1" />
                <Tab label="Ученики" value="2" />
                <Tab label="Учителя" value="3" />
              </TabList>
            </Box>
            <Container sx={{ marginTop: '3rem', marginBottom: '4rem' }}>
              <TabPanel value="1">
                <Typography variant="h5">Класс: {sclassDetails?.sclassName}</Typography>
                <Typography variant="h6">Количество предметов: {subjectsList?.length}</Typography>
                <Typography variant="h6">Количество учеников: {sclassStudents?.length}</Typography>
              </TabPanel>
              <TabPanel value="2">
                <TableTemplate
                  buttonHaver={StudentsButtonHaver}
                  columns={studentColumns}
                  rows={studentRows}
                />
              </TabPanel>
              <TabPanel value="3">
                <TableTemplate
                  buttonHaver={TeacherButtonHaver}
                  columns={teacherColumns}
                  rows={teacherRows}
                />
              </TabPanel>
            </Container>
          </TabContext>
        </Box>
      )}

      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </>
  );
}

export default ClassDetails;

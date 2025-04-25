import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getClassDetails, getClassStudents, getSubjectList } from "../../../redux/sclassRelated/sclassHandle";
import {
  Box, Container, Typography, Tab, IconButton
} from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { resetSubjects } from "../../../redux/sclassRelated/sclassSlice";
import { BlueButton, GreenButton, PurpleButton } from "../../../components/buttonStyles";
import TableTemplate from "../../../components/TableTemplate";
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SpeedDialTemplate from "../../../components/SpeedDialTemplate";
import Popup from "../../../components/Popup";
import DeleteIcon from "@mui/icons-material/Delete";
import PostAddIcon from '@mui/icons-material/PostAdd';

const ClassDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { subjectsList, sclassStudents, sclassDetails, loading, error, response, getresponse } = useSelector((state) => state.sclass);
  const classID = params.id;

  useEffect(() => {
    dispatch(getClassDetails(classID, "Sclass"));
    dispatch(getSubjectList(classID, "ClassSubjects"));
    dispatch(getClassStudents(classID));
  }, [dispatch, classID]);

  if (error) {
    console.log(error);
  }

  const [value, setValue] = useState('1');
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const deleteHandler = (deleteID, address) => {
    setMessage("Извините, функция удаления временно отключена.");
    setShowPopup(true);
  };

  const subjectColumns = [
    { id: 'name', label: 'Название предмета', minWidth: 170 },
    { id: 'code', label: 'Код предмета', minWidth: 100 },
  ];

  const subjectRows = subjectsList && subjectsList.length > 0 && subjectsList.map((subject) => {
    return {
      name: subject.subName,
      code: subject.subCode,
      id: subject._id,
    };
  });

  const SubjectsButtonHaver = ({ row }) => (
    <>
      <IconButton onClick={() => deleteHandler(row.id, "Subject")}>
        <DeleteIcon color="error" />
      </IconButton>
      <BlueButton variant="contained" onClick={() => navigate(`/Admin/class/subject/${classID}/${row.id}`)}>
        Просмотр
      </BlueButton>
    </>
  );

  const subjectActions = [
    {
      icon: <PostAddIcon color="primary" />, name: 'Добавить предмет',
      action: () => navigate("/Admin/addsubject/" + classID)
    },
    {
      icon: <DeleteIcon color="error" />, name: 'Удалить все предметы',
      action: () => deleteHandler(classID, "SubjectsClass")
    }
  ];

  const ClassSubjectsSection = () => (
    <>
      {response ? (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <GreenButton variant="contained" onClick={() => navigate("/Admin/addsubject/" + classID)}>
            Добавить предметы
          </GreenButton>
        </Box>
      ) : (
        <>
          <Typography variant="h5" gutterBottom>
            Список предметов:
          </Typography>
          <TableTemplate buttonHaver={SubjectsButtonHaver} columns={subjectColumns} rows={subjectRows} />
          <SpeedDialTemplate actions={subjectActions} />
        </>
      )}
    </>
  );

  const studentColumns = [
    { id: 'name', label: 'Имя', minWidth: 170 },
    { id: 'rollNum', label: 'Номер ученика', minWidth: 100 },
  ];

  const studentRows = sclassStudents.map((student) => ({
    name: student.name,
    rollNum: student.rollNum,
    id: student._id,
  }));

  const StudentsButtonHaver = ({ row }) => (
    <>
      <IconButton onClick={() => deleteHandler(row.id, "Student")}>...
        <PersonRemoveIcon color="error" />
      </IconButton>
      <BlueButton variant="contained" onClick={() => navigate("/Admin/students/student/" + row.id)}>
        Просмотр
      </BlueButton>
      <PurpleButton variant="contained" onClick={() => navigate("/Admin/students/student/attendance/" + row.id)}>
        Посещаемость
      </PurpleButton>
    </>
  );

  const studentActions = [
    {
      icon: <PersonAddAlt1Icon color="primary" />, name: 'Добавить ученика',
      action: () => navigate("/Admin/class/addstudents/" + classID)
    },
    {
      icon: <PersonRemoveIcon color="error" />, name: 'Удалить всех учеников',
      action: () => deleteHandler(classID, "StudentsClass")
    },
  ];

  const ClassStudentsSection = () => (
    <>
      {getresponse ? (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <GreenButton variant="contained" onClick={() => navigate("/Admin/class/addstudents/" + classID)}>
            Добавить учеников
          </GreenButton>
        </Box>
      ) : (
        <>
          <Typography variant="h5" gutterBottom>
            Список учеников:
          </Typography>
          <TableTemplate buttonHaver={StudentsButtonHaver} columns={studentColumns} rows={studentRows} />
          <SpeedDialTemplate actions={studentActions} />
        </>
      )}
    </>
  );

  const ClassTeachersSection = () => {
    const teachersList = sclassDetails.teachers || [];

    const teacherColumns = [
      { id: 'name', label: 'Имя преподавателя', minWidth: 170 },
      { id: 'email', label: 'Email', minWidth: 100 },
      { id: 'subject', label: 'Предмет', minWidth: 100 },
    ];

    const teacherRows = teachersList.map((teacher) => ({
      name: teacher.name,
      email: teacher.email,
      subject: teacher.subject?.subName || '—',
      id: teacher._id,
    }));

    const TeacherButtonHaver = ({ row }) => (
      <>
        <IconButton onClick={() => deleteHandler(row.id, "Teacher")}>...
          <DeleteIcon color="error" />
        </IconButton>
        <BlueButton variant="contained" onClick={() => navigate("/Admin/teachers/teacher/" + row.id)}>
          Просмотр
        </BlueButton>
      </>
    );

    const teacherActions = [
      {
        icon: <PersonAddAlt1Icon color="primary" />,
        name: 'Добавить преподавателя',
        action: () => navigate("/Admin/teachers/add/" + classID),
      },
    ];

    return (
      <>
        <Typography variant="h5" gutterBottom>
          Преподаватели:
        </Typography>
        {teacherRows.length > 0 ? (
          <>
            <TableTemplate buttonHaver={TeacherButtonHaver} columns={teacherColumns} rows={teacherRows} />
            <SpeedDialTemplate actions={teacherActions} />
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <GreenButton variant="contained" onClick={() => navigate("/Admin/teachers/add/" + classID)}>
              Добавить преподавателя
            </GreenButton>
          </Box>
        )}
      </>
    );
  };

  const ClassDetailsSection = () => {
    const numberOfSubjects = subjectsList.length;
    const numberOfStudents = sclassStudents.length;

    return (
      <>
        <Typography variant="h4" align="center" gutterBottom>
          Информация о классе
        </Typography>
        <Typography variant="h5" gutterBottom>
          Класс: {sclassDetails && sclassDetails.sclassName}
        </Typography>
        <Typography variant="h6" gutterBottom>
          Количество предметов: {numberOfSubjects}
        </Typography>
        <Typography variant="h6" gutterBottom>
          Количество учеников: {numberOfStudents}
        </Typography>
        {getresponse && (
          <GreenButton variant="contained" onClick={() => navigate("/Admin/class/addstudents/" + classID)}>
            Добавить учеников
          </GreenButton>
        )}
        {response && (
          <GreenButton variant="contained" onClick={() => navigate("/Admin/addsubject/" + classID)}>
            Добавить предметы
          </GreenButton>
        )}
      </>
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
                <Tab label="Предметы" value="2" />
                <Tab label="Ученики" value="3" />
                <Tab label="Учителя" value="4" />
              </TabList>
            </Box>
            <Container sx={{ marginTop: "3rem", marginBottom: "4rem" }}>
              <TabPanel value="1"><ClassDetailsSection /></TabPanel>
              <TabPanel value="2"><ClassSubjectsSection /></TabPanel>
              <TabPanel value="3"><ClassStudentsSection /></TabPanel>
              <TabPanel value="4"><ClassTeachersSection /></TabPanel>
            </Container>
          </TabContext>
        </Box>
      )}
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </>
  );
};

export default ClassDetails;

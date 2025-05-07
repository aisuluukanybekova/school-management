import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getClassDetails, getClassStudents, getSubjectsWithTeachers } from "../../../redux/sclassRelated/sclassHandle";
import { Box, Container, Typography, Tab, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { BlueButton, GreenButton } from "../../../components/buttonStyles";
import TableTemplate from "../../../components/TableTemplate";
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from '@mui/icons-material/Edit';
import Popup from "../../../components/Popup";
import axios from "axios";

axios.defaults.baseURL = 'http://localhost:5001';

const ClassDetails = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const { subjectsList, sclassStudents, sclassDetails, loading } = useSelector((state) => state.sclass);
  const classID = params.id;

  const [value, setValue] = useState('1');
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [editField, setEditField] = useState('');
  const [editType, setEditType] = useState('');

  useEffect(() => {
    dispatch(getClassDetails(classID));
    dispatch(getSubjectsWithTeachers(classID));
    dispatch(getClassStudents(classID));
  }, [dispatch, classID]);

  const handleChange = (e, newValue) => setValue(newValue);

  const openEditDialog = (item, field, type) => {
    setEditItem(item);
    setEditField(field);
    setEditType(type);
  };

  const saveEdit = async () => {
    if (!editItem || !editField.trim()) return;
    try {
      let url = "";
      let payload = {};

      if (editType === "subject") {
        url = `/api/subjects/${editItem.id}`;
        payload = { subName: editField };
      } else if (editType === "student") {
        url = `/api/students/${editItem.id}`;
        payload = { name: editField };
      } else if (editType === "teacher") {
        url = `/api/teachers/${editItem.id}`;
        payload = { name: editField };
      }

      await axios.put(url, payload);
      setShowPopup(true);
      setMessage("Изменения успешно сохранены!");
      dispatch(getClassDetails(classID));
      dispatch(getSubjectsWithTeachers(classID));
      dispatch(getClassStudents(classID));
    } catch (error) {
      console.error(error);
      setShowPopup(true);
      setMessage("Ошибка при сохранении изменений.");
    } finally {
      setEditItem(null);
    }
  };

  const deleteHandler = async (deleteID, address) => {
    const confirmed = window.confirm("Вы уверены, что хотите удалить?");
    if (!confirmed) return;

    try {
      let endpoint = "";

      switch (address) {
        case "Subject":
          endpoint = `/api/subjects/${deleteID}`;
          break;
        case "Student":
          endpoint = `/api/students/${deleteID}`;
          break;
        case "Teacher":
          endpoint = `/api/teachers/${deleteID}`;
          break;
        default:
          setMessage("Неизвестный адрес удаления.");
          setShowPopup(true);
          return;
      }

      await axios.delete(endpoint);
      setShowPopup(true);
      setMessage("Удаление прошло успешно!");
      dispatch(getClassDetails(classID));
      dispatch(getSubjectsWithTeachers(classID));
      dispatch(getClassStudents(classID));
    } catch (error) {
      console.error(error);
      setShowPopup(true);
      setMessage("Ошибка при удалении.");
    }
  };

  const subjectColumns = [{ id: 'name', label: 'Название предмета', minWidth: 170 }];
  const subjectRows = subjectsList?.map(subject => ({
    name: subject.subjectName,
    id: subject.subjectId
  })) || [];

  const SubjectsButtonHaver = ({ row }) => (
    <>
      <IconButton onClick={() => openEditDialog(row, row.name, "subject")}><EditIcon color="primary" /></IconButton>
      <IconButton onClick={() => deleteHandler(row.id, "Subject")}><DeleteIcon color="error" /></IconButton>
    </>
  );

  const studentColumns = [
    { id: 'name', label: 'Имя', minWidth: 170 },
    { id: 'rollNum', label: 'Номер ученика', minWidth: 100 },
  ];
  
  const studentRows = sclassStudents?.map(student => ({
    name: student.name,
    rollNum: student.rollNum,
    id: student._id
  })) || [];
  

  const StudentsButtonHaver = ({ row }) => (
    <>
      <IconButton onClick={() => openEditDialog(row, row.name, "student")}><EditIcon color="primary" /></IconButton>
      <IconButton onClick={() => deleteHandler(row.id, "Student")}><PersonRemoveIcon color="error" /></IconButton>
    </>
  );

  const teacherColumns = [
    { id: 'name', label: 'Имя преподавателя', minWidth: 170 },
    { id: 'email', label: 'Email', minWidth: 100 },
    { id: 'subject', label: 'Предмет', minWidth: 100 }
  ];

  const teacherRows = subjectsList?.flatMap(subject =>
    subject.teachers?.map(teacher => ({
      name: teacher.name,
      email: teacher.email || "—",
      subject: subject.subjectName,
      id: `${teacher._id}-${subject.subjectName}` 
    }))
  ) || [];
   

  const TeacherButtonHaver = ({ row }) => (
    <>
      <IconButton onClick={() => openEditDialog(row, row.name, "teacher")}><EditIcon color="primary" /></IconButton>
      <IconButton onClick={() => deleteHandler(row.id, "Teacher")}><DeleteIcon color="error" /></IconButton>
    </>
  );

  return (
    <>
      {loading ? (<div>Загрузка...</div>) : (
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
              <TabPanel value="1">
                <Typography variant="h5">Класс: {sclassDetails?.sclassName}</Typography>
                <Typography variant="h6">Количество предметов: {subjectsList?.length}</Typography>
                <Typography variant="h6">Количество учеников: {sclassStudents?.length}</Typography>
              </TabPanel>
              <TabPanel value="2">
                <TableTemplate buttonHaver={SubjectsButtonHaver} columns={subjectColumns} rows={subjectRows} />
              </TabPanel>
              <TabPanel value="3">
                <TableTemplate buttonHaver={StudentsButtonHaver} columns={studentColumns} rows={studentRows} />
              </TabPanel>
              <TabPanel value="4">
                <TableTemplate buttonHaver={TeacherButtonHaver} columns={teacherColumns} rows={teacherRows} />
              </TabPanel>
            </Container>
          </TabContext>
        </Box>
      )}

      <Dialog open={!!editItem} onClose={() => setEditItem(null)}>
        <DialogTitle>Редактировать</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Новое значение" type="text" fullWidth variant="outlined" value={editField} onChange={(e) => setEditField(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <BlueButton onClick={saveEdit}>Сохранить</BlueButton>
          <GreenButton onClick={() => setEditItem(null)}>Отмена</GreenButton>
        </DialogActions>
      </Dialog>

      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </>
  );
};

export default ClassDetails;
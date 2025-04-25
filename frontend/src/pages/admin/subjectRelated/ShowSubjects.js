import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import axios from 'axios';
import PostAddIcon from '@mui/icons-material/PostAdd';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from '@mui/icons-material/Edit';
import {
  Paper, Box, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Button
} from '@mui/material';
import TableTemplate from '../../../components/TableTemplate';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';

const REACT_APP_BASE_URL = "http://localhost:5001";

const ShowSubjects = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { subjectsList, loading, error, response } = useSelector((state) => state.sclass);
  const { currentUser } = useSelector(state => state.user);

  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSubject, setEditSubject] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchClass, setSearchClass] = useState("");

  useEffect(() => {
    dispatch(getSubjectList(currentUser._id, "AllSubjects"));
  }, [currentUser._id, dispatch]);

  const deleteHandler = (deleteID, address) => {
    dispatch(deleteUser(deleteID, address))
      .then(() => dispatch(getSubjectList(currentUser._id, "AllSubjects")));
  };

  const handleEditClick = (row) => {
    setEditSubject({
      subName: row.subName,
      sessions: row.sessions,
      _id: row.id
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const res = await axios.put(`${REACT_APP_BASE_URL}/Subject/${editSubject._id}`, editSubject);
      console.log("Обновлено:", res.data);
      setEditModalOpen(false);
      dispatch(getSubjectList(currentUser._id, "AllSubjects"));
    } catch (error) {
      console.error("Ошибка при обновлении:", error.response?.data || error.message);
    }
  };

  const subjectColumns = [
    { id: 'subName', label: 'Название предмета', minWidth: 170 },
    { id: 'sessions', label: 'Занятий проведено', minWidth: 170 },
    { id: 'sclassName', label: 'Класс', minWidth: 170 },
  ];

  const subjectRows = subjectsList.map((subject) => ({
    subName: subject.subName,
    sessions: subject.sessions,
    sclassName: subject.sclassName?.sclassName || '',
    sclassID: subject.sclassName?._id,
    id: subject._id,
  }));

  const filteredRows = subjectRows.filter(row =>
    row.subName.toLowerCase().includes(searchQuery.toLowerCase()) &&
    row.sclassName.toLowerCase().includes(searchClass.toLowerCase())
  );

  const SubjectsButtonHaver = ({ row }) => (
    <>
      <IconButton onClick={() => deleteHandler(row.id, "Subject")}>
        <DeleteIcon color="error" />
      </IconButton>
      <IconButton onClick={() => handleEditClick(row)}>
        <EditIcon />
      </IconButton>
      <BlueButton variant="contained" onClick={() => navigate(`/Admin/subjects/subject/${row.sclassID}/${row.id}`)}>
        Подробнее
      </BlueButton>
    </>
  );

  const actions = [
    {
      icon: <PostAddIcon color="primary" />,
      name: 'Добавить предмет',
      action: () => navigate("/Admin/subjects/chooseclass")
    },
    {
      icon: <DeleteIcon color="error" />,
      name: 'Удалить все предметы',
      action: () => deleteHandler(currentUser._id, "Subjects")
    }
  ];

  return (
    <>
      {loading ? (
        <div>Загрузка...</div>
      ) : (
        <>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <TextField
              label="Поиск по предмету"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <TextField
              label="Поиск по классу"
              variant="outlined"
              value={searchClass}
              onChange={(e) => setSearchClass(e.target.value)}
            />
            <GreenButton variant="contained" onClick={() => navigate("/Admin/subjects/chooseclass")}>Добавить предметы</GreenButton>
          </Box>

          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            {Array.isArray(subjectsList) && filteredRows.length > 0 ? (
              <TableTemplate
                buttonHaver={SubjectsButtonHaver}
                columns={subjectColumns}
                rows={filteredRows}
              />
            ) : (
              <div style={{ padding: "2rem" }}>Ничего не найдено</div>
            )}
            <SpeedDialTemplate actions={actions} />
          </Paper>
        </>
      )}

      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <DialogTitle>Редактировать предмет</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Название предмета"
            value={editSubject.subName || ""}
            onChange={(e) => setEditSubject({ ...editSubject, subName: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Количество занятий"
            type="number"
            value={editSubject.sessions || ""}
            onChange={(e) => setEditSubject({ ...editSubject, sessions: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Сохранить</Button>
        </DialogActions>
      </Dialog>

      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </>
  );
};

export default ShowSubjects;

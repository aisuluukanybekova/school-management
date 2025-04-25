import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import {
    Paper, Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button
} from '@mui/material';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from '@mui/icons-material/Edit';
import { getAllNotices } from '../../../redux/noticeRelated/noticeHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import TableTemplate from '../../../components/TableTemplate';
import { GreenButton } from '../../../components/buttonStyles';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import axios from 'axios';

const ShowNotices = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { noticesList, loading, error, response } = useSelector((state) => state.notice);
  const { currentUser } = useSelector(state => state.user);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editNotice, setEditNotice] = useState({});

  useEffect(() => {
    dispatch(getAllNotices(currentUser._id, "Notice"));
  }, [currentUser._id, dispatch]);

  const deleteHandler = (deleteID, address) => {
    dispatch(deleteUser(deleteID, address))
      .then(() => dispatch(getAllNotices(currentUser._id, "Notice")));
  };

  const handleEditClick = (row) => {
    setEditNotice({ ...row });
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    try {
      await axios.put(`http://localhost:5001/Notice/${editNotice.id}`, editNotice);
      setEditModalOpen(false);
      dispatch(getAllNotices(currentUser._id, "Notice"));
    } catch (err) {
      console.error("Ошибка при обновлении:", err);
    }
  };

  const noticeColumns = [
    { id: 'title', label: 'Заголовок', minWidth: 170 },
    { id: 'details', label: 'Описание', minWidth: 100 },
    { id: 'date', label: 'Дата', minWidth: 170 },
  ];

  const noticeRows = noticesList?.map((notice) => {
    const date = new Date(notice.date);
    const dateString = isNaN(date) ? "Неверная дата" : date.toISOString().substring(0, 10);
    return {
      title: notice.title,
      details: notice.details,
      date: dateString,
      id: notice._id,
    };
  }) || [];

  const NoticeButtonHaver = ({ row }) => (
    <>
      <IconButton onClick={() => handleEditClick(row)}>
        <EditIcon color="primary" />
      </IconButton>
      <IconButton onClick={() => deleteHandler(row.id, "Notice")}>
        <DeleteIcon color="error" />
      </IconButton>
    </>
  );

  const actions = [
    {
      icon: <NoteAddIcon color="primary" />, name: 'Добавить объявление',
      action: () => navigate("/Admin/addnotice")
    },
    {
      icon: <DeleteIcon color="error" />, name: 'Удалить все объявления',
      action: () => deleteHandler(currentUser._id, "Notices")
    }
  ];

  return (
    <>
      {loading ? (
        <div>Загрузка...</div>
      ) : (
        <>
          {response ? (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <GreenButton variant="contained" onClick={() => navigate("/Admin/addnotice")}>
                Добавить объявление
              </GreenButton>
            </Box>
          ) : (
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              {noticesList?.length > 0 && (
                <TableTemplate buttonHaver={NoticeButtonHaver} columns={noticeColumns} rows={noticeRows} />
              )}
              <SpeedDialTemplate actions={actions} />
            </Paper>
          )}
        </>
      )}

      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <DialogTitle>Редактировать объявление</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Заголовок"
            value={editNotice.title || ''}
            onChange={(e) => setEditNotice({ ...editNotice, title: e.target.value })}
            margin="dense"
          />
          <TextField
            fullWidth
            label="Описание"
            value={editNotice.details || ''}
            onChange={(e) => setEditNotice({ ...editNotice, details: e.target.value })}
            margin="dense"
          />
          <TextField
            fullWidth
            label="Дата"
            type="date"
            value={editNotice.date || ''}
            onChange={(e) => setEditNotice({ ...editNotice, date: e.target.value })}
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleEditSave}>Сохранить</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ShowNotices;

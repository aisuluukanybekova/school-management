import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types'; // ✅ Добавлено
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Paper, Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button,
} from '@mui/material';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import { getAllNotices } from '../../../redux/noticeRelated/noticeHandle';
import TableTemplate from '../../../components/TableTemplate';
import { GreenButton } from '../../../components/buttonStyles';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';

function ShowNotices() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { noticesList, loading } = useSelector((state) => state.notice);
  const { currentUser } = useSelector((state) => state.user);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editNotice, setEditNotice] = useState({});

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(getAllNotices(currentUser._id));
    }
  }, [currentUser?._id, dispatch]);

  const deleteHandler = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить объявление?')) {
      try {
        await axios.delete(`http://localhost:5001/api/notices/${id}`);
        dispatch(getAllNotices(currentUser._id));
      } catch (err) {
        console.error('Ошибка при удалении объявления:', err);
      }
    }
  };

  const deleteAllNoticesHandler = async () => {
    if (window.confirm('Удалить ВСЕ объявления?')) {
      try {
        await axios.delete(`http://localhost:5001/api/notices/school/${currentUser._id}`);
        dispatch(getAllNotices(currentUser._id));
      } catch (err) {
        console.error('Ошибка при удалении всех объявлений:', err);
      }
    }
  };

  const handleEditClick = (row) => {
    setEditNotice({ ...row });
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    try {
      await axios.put(`http://localhost:5001/api/notices/${editNotice.id}`, {
        title: editNotice.title,
        details: editNotice.details,
        date: editNotice.date,
      });
      setEditModalOpen(false);
      dispatch(getAllNotices(currentUser._id));
    } catch (err) {
      console.error('Ошибка при обновлении:', err);
    }
  };

  const noticeColumns = [
    { id: 'title', label: 'Заголовок', minWidth: 170 },
    { id: 'details', label: 'Описание', minWidth: 100 },
    { id: 'date', label: 'Дата', minWidth: 170 },
  ];

  const noticeRows = Array.isArray(noticesList)
    ? [...noticesList]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((notice) => ({
        title: notice.title,
        details: notice.details,
        date: notice.date ? new Date(notice.date).toISOString().substring(0, 10) : 'Неверная дата',
        id: notice._id,
      }))
    : [];

  function NoticeButtonHaver({ row }) {
    return (
      <>
        <IconButton onClick={() => handleEditClick(row)}>
          <EditIcon color="primary" />
        </IconButton>
        <IconButton onClick={() => deleteHandler(row.id)}>
          <DeleteIcon color="error" />
        </IconButton>
      </>
    );
  }

  // Добавлена валидация PropTypes
  NoticeButtonHaver.propTypes = {
    row: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string,
      details: PropTypes.string,
      date: PropTypes.string,
    }).isRequired,
  };

  const actions = [
    {
      icon: <NoteAddIcon color="primary" />,
      name: 'Добавить объявление',
      action: () => navigate('/Admin/addnotice'),
    },
    {
      icon: <DeleteIcon color="error" />,
      name: 'Удалить все объявления',
      action: deleteAllNoticesHandler,
    },
  ];

  return (
    <>
      {loading ? (
        <div>Загрузка...</div>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <GreenButton
              variant="contained"
              onClick={() => navigate('/Admin/addnotice')}
              startIcon={<NoteAddIcon />}
              sx={{ mt: 2, mb: 1 }}
            >
              Добавить объявление
            </GreenButton>
          </Box>

          <Paper
            sx={{
              mt: 2,
              p: 3,
              borderRadius: 3,
              boxShadow: 3,
              backgroundColor: '#fff',
              animation: 'fadeIn 0.4s ease',
            }}
          >
            {noticeRows.length > 0 ? (
              <TableTemplate buttonHaver={NoticeButtonHaver} columns={noticeColumns} rows={noticeRows} />
            ) : (
              <Box sx={{ p: 2, textAlign: 'center', color: 'gray' }}>Нет объявлений.</Box>
            )}
            <SpeedDialTemplate actions={actions} />
          </Paper>
        </>
      )}

      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Редактировать объявление</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Заголовок"
            value={editNotice.title || ''}
            onChange={(e) => setEditNotice({ ...editNotice, title: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Описание"
            value={editNotice.details || ''}
            onChange={(e) => setEditNotice({ ...editNotice, details: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Дата"
            type="date"
            value={editNotice.date || ''}
            onChange={(e) => setEditNotice({ ...editNotice, date: e.target.value })}
            margin="normal"
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
}

export default ShowNotices;

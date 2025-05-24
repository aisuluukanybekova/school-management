import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box, TextField, IconButton, Select, MenuItem, Button, Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Popup from '../../../components/Popup';
import TableTemplate from '../../../components/TableTemplate';

function ShowSubjects() {
  const [records, setRecords] = useState([]);
  const [editCache, setEditCache] = useState({});
  const [editMode, setEditMode] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchClass, setSearchClass] = useState('');
  const [message, setMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [res, subRes, teachRes, classRes] = await Promise.all([
        axios.get('/api/teacherSubjectClass'),
        axios.get('/api/subjects'),
        axios.get('/api/teachers'),
        axios.get('/api/classes'),
      ]);

      setSubjects(subRes.data);
      setTeachers(teachRes.data);
      setClasses(classRes.data);

      const mapped = res.data.map((r) => ({
        id: r._id,
        subjectId: r.subject?._id || '',
        subject: r.subject?.subName || '',
        teacherId: r.teacher?._id || '',
        teacher: r.teacher?.name || '',
        classId: r.sclassName?._id || '',
        class: r.sclassName?.sclassName || '',
        sessions: r.sessions || 0,
      }));

      setRecords(mapped);
    } catch {
      setMessage('Ошибка загрузки данных');
      setShowPopup(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleEdit = (id) => {
    if (editMode[id]) {
      setEditCache((prev) => {
        const newCache = { ...prev };
        delete newCache[id];
        return newCache;
      });
    } else {
      const original = records.find((r) => r.id === id);
      setEditCache((prev) => ({
        ...prev,
        [id]: { ...original },
      }));
    }

    setEditMode((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const updateField = (id, field, value) => {
    setEditCache((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const saveHandler = async (id) => {
    const row = editCache[id];
    try {
      await axios.put(`/api/teacherSubjectClass/${id}`, {
        subjectId: row.subjectId,
        teacherId: row.teacherId,
        classId: row.classId,
        sessions: Number(row.sessions),
      });

      setMessage('Изменения сохранены');
      setShowPopup(true);
      setEditMode((prev) => ({ ...prev, [id]: false }));
      setEditCache((prev) => {
        const newCache = { ...prev };
        delete newCache[id];
        return newCache;
      });
      fetchData();
    } catch (err) {
      console.error('Ошибка при сохранении:', err?.response?.data || err.message);
      setMessage(err?.response?.data?.message || 'Ошибка при сохранении');
      setShowPopup(true);
    }
  };

  const deleteHandler = async (id) => {
    try {
      await axios.delete(`/api/teacherSubjectClass/${id}`);
      fetchData();
      setMessage('Удалено успешно');
      setShowPopup(true);
    } catch {
      setMessage('Ошибка при удалении');
      setShowPopup(true);
    }
  };

  const filtered = records.filter((r) =>
    r.subject.toLowerCase().includes(searchQuery.toLowerCase()) &&
    r.class.toLowerCase().includes(searchClass.toLowerCase())
  );

  const columns = [
    { id: 'subjectId', label: 'Предмет' },
    { id: 'classId', label: 'Класс' },
    { id: 'teacherId', label: 'Учитель' },
    { id: 'sessions', label: 'Занятий' },
  ];

  function ButtonHaver({ row }) {
    const isEditing = editMode[row.id];
    return (
      <Box sx={{ display: 'flex', gap: 1 }}>
        {isEditing ? (
          <>
            <IconButton onClick={() => saveHandler(row.id)}>
              <SaveIcon color="success" />
            </IconButton>
            <IconButton onClick={() => toggleEdit(row.id)}>
              <CloseIcon color="error" />
            </IconButton>
          </>
        ) : (
          <>
            <IconButton onClick={() => toggleEdit(row.id)}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => deleteHandler(row.id)}>
              <DeleteIcon color="error" />
            </IconButton>
          </>
        )}
      </Box>
    );
  }

  //  PropTypes для ButtonHaver
  ButtonHaver.propTypes = {
    row: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  };

  const rows = filtered.map((row) => {
    const isEditing = editMode[row.id];
    const data = isEditing ? editCache[row.id] : row;

    return {
      ...row,
      subjectId: isEditing ? (
        <Select
          fullWidth size="small" value={data.subjectId}
          onChange={(e) => updateField(row.id, 'subjectId', e.target.value)}
        >
          {subjects.map((s) => (
            <MenuItem key={s._id} value={s._id}>{s.subName}</MenuItem>
          ))}
        </Select>
      ) : row.subject,
      classId: isEditing ? (
        <Select
          fullWidth size="small" value={data.classId}
          onChange={(e) => updateField(row.id, 'classId', e.target.value)}
        >
          {classes.map((c) => (
            <MenuItem key={c._id} value={c._id}>{c.sclassName}</MenuItem>
          ))}
        </Select>
      ) : row.class,
      teacherId: isEditing ? (
        <Select
          fullWidth size="small" value={data.teacherId}
          onChange={(e) => updateField(row.id, 'teacherId', e.target.value)}
        >
          {teachers.map((t) => (
            <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>
          ))}
        </Select>
      ) : row.teacher,
      sessions: isEditing ? (
        <TextField
          type="number" size="small" value={data.sessions}
          onChange={(e) => updateField(row.id, 'sessions', e.target.value)}
        />
      ) : row.sessions,
    };
  });

  return (
    <>
      {loading ? (
        <Typography>Загрузка...</Typography>
      ) : (
        <Box>
          <Box
            sx={{
              display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap',
            }}
          >
            <TextField
              label="Поиск по предмету"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <TextField
              label="Поиск по классу"
              value={searchClass}
              onChange={(e) => setSearchClass(e.target.value)}
            />
            <Button variant="contained" onClick={() => navigate('/Admin/subjects/assign')}>
              Назначить предмет
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate('/Admin/addsubject')}
            >
              Добавить предмет
            </Button>
          </Box>

          <TableTemplate columns={columns} rows={rows} buttonHaver={ButtonHaver} />
        </Box>
      )}
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </>
  );
}

export default ShowSubjects;

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Paper, Box, Typography, Checkbox, Button, Stack, Tabs, Tab,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllComplains,
  deleteComplain,
} from '../../../redux/complainRelated/complainHandle';
import {
  getAllTeacherComplains,
  deleteTeacherComplain,
} from '../../../redux/teachercomplainRelated/teacherComplainHandle';
import TableTemplate from '../../../components/TableTemplate';

function SeeComplains() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { complains, status: studentStatus, error: studentError } = useSelector((state) => state.complain);
  const {
    teacherComplains, status: teacherStatus, error: teacherError,
  } = useSelector((state) => state.teacherComplain);

  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedComplains, setSelectedComplains] = useState([]);

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(getAllComplains(currentUser._id));
      dispatch(getAllTeacherComplains(currentUser._id));
    }
  }, [currentUser._id, dispatch]);

  const handleSelect = (id) => {
    setSelectedComplains((prev) => (
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    ));
  };

  const handleDeleteSelected = () => {
    if (selectedComplains.length === 0) return;

    selectedComplains.forEach((id) => {
      if (selectedTab === 0) {
        dispatch(deleteComplain(id, currentUser._id));
      } else {
        dispatch(deleteTeacherComplain(id, currentUser._id));
      }
    });
    setSelectedComplains([]);
  };

  const commonColumns = [
    { id: 'user', label: 'Пользователь', minWidth: 170 },
    { id: 'complaint', label: 'Жалоба', minWidth: 100 },
    { id: 'date', label: 'Дата', minWidth: 120 },
  ];

  const buildRows = (items, isTeacher = false) => (
    items?.map((item) => {
      const date = new Date(item.date);
      return {
        user: item[isTeacher ? 'teacher' : 'user']?.name || 'Неизвестно',
        complaint: item.description || item.complaint,
        date: isNaN(date) ? 'Неверная дата' : date.toISOString().split('T')[0],
        id: item._id,
      };
    }) || []
  );

  const dataSet = selectedTab === 0
    ? { rows: buildRows(complains), loading: studentStatus === 'loading', error: studentError }
    : { rows: buildRows(teacherComplains, true), loading: teacherStatus === 'loading', error: teacherError };

  function ComplainButtonHaver({ row }) {
    return (
      <Checkbox
        checked={selectedComplains.includes(row.id)}
        onChange={() => handleSelect(row.id)}
      />
    );
  }

  // ✅ PropTypes валидация
  ComplainButtonHaver.propTypes = {
    row: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  };

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Tabs
        value={selectedTab}
        onChange={(_, v) => setSelectedTab(v)}
        centered
        sx={{ mb: 2 }}
      >
        <Tab label="Ученики" />
        <Tab label="Учителя" />
      </Tabs>

      {dataSet.error ? (
        <Typography color="error" align="center">Ошибка загрузки жалоб</Typography>
      ) : dataSet.loading ? (
        <Typography align="center">Загрузка...</Typography>
      ) : dataSet.rows.length > 0 ? (
        <>
          <Stack direction="row" spacing={2} sx={{ mb: 2, justifyContent: 'flex-end', pr: 2 }}>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteSelected}
              disabled={selectedComplains.length === 0}
            >
              Удалить выбранные
            </Button>
          </Stack>
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableTemplate
              buttonHaver={ComplainButtonHaver}
              columns={commonColumns}
              rows={dataSet.rows}
            />
          </Paper>
        </>
      ) : (
        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
          Жалоб нет
        </Typography>
      )}
    </Box>
  );
}

export default SeeComplains;

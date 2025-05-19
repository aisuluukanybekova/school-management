// components/admin/SeeComplains.js
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Paper, Box, Typography, Checkbox, Button, Stack } from '@mui/material';
import { getAllComplains, deleteComplain } from '../../../redux/complainRelated/complainHandle';
import TableTemplate from '../../../components/TableTemplate';

const SeeComplains = () => {
  const dispatch = useDispatch();
  const { complains, status, error } = useSelector((state) => state.complain);
  const { currentUser } = useSelector((state) => state.user);

  const [selectedComplains, setSelectedComplains] = useState([]);

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(getAllComplains(currentUser._id));
    }
  }, [currentUser._id, dispatch]);

  const handleSelect = (id) => {
    setSelectedComplains((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedComplains.length > 0) {
      selectedComplains.forEach(id => dispatch(deleteComplain(id, currentUser._id)));
      setSelectedComplains([]);
    }
  };

  const complainColumns = [
    { id: 'user', label: 'Пользователь', minWidth: 170 },
    { id: 'complaint', label: 'Жалоба', minWidth: 100 },
    { id: 'date', label: 'Дата', minWidth: 170 },
  ];

  const complainRows = complains?.map((complain) => {
    const date = new Date(complain.date);
    const dateString = isNaN(date) ? "Неверная дата" : date.toISOString().substring(0, 10);
    return {
      user: complain.user?.name || 'Неизвестно',
      complaint: complain.complaint,
      date: dateString,
      id: complain._id,
    };
  }) || [];

  const ComplainButtonHaver = ({ row }) => (
    <Checkbox
      checked={selectedComplains.includes(row.id)}
      onChange={() => handleSelect(row.id)}
    />
  );

  if (error) {
    return <Typography color="error">Ошибка загрузки жалоб</Typography>;
  }

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      {status === 'loading' ? (
        <Typography align="center">Загрузка...</Typography>
      ) : complainRows.length > 0 ? (
        <>
          <Stack direction="row" spacing={2} sx={{ mb: 2, justifyContent: 'flex-end' }}>
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
              columns={complainColumns}
              rows={complainRows}
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
};

export default SeeComplains;

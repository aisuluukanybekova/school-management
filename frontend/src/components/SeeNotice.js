import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Paper } from '@mui/material';
import { getAllNotices } from '../redux/noticeRelated/noticeHandle';
import TableViewTemplate from './TableViewTemplate';

function SeeNotice() {
  const dispatch = useDispatch();

  const { currentUser, currentRole } = useSelector((state) => state.user);
  const {
    noticesList, loading, error, response,
  } = useSelector((state) => state.notice);

  useEffect(() => {
    if (!currentUser || !currentRole) return;

    if (currentRole === 'Admin') {
      dispatch(getAllNotices(currentUser._id, 'Notice'));
    } else {
      dispatch(getAllNotices(currentUser.school._id, 'Notice'));
    }
  }, [dispatch, currentRole, currentUser]);

  if (error) {
    console.error(error);
  }

  const noticeColumns = [
    { id: 'title', label: 'Заголовок', minWidth: 170 },
    { id: 'details', label: 'Описание', minWidth: 100 },
    { id: 'date', label: 'Дата', minWidth: 170 },
  ];

  const noticeRows = noticesList.map((notice) => {
    const date = new Date(notice.date);
    const dateString = date.toString() !== 'Invalid Date'
      ? date.toISOString().substring(0, 10)
      : 'Неверная дата';
    return {
      title: notice.title,
      details: notice.details,
      date: dateString,
      id: notice._id,
    };
  });

  return (
    <div style={{ marginTop: '50px', marginRight: '20px' }}>
      {loading ? (
        <div style={{ fontSize: '20px' }}>Загрузка...</div>
      ) : response ? (
        <div style={{ fontSize: '20px' }}>Объявлений пока нет</div>
      ) : (
        <>
          <h3 style={{ fontSize: '30px', marginBottom: '40px' }}>Объявления</h3>
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            {Array.isArray(noticesList) && noticesList.length > 0 && (
              <TableViewTemplate columns={noticeColumns} rows={noticeRows} />
            )}
          </Paper>
        </>
      )}
    </div>
  );
}

export default SeeNotice;

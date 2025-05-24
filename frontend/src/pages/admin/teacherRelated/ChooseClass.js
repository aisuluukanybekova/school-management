import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { PurpleButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';

function ChooseClass({ situation }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    sclassesList, loading, error, getresponse,
  } = useSelector((state) => state.sclass);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getAllSclasses(currentUser._id, 'Sclass'));
  }, [currentUser._id, dispatch]);

  const navigateHandler = (classID) => {
    if (situation === 'Teacher') {
      navigate(`/Admin/teachers/choosesubject/${classID}`);
    } else if (situation === 'Subject') {
      navigate(`/Admin/addsubject/${classID}`);
    }
  };

  const sclassColumns = [
    { id: 'name', label: 'Название класса', minWidth: 170 },
  ];

  const sclassRows = Array.isArray(sclassesList)
    ? sclassesList.map((sclass) => ({
        name: sclass.sclassName,
        id: sclass._id,
      }))
    : [];

  function SclassButtonHaver({ row }) {
    return (
      <PurpleButton
        variant="contained"
        onClick={() => navigateHandler(row.id)}
      >
        Выбрать
      </PurpleButton>
    );
  }

  //  Валидация пропсов
  ChooseClass.propTypes = {
    situation: PropTypes.string.isRequired,
  };

  SclassButtonHaver.propTypes = {
    row: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  };

  return (
    <>
      {loading ? (
        <div>Загрузка...</div>
      ) : error ? (
        <Box sx={{ p: 4, textAlign: 'center', color: 'red' }}>
          Ошибка загрузки классов. Пожалуйста, попробуйте позже.
        </Box>
      ) : getresponse ? (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button variant="contained" onClick={() => navigate('/Admin/addclass')}>
            Добавить класс
          </Button>
        </Box>
      ) : (
        <>
          <Typography variant="h6" gutterBottom component="div">
            Выберите класс
          </Typography>
          {sclassRows.length > 0 && (
            <TableTemplate
              buttonHaver={SclassButtonHaver}
              columns={sclassColumns}
              rows={sclassRows}
            />
          )}
        </>
      )}
    </>
  );
}

export default ChooseClass;

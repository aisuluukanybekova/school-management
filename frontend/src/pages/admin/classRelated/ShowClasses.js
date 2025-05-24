import { useEffect, useState } from 'react';
import {
  IconButton,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import AddCardIcon from '@mui/icons-material/AddCard';
import styled from 'styled-components';
import axios from 'axios';
import PropTypes from 'prop-types';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';

function ShowClasses() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sclassesList } = useSelector((state) => state.sclass);
  const { currentUser } = useSelector((state) => state.user);
  const adminID = currentUser._id;

  const [searchQuery, setSearchQuery] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editClass, setEditClass] = useState({});

  useEffect(() => {
    dispatch(getAllSclasses(adminID));
  }, [adminID, dispatch]);

  const deleteHandler = (deleteID) => {
    dispatch(deleteUser(deleteID, 'classes')).then(() =>
      dispatch(getAllSclasses(adminID))
    );
  };

  const handleEditClick = (row) => {
    setEditClass({ _id: row.id, sclassName: row.name });
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    try {
      await axios.put(
        `http://localhost:5001/api/classes/${editClass._id}`,
        { sclassName: editClass.sclassName }
      );
      setEditModalOpen(false);
      dispatch(getAllSclasses(adminID));
      setMessage('Изменения сохранены успешно!');
      setShowPopup(true);
    } catch (err) {
      console.error('Ошибка при редактировании:', err);
      setMessage('Ошибка при сохранении изменений.');
      setShowPopup(true);
    }
  };

  const sclassColumns = [
    { id: 'name', label: 'Название класса', minWidth: 170 },
  ];

  const sclassRows =
    sclassesList?.slice()
      .sort((a, b) => {
        const parse = (str) => {
          const match = str.match(/^(\d+)?\s*([а-яА-Яa-zA-Z]*)/);
          const num = parseInt(match?.[1] || 0, 10);
          const letter = match?.[2] || '';
          return [num, letter.toLowerCase()];
        };
        const [numA, letterA] = parse(a.sclassName);
        const [numB, letterB] = parse(b.sclassName);
        return numA !== numB ? numA - numB : letterA.localeCompare(letterB);
      })
      .map((sclass) => ({
        name: sclass.sclassName,
        id: sclass._id,
      })) || [];

  const filteredRows = sclassRows.filter((row) =>
    row.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function SclassButtonHaver({ row }) {
    const actions = [
      {
        icon: <PersonAddAlt1Icon />,
        name: 'Добавить ученика',
        action: () => navigate(`/Admin/class/addstudents/${row.id}`),
      },
    ];

    return (
      <ButtonContainer>
        <Tooltip title="Удалить класс">
          <IconButton onClick={() => deleteHandler(row.id)}>
            <DeleteIcon color="error" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Редактировать класс">
          <IconButton onClick={() => handleEditClick(row)}>
            <EditIcon color="primary" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Просмотр класса">
          <BlueButton
            variant="contained"
            onClick={() => navigate(`/Admin/classes/class/${row.id}`)}
          >
            Просмотр
          </BlueButton>
        </Tooltip>
        <ActionMenu actions={actions} />
      </ButtonContainer>
    );
  }

  SclassButtonHaver.propTypes = {
    row: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
  };

  function ActionMenu({ actions }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    return (
      <>
        <Tooltip title="Дополнительно">
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <SpeedDialIcon />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
          PaperProps={{ elevation: 2, sx: styles.styledPaper }}
        >
         {actions.map((action) => (
  <MenuItem key={action.name} onClick={action.action}>
    <ListItemIcon>{action.icon}</ListItemIcon>
    {action.name}
  </MenuItem>
))}
        </Menu>
      </>
    );
  }

  ActionMenu.propTypes = {
    actions: PropTypes.arrayOf(
      PropTypes.shape({
        icon: PropTypes.node.isRequired,
        name: PropTypes.string.isRequired,
        action: PropTypes.func.isRequired,
      })
    ).isRequired,
  };

  const actions = [
    {
      icon: <AddCardIcon color="primary" />,
      name: 'Добавить новый класс',
      action: () => navigate('/Admin/addclass'),
    },
    {
      icon: <DeleteIcon color="error" />,
      name: 'Удалить все классы',
      action: () => {
        if (window.confirm('Вы уверены, что хотите удалить все классы?')) {
          dispatch(deleteUser(adminID, 'classes')).then(() =>
            dispatch(getAllSclasses(adminID))
          );
        }
      },
    },
  ];

  return (
    <>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Управление классами
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }} elevation={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextField
            label="Поиск по классу"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <GreenButton variant="contained" onClick={() => navigate('/Admin/addclass')}>
            Добавить класс
          </GreenButton>
        </Box>
      </Paper>

      {Array.isArray(filteredRows) && filteredRows.length > 0 ? (
        <TableTemplate buttonHaver={SclassButtonHaver} columns={sclassColumns} rows={filteredRows} />
      ) : (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
          Нет доступных классов.
        </Typography>
      )}

      <SpeedDialTemplate actions={actions} />

      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <DialogTitle>Редактировать класс</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Название класса"
            value={editClass.sclassName || ''}
            onChange={(e) =>
              setEditClass({ ...editClass, sclassName: e.target.value })
            }
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleEditSave}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </>
  );
}

export default ShowClasses;

const styles = {
  styledPaper: {
    overflow: 'visible',
    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
    mt: 1.5,
    '&:before': {
      content: '""',
      display: 'block',
      position: 'absolute',
      top: 0,
      right: 14,
      width: 10,
      height: 10,
      bgcolor: 'background.paper',
      transform: 'translateY(-50%) rotate(45deg)',
      zIndex: 0,
    },
  },
};

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

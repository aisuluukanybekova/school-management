import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { authLogout } from '../redux/userRelated/userSlice';

function Logout() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(authLogout());
    navigate('/');
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <Wrapper>
      <ModalCard>
        <IconContainer>
          <StyledIcon />
        </IconContainer>
        <Title>{currentUser?.name || 'Пользователь'}</Title>
        <Message>Вы уверены, что хотите выйти из системы?</Message>
        <ButtonGroup>
          <Button onClick={handleLogout} variant="logout">Выйти</Button>
          <Button onClick={handleCancel} variant="cancel">Отмена</Button>
        </ButtonGroup>
      </ModalCard>
    </Wrapper>
  );
}

export default Logout;

// Styled Components

const Wrapper = styled.div`
  height: 100vh;
  background: #ffffff;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 100px; /* <-- поднимает окно выше центра */
`;

const ModalCard = styled.div`
  background: #fff;
  padding: 40px 30px;
  border-radius: 20px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.4s ease;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const IconContainer = styled.div`
  background-color: #f8d7da;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  margin: 0 auto 20px auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledIcon = styled(ExitToAppIcon)`
  font-size: 36px !important;
  color: #c62828;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #333;
`;

const Message = styled.p`
  font-size: 15px;
  color: #666;
  margin: 16px 0 32px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
`;

const Button = styled.button`
  padding: 10px 22px;
  font-size: 15px;
  border-radius: 8px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background-color: ${(props) => (props.variant === 'logout' ? '#d32f2f' : '#7e57c2')};
  color: white;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  }
`;

import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import styled, { keyframes } from 'styled-components';
import { LightPurpleButton } from '../components/buttonStyles';

function Homepage() {
  return (
    <AnimatedBackground>
      <FadeInCardContainer maxWidth="sm">
        <FrostedCard>
          <MainTitle>Добро пожаловать</MainTitle>
          <SubTitle>Система управления школой</SubTitle>
          <InfoText>
            Организуйте учебный процесс, управляйте классами, учениками и преподавателями.
            Вся информация — в одном месте.
          </InfoText>
          <StyledBox>
            <StyledLink to="/choose">
              <AnimatedButton variant="contained" fullWidth>
                Войти
              </AnimatedButton>
            </StyledLink>
            <MutedText>
              Нет аккаунта?
              {' '}
              <HoverLink to="/Adminregister">Зарегистрироваться</HoverLink>
            </MutedText>
          </StyledBox>
        </FrostedCard>
      </FadeInCardContainer>
    </AnimatedBackground>
  );
}

export default Homepage;

// === Animations ===

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const fadeInSlideUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

// === Styled Components ===

const AnimatedBackground = styled.div`
  height: 100vh;
  width: 100%;
  background: linear-gradient(-45deg, #d0dfff, #f3e9ff, #e3f6f5, #fce8ff);
  background-size: 400% 400%;
  animation: ${gradientAnimation} 12s ease infinite;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: clamp(100px, 10vh, 140px); 
`;

const FadeInCardContainer = styled(Container)`
  display: flex;
  justify-content: center;
  animation: ${fadeInSlideUp} 1.2s ease forwards;
`;

const FrostedCard = styled.div`
  backdrop-filter: blur(12px);
  background-color: rgba(255, 255, 255, 0.65);
  border-radius: 20px;
  padding: 3rem 2rem;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 500px;
  width: 100%;
`;

const MainTitle = styled.h1`
  font-size: 2.7rem;
  font-weight: 800;
  color: #2d004d;
  margin-bottom: 0.3em;
`;

const SubTitle = styled.h2`
  font-size: 1.6rem;
  font-weight: 500;
  color: #4a0072;
  margin-bottom: 1.5rem;
`;

const InfoText = styled.p`
  font-size: 1rem;
  color: #333;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const StyledBox = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;

const HoverLink = styled(Link)`
  color: #6e2cc9;
  font-weight: 600;
  text-decoration: none;
  transition: 0.3s ease;
  &:hover {
    text-decoration: underline;
    color: #4b1a9c;
  }
`;

const MutedText = styled.p`
  font-size: 0.9rem;
  color: #4f4f4f;
`;

const AnimatedButton = styled(LightPurpleButton)`
  transition: transform 0.25s ease;
  &:hover {
    transform: scale(1.03);
  }
`;

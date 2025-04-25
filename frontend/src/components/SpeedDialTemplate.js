import React from 'react'
import { SpeedDial, SpeedDialAction, styled } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';

const SpeedDialTemplate = ({ actions }) => {
    return (
        <CustomSpeedDial
            ariaLabel="Пример панели быстрого доступа"
            icon={<TuneIcon />}
            direction="left"
        >
            {actions.map((action) => (
                <SpeedDialAction
                    key={action.name}
                    icon={action.icon}
                    tooltipTitle={action.name} // Названия кнопок будут как в исходном объекте actions
                    onClick={action.action}
                />
            ))}
        </CustomSpeedDial>
    )
}

export default SpeedDialTemplate

const CustomSpeedDial = styled(SpeedDial)`
  .MuiSpeedDial-fab {
    background-color: #032803;
    
    &:hover {
      background-color: green;
    }
  }
`;

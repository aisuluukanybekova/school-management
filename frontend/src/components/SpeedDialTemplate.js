import React from 'react';
import PropTypes from 'prop-types';
import { SpeedDial, SpeedDialAction, styled } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';

function SpeedDialTemplate({ actions }) {
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
          tooltipTitle={action.name}
          onClick={action.action}
        />
      ))}
    </CustomSpeedDial>
  );
}

SpeedDialTemplate.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      icon: PropTypes.node.isRequired,
      action: PropTypes.func.isRequired,
    })
  ).isRequired,
};

export default SpeedDialTemplate;

const CustomSpeedDial = styled(SpeedDial)`
  .MuiSpeedDial-fab {
    background-color: #032803;

    &:hover {
      background-color: green;
    }
  }
`;

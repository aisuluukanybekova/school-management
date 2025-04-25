import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { daysOfWeek, timeSlots } from './scheduleUtils';

const ScheduleTable = ({ schedule }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Время</TableCell>
            {daysOfWeek.map((day) => (
              <TableCell key={day}>{day}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {timeSlots.map((slot) => (
            <TableRow key={slot}>
              <TableCell>{slot}</TableCell>
              {daysOfWeek.map((day) => (
                <TableCell key={day}>
                  {schedule[day]?.[slot] || '—'}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ScheduleTable;

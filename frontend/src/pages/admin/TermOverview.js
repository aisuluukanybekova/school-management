import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Typography, Table, TableHead, TableBody, TableRow, TableCell
} from '@mui/material';
import { differenceInBusinessDays } from 'date-fns';

const TermOverview = ({ schoolId }) => {
  const [terms, setTerms] = useState([]);

  useEffect(() => {
    axios.get(`/api/terms/${schoolId}`).then(res => setTerms(res.data));
  }, [schoolId]);

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>Четверти и учебные дни</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>№</TableCell>
            <TableCell>Начало</TableCell>
            <TableCell>Окончание</TableCell>
            <TableCell>Учебных дней</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {terms.map((term) => (
            <TableRow key={term._id}>
              <TableCell>{term.termNumber}</TableCell>
              <TableCell>{term.startDate?.slice(0, 10)}</TableCell>
              <TableCell>{term.endDate?.slice(0, 10)}</TableCell>
              <TableCell>
                {differenceInBusinessDays(
                  new Date(term.endDate),
                  new Date(term.startDate)
                ) + 1}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default TermOverview;

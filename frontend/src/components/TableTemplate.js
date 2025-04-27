import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box
} from '@mui/material';

const TableTemplate = ({ columns, rows, buttonHaver: ButtonHaver }) => {
  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <TableContainer component={Paper} sx={{
        borderRadius: 3,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                align="center"
                sx={{
                  backgroundColor: 'black',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: { xs: '12px', md: '16px' },
                }}
              >
                №
              </TableCell>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align="center"
                  sx={{
                    backgroundColor: 'black',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: { xs: '12px', md: '16px' },
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
              <TableCell
                align="center"
                sx={{
                  backgroundColor: 'black',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: { xs: '12px', md: '16px' },
                }}
              >
                Действия
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length > 0 ? rows.map((row, index) => (
              <TableRow
                hover
                key={row.id}
                sx={{
                  transition: 'background-color 0.3s',
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }}
              >
                <TableCell align="center" sx={{ fontSize: { xs: '12px', md: '14px' } }}>
                  {index + 1}
                </TableCell>
                {columns.map((column) => (
                  <TableCell key={column.id} align="center" sx={{ fontSize: { xs: '12px', md: '14px' } }}>
                    {row[column.id]}
                  </TableCell>
                ))}
                <TableCell align="center">
                  <ButtonHaver row={row} />
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={columns.length + 2} align="center" sx={{ p: 4 }}>
                  Нет данных для отображения
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TableTemplate;

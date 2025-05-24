import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from '@mui/material';

function TableTemplate({ columns, rows, buttonHaver: ButtonHaver }) {
  const hasActions = typeof ButtonHaver === 'function';

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                align="center"
                sx={{
                  backgroundColor: 'black',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: { xs: '12px', md: '14px' },
                  border: '1px solid #ccc',
                }}
              >
                №
              </TableCell>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'center'}
                  sx={{
                    backgroundColor: 'black',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: { xs: '12px', md: '14px' },
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                    whiteSpace: column.noWrap ? 'nowrap' : 'normal',
                    border: '1px solid #ccc',
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
              {hasActions && (
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: 'black',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: { xs: '12px', md: '14px' },
                    border: '1px solid #ccc',
                  }}
                >
                  Действия
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length > 0 ? rows.map((row, index) => (
              <TableRow
                hover
                key={row.id || index}
                sx={{
                  transition: 'background-color 0.3s',
                  '&:hover': { backgroundColor: '#f9f9f9' },
                }}
              >
                <TableCell
                  align="center"
                  sx={{
                    fontSize: { xs: '12px', md: '14px' },
                    border: '1px solid #ccc',
                  }}
                >
                  {index + 1}
                </TableCell>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || 'center'}
                    sx={{
                      fontSize: { xs: '12px', md: '14px' },
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth,
                      whiteSpace: column.noWrap ? 'nowrap' : 'normal',
                      border: '1px solid #ccc',
                    }}
                  >
                    {row[column.id]}
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell align="center" sx={{ border: '1px solid #ccc' }}>
                    <ButtonHaver row={row} />
                  </TableCell>
                )}
              </TableRow>
            )) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1 + (hasActions ? 1 : 0)}
                  align="center"
                  sx={{ p: 4, border: '1px solid #ccc' }}
                >
                  Нет данных для отображения
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

TableTemplate.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      align: PropTypes.string,
      minWidth: PropTypes.number,
      maxWidth: PropTypes.number,
      noWrap: PropTypes.bool,
    })
  ).isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  buttonHaver: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
};

export default TableTemplate;

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const dummyData = [
  { date: '01.04', статус: 1 },
  { date: '02.04', статус: 0 },
  { date: '03.04', статус: 1 },
  { date: '04.04', статус: 1 },
  { date: '05.04', статус: 0 },
];

const AttendanceChart = ({ teacherId }) => {
  // Здесь можно будет подключить реальные данные по `teacherId`
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={dummyData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis tickCount={2} domain={[0, 1]} />
        <Tooltip />
        <Line type="monotone" dataKey="статус" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default AttendanceChart;

// src/components/charts/PerformanceChart.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PerformanceChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="marks" stroke="#8884d8" name="Оценки" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PerformanceChart;

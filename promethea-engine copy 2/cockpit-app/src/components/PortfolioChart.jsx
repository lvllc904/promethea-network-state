import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './PortfolioChart.css';

const PortfolioChart = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/portfolio/history?days=30');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rawData = await response.json();
        // Recharts expects the data to be an array of objects.
        // We also format the timestamp for better display on the chart's X-axis.
        const formattedData = rawData.map(point => ({
          ...point,
          // Format '2023-10-27T10:00:00' -> '10/27'
          date: new Date(point.timestamp).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
        }));
        setData(formattedData);
        setError(null);
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch portfolio history:", e);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return <div className="chart-panel error">Error fetching chart data: {error}</div>;
  }

  if (data.length === 0) {
    return <div className="chart-panel loading">Loading Chart Data...</div>;
  }

  return (
    <div className="chart-panel">
      <h2>Portfolio Performance (30d)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="date" stroke="#888" />
          <YAxis stroke="#888" domain={['auto', 'auto']} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
          <Tooltip contentStyle={{ backgroundColor: '#2d2d2d', border: '1px solid #555' }} />
          <Legend />
          <Line type="monotone" dataKey="value" name="Portfolio Value" stroke="#8884d8" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PortfolioChart;
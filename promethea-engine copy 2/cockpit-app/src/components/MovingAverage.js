import React from 'react';
import { Line } from '@react-three/drei';

const MovingAverage = ({ data, dataKey, color, width }) => {
  if (!data || data.length < 2) {
    return null;
  }

  const points = data
    .map((dataPoint, index) => {
      const yValue = dataPoint.ohlc[dataKey];
      if (yValue === null || yValue === undefined) {
        return null;
      }
      // Spread the points out along the x-axis, similar to Candlestick
      const positionX = index * 1.5;
      return [positionX, yValue, 0];
    })
    .filter(Boolean); // Remove any null points

  return (
    <Line
      points={points}
      color={color}
      lineWidth={width}
    />
  );
};

export default MovingAverage;
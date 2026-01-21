import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Candlestick from './Candlestick';
import MovingAverage from './MovingAverage';

const DataCube = ({ visualization }) => {
  const [historicalData, setHistoricalData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://127.0.0.1:8000/api/v1/historical_states?days=90');
        const result = await response.json();
        if (result.status === 'ok') {
          // The API returns data from newest to oldest, so we reverse it for charting
          setHistoricalData(result.data.reverse());
        }
      } catch (error) {
        console.error("Failed to fetch historical data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoricalData();
  }, []);

  return (
    <div className="data-cube-container">
      <div style={{ height: '100%', width: '100%' }}>
        {isLoading ? <p>Loading 3D Chart Data...</p> :
        <Canvas camera={{ position: [50, 25, 100], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <gridHelper args={[200, 20]} />
          {historicalData.map((dataPoint, index) => (
            <Candlestick key={dataPoint.timestamp} data={dataPoint} index={index} />
          ))}
          <MovingAverage
            data={historicalData}
            dataKey="sma7"
            color="#ffc107" // Amber
            width={0.15}
          />
          <MovingAverage
            data={historicalData}
            dataKey="sma20"
            color="#03a9f4" // Light Blue
            width={0.15}
          />
          <OrbitControls />
        </Canvas>
        }
      </div>
    </div>
  );
};

export default DataCube;
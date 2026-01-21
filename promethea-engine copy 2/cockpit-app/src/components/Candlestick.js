import React from 'react';

const Candlestick = ({ data, index }) => {
  const { open, high, low, price: close } = data.ohlc;
  const isBullish = close >= open;

  // --- Geometry Calculations ---
  // Body
  const bodyHeight = Math.abs(open - close);
  const bodyCenterY = (open + close) / 2;

  // Wick
  const wickHeight = high - low;
  const wickCenterY = (high + low) / 2;

  // --- Positioning ---
  // Spread the candles out along the x-axis
  const positionX = index * 1.5;

  return (
    <group position={[positionX, 0, 0]}>
      {/* Candle Body */}
      <mesh position={[0, bodyCenterY, 0]}>
        <boxGeometry args={[1, bodyHeight, 1]} />
        <meshStandardMaterial
          color={isBullish ? '#26a69a' : '#ef5350'}
          emissive={isBullish ? '#26a69a' : '#ef5350'}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Wick */}
      <mesh position={[0, wickCenterY, 0]}>
        <cylinderGeometry args={[0.1, 0.1, wickHeight, 8]} />
        <meshStandardMaterial color={'#666666'} />
      </mesh>
    </group>
  );
};

export default Candlestick;
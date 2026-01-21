import React from 'react';

const ChaosVector = ({ stateVector, manifest }) => {
  if (!stateVector || !manifest) {
    return <div className="card">Loading Chaos Vector...</div>;
  }

  // The manifest prop is now the full manifest object.
  const offset = manifest.getOffset('chaos');
  const vectorSlice = stateVector.slice(offset, offset + manifest.chaos.length);

  return (
    <div className="card">
      <h2>Chaos & Entanglement</h2>
      <div className="card-content">
        {manifest.chaos.map((item, index) => (
          <p key={item}>
            <span>{item}:</span>
            <span>
              {vectorSlice[index] ? vectorSlice[index].toFixed(4) : 'N/A'}
            </span>
          </p>
        ))}
      </div>
    </div>
  );
};

export default ChaosVector;
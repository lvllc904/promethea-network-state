import React from 'react';

const StateVector = ({ stateVector, manifest }) => {
  if (!stateVector || !manifest) {
    return <div className="card">Loading state vector...</div>;
  }

  // The manifest prop is now the full manifest object. We access the 'technical' array from it.
  const itemsToDisplay = manifest.technical;

  return (
    <div className="card">
      <h2>Core Technical Vector</h2>
      <div className="card-content">
        {itemsToDisplay.map((item, index) => (
          <p key={item}>
            <span>{item}:</span>
            <span>
              {stateVector[index] ? stateVector[index].toFixed(4) : 'N/A'}
            </span>
          </p>
        ))}
      </div>
    </div>
  );
};

export default StateVector;
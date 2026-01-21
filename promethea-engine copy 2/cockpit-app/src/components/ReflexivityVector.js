import React from 'react';

const ReflexivityVector = ({ stateVector, manifest }) => {
  if (!stateVector || !manifest) {
    return <div className="card">Loading Reflexivity Vector...</div>;
  }

  // The manifest prop is now the full manifest object.
  const offset = manifest.getOffset('reflexivity');
  const vectorSlice = stateVector.slice(offset, offset + manifest.reflexivity.length);

  return (
    <div className="card">
      <h2>Reflexivity Vector</h2>
      <div className="card-content">
        {manifest.reflexivity.map((item, index) => (
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

export default ReflexivityVector;
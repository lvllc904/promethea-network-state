import React from 'react';

const PsychologyVector = ({ stateVector, manifest }) => {
  if (!stateVector || !manifest) {
    return <div className="card">Loading Psychology Vector...</div>;
  }

  // The manifest prop is now the full manifest object.
  const offset = manifest.getOffset('psychology');
  const vectorSlice = stateVector.slice(offset, offset + manifest.psychology.length);

  return (
    <div className="card">
      <h2>Psychology Vector</h2>
      <div className="card-content">
        {manifest.psychology.map((item, index) => (
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

export default PsychologyVector;
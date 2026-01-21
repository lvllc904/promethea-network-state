import React, { useState, useEffect } from 'react';
import './AgentMemory.css';

const AgentMemory = () => {
  const [memories, setMemories] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const response = await fetch('/api/agent/memory?limit=10');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMemories(data);
        setError(null);
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch agent memories:", e);
      }
    };

    fetchMemories();
    const interval = setInterval(fetchMemories, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getOutcomeClass = (outcome) => {
    if (outcome.includes('profit')) return 'outcome-profit';
    if (outcome.includes('loss')) return 'outcome-loss';
    if (outcome.includes('opportunity')) return 'outcome-opportunity';
    return '';
  };

  const formatTimestamp = (ts) => {
    return new Date(ts).toLocaleString();
  }

  return (
    <div className="memory-panel">
      <h2>Agent Memory Log</h2>
      {error && <div className="error-message">Error fetching memories: {error}</div>}
      <div className="memory-table-container">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Outcome</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {memories.length > 0 ? memories.map(mem => (
              <tr key={mem.id}>
                <td>{formatTimestamp(mem.timestamp)}</td>
                <td className={`outcome ${getOutcomeClass(mem.outcome)}`}>{mem.outcome.replace(/_/g, ' ')}</td>
                <td>{(mem.confidence * 100).toFixed(1)}%</td>
              </tr>
            )) : (
              <tr><td colSpan="3">No significant memories recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgentMemory;
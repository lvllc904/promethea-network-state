import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import DataCube from './components/DataCube';
import { getFeatureManifest } from './utils/manifest';

function App() {
  const [agentStatus, setAgentStatus] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [visualization, setVisualization] = useState('price'); // New state for visualization

  const API_URL = 'http://127.0.0.1:8000/api/v1/status';
  const feature_manifest = getFeatureManifest();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setAgentStatus(data);
        setError(null);
        setLastUpdated(new Date());
      } catch (e) {
        setError(e.message);
        setAgentStatus(null);
      }
    };

    // Fetch immediately on component mount
    fetchStatus();

    // Set up an interval to fetch data every 5 seconds
    const intervalId = setInterval(fetchStatus, 5000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []); // The empty dependency array ensures this effect runs only once on mount

  return (
    <div className="App">
      <header className="App-header">
        <h1>Promethea Cockpit</h1>
        <p>
          Last Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'N/A'}
        </p>
      </header>
      <div className="app-container">
        <Sidebar 
          agentStatus={agentStatus} 
          feature_manifest={feature_manifest} 
          onVisualizationChange={setVisualization} 
        />
        <main className="main-content">
        {error && <div className="error">Error fetching data: {error}</div>}
        {agentStatus ? <DataCube visualization={visualization} /> : (
          <p>Loading agent status...</p>
        )}
      </main>
    </div></div>
  );
}

export default App;
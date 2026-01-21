import React from 'react';
import PortfolioSummary from './components/PortfolioSummary';
import PortfolioChart from './components/PortfolioChart';
import EngineControls from './components/EngineControls';
import AgentMemory from './components/AgentMemory';
import LiveLogStream from './components/LiveLogStream';
import './App.css';

function App() {
  return (
    <main className="cockpit-container">
      <header className="cockpit-header">
        <h1>Promethea Cockpit</h1>
      </header>
      <div className="dashboard-grid">
        <div className="grid-item-main">
          <PortfolioChart />
          <LiveLogStream />
        </div>
        <div className="grid-item-sidebar">
          <EngineControls />
          <PortfolioSummary />
          <AgentMemory />
        </div>
      </div>
    </main>
  );
}

export default App;
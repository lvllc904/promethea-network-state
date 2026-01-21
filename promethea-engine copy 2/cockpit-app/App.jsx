import React from 'react';
import PortfolioSummary from './components/PortfolioSummary';
import './App.css';

function App() {
  return (
    <main className="cockpit-container">
      <header className="cockpit-header">
        <h1>Promethea Cockpit</h1>
      </header>
      <PortfolioSummary />
    </main>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import './PortfolioSummary.css';

const PortfolioSummary = () => {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        // The proxy in vite.config.js forwards this to http://127.0.0.1:8000/api/portfolio/summary
        const response = await fetch('/api/portfolio/summary');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSummary(data);
        setError(null); // Clear any previous errors
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch portfolio summary:", e);
      }
    };

    fetchSummary(); // Fetch immediately on component mount
    const interval = setInterval(fetchSummary, 15000); // Refresh every 15 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  if (error) {
    return <div className="summary-panel error">Error fetching summary: {error}</div>;
  }

  if (!summary) {
    return <div className="summary-panel loading">Loading Portfolio Summary...</div>;
  }

  const pnlClass = summary.pnl_24h >= 0 ? 'positive' : 'negative';

  return (
    <div className="summary-panel">
      <h2>Portfolio Summary</h2>
      <div className="summary-item">
        <span className="label">Total Value</span>
        <span className="value">{formatCurrency(summary.total_value)}</span>
      </div>
      <div className="summary-item">
        <span className="label">24h P&L</span>
        <span className={`value ${pnlClass}`}>{formatCurrency(summary.pnl_24h)} ({summary.pnl_percent_24h.toFixed(2)}%)</span>
      </div>
    </div>
  );
};

export default PortfolioSummary;
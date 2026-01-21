import React from 'react';

const PortfolioSummary = ({ portfolio, assetId }) => {
  if (!portfolio) {
    return <div className="card">Loading portfolio...</div>;
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="card">
      <h2>Portfolio Summary ({assetId.toUpperCase()})</h2>
      <div className="card-content">
        <p><span>Cash:</span> <span>{formatCurrency(portfolio.cash)}</span></p>
        <p><span>Asset Quantity:</span> <span>{portfolio.asset_quantity.toFixed(4)}</span></p>
        <p><span>Current Price:</span> <span>{formatCurrency(portfolio.current_price)}</span></p>
        <p><span>Cost Basis:</span> <span>{formatCurrency(portfolio.cost_basis)}</span></p>
        <hr style={{ borderColor: '#333', margin: '1rem 0' }} />
        <p><span>Total Value:</span> <span>{formatCurrency(portfolio.cash + (portfolio.asset_quantity * portfolio.current_price))}</span></p>
      </div>
    </div>
  );
};

export default PortfolioSummary;
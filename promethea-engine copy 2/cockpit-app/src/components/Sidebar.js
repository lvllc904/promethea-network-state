import React from 'react';
import PortfolioSummary from './PortfolioSummary';
import StateVector from './StateVector';
import PsychologyVector from './PsychologyVector';
import ChaosVector from './ChaosVector';
import ReflexivityVector from './ReflexivityVector';

const Sidebar = ({ agentStatus, feature_manifest, onVisualizationChange }) => {
  if (!agentStatus) {
    return <div className="sidebar">Loading...</div>;
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <details open>
          <summary>Portfolio</summary>
          <PortfolioSummary portfolio={agentStatus.portfolio} assetId={agentStatus.asset_id} />
        </details>

        <details>
          <summary>Core Technicals</summary>
          <StateVector stateVector={agentStatus.state_vector} manifest={feature_manifest} />
        </details>

        <details>
          <summary>Psychology</summary>
          <PsychologyVector stateVector={agentStatus.state_vector} manifest={feature_manifest} />
        </details>

        <details>
          <summary>Chaos & Entanglement</summary>
          <ChaosVector stateVector={agentStatus.state_vector} manifest={feature_manifest} />
        </details>

        <details>
          <summary>Reflexivity</summary>
          <ReflexivityVector stateVector={agentStatus.state_vector} manifest={feature_manifest} />
        </details>

        <details open>
            <summary>Visualization Controls</summary>
            <div className="card">
                <button onClick={() => onVisualizationChange('price')}>Price</button>
                <button onClick={() => onVisualizationChange('volatility')}>Volatility</button>
            </div>
        </details>
      </div>
    </aside>
  );
};

export default Sidebar;
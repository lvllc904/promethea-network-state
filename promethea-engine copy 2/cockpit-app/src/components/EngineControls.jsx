import React, { useState, useEffect } from 'react';
import './EngineControls.css';

const EngineControls = () => {
  const [status, setStatus] = useState('loading'); // 'running', 'stopped', 'loading', 'error'
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/engine/status');
      if (!response.ok) throw new Error('Failed to fetch status');
      const data = await response.json();
      setStatus(data.is_running ? 'running' : 'stopped');
    } catch (error) {
      console.error("Error fetching engine status:", error);
      setStatus('error');
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Poll for status every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    setIsActionLoading(true);
    try {
      await fetch('/api/engine/start', { method: 'POST' });
      setStatus('running'); // Optimistically update status
    } catch (error) {
      console.error("Error starting engine:", error);
      setStatus('error');
    }
    setIsActionLoading(false);
  };

  const handleStop = async () => {
    setIsActionLoading(true);
    try {
      await fetch('/api/engine/stop', { method: 'POST' });
      setStatus('stopped'); // Optimistically update status
    } catch (error) {
      console.error("Error stopping engine:", error);
      setStatus('error');
    }
    setIsActionLoading(false);
  };

  const renderStatusIndicator = () => {
    return (
      <div className="status-indicator">
        <span className={`status-dot ${status}`}></span>
        <span className="status-text">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </div>
    );
  };

  return (
    <div className="controls-panel">
      <h2>Engine Controls</h2>
      <div className="controls-content">
        {renderStatusIndicator()}
        <div className="button-group">
          <button
            onClick={handleStart}
            disabled={status === 'running' || isActionLoading}
            className="control-button start-button"
          >
            Start Engine
          </button>
          <button
            onClick={handleStop}
            disabled={status === 'stopped' || isActionLoading}
            className="control-button stop-button"
          >
            Stop Engine
          </button>
        </div>
      </div>
    </div>
  );
};

export default EngineControls;
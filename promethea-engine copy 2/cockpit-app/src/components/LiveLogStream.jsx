import React, { useState, useEffect, useRef } from 'react';
import './LiveLogStream.css';

const MAX_LOGS = 200; // Keep the DOM from getting too large

const LiveLogStream = () => {
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const logContainerRef = useRef(null);

  useEffect(() => {
    // The browser's WebSocket API automatically uses `ws://` or `wss://`
    // based on the page's protocol.
    const ws = new WebSocket(`ws://${window.location.host}/ws/logs`);

    ws.onopen = () => {
      console.log('WebSocket connected for live logs.');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      setLogs(prevLogs => [event.data, ...prevLogs.slice(0, MAX_LOGS - 1)]);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected.');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    // Cleanup on component unmount
    return () => ws.close();
  }, []);

  useEffect(() => {
    // Auto-scroll to the top (most recent log)
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [logs]);

  return (
    <div className="log-panel">
      <h2>Live Engine Log <span className={`connection-status ${isConnected ? 'connected' : ''}`}>●</span></h2>
      <div className="log-container" ref={logContainerRef}>
        {logs.map((log, index) => (
          <div key={index} className="log-line">{log}</div>
        ))}
      </div>
    </div>
  );
};

export default LiveLogStream;
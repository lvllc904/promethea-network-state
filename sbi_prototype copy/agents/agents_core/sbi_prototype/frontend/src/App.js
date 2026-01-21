import React, { useState } from 'react';
import MetricsDisplay from './MetricsDisplay';
import './App.css';
const API_URL = 'https://sbi-prototype-service-591247370267.us-central1.run.app/simulation/run';
function App() {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleRunSimulation = () => {
        setLoading(true);
        setError(null);
        setMetrics(null);
        fetch(API_URL, { method: 'POST' })
            .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
            .then(data => {
            setMetrics(data.metrics);
            setLoading(false);
        })
            .catch(error => {
            setError('Failed to run simulation. Please check the console for details.');
            setLoading(false);
            console.error('There was a problem with the fetch operation:', error);
        });
    };
    return (<>
      <style>{`
        body {
          background-color: #f8f9fa;
        }
        .navbar {
          margin-bottom: 2rem;
        }
      `}</style>
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <span className="navbar-brand mb-0 h1">Synthetic Biological Intelligence</span>
        </div>
      </nav>

      <div className="container">
        <div className="p-5 mb-4 bg-light rounded-3">
          <div className="container-fluid py-5">
            <h1 className="display-5 fw-bold">Simulate the Future of AI</h1>
            <p className="col-md-8 fs-4">Click the button below to run a simulation of the SBI paradigm and see the validation metrics in real-time.</p>
            <button className="btn btn-primary btn-lg" onClick={handleRunSimulation} disabled={loading}>
              {loading ? 'Running Simulation...' : 'Run Simulation'}
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading && (<div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>)}

        {metrics && <MetricsDisplay metrics={metrics}/>}

      </div>

      <footer className="footer mt-auto py-3 bg-light">
        <div className="container">
          <span className="text-muted">SBI Prototype - Hackathon 2025</span>
        </div>
      </footer>
    </>);
}
export default App;

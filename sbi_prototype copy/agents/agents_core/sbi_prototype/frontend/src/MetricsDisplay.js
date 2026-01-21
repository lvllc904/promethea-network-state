import React from 'react';
const MetricsDisplay = ({ metrics }) => {
    return (<div className="row">
      <div className="col-md-4 mb-4">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Weight Variance (σ_W)</h5>
            <p className="card-text">{metrics.sigma_w.toExponential(4)}</p>
          </div>
        </div>
      </div>
      <div className="col-md-4 mb-4">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Energy / Update (E_ΔW)</h5>
            <p className="card-text">{metrics.energy_delta_w.toExponential(4)}</p>
          </div>
        </div>
      </div>
      <div className="col-md-4 mb-4">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Fitness Score (fs)</h5>
            <p className="card-text">{metrics.fs.toFixed(4)}</p>
          </div>
        </div>
      </div>
      <div className="col-md-4 mb-4">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Activity (ams)</h5>
            <p className="card-text">{metrics.ams.toFixed(4)}</p>
          </div>
        </div>
      </div>
      <div className="col-md-8 mb-4">
        <div className="card text-white bg-primary">
          <div className="card-body">
            <h5 className="card-title">MVS Metric</h5>
            <p className="card-text">{metrics.mvs_metric.toExponential(4)}</p>
          </div>
        </div>
      </div>
    </div>);
};
export default MetricsDisplay;

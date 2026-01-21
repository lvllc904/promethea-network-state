import React from 'react';
interface Metrics {
    sigma_w: number;
    energy_delta_w: number;
    fs: number;
    ams: number;
    mvs_metric: number;
}
interface Props {
    metrics: Metrics;
}
declare const MetricsDisplay: React.FC<Props>;
export default MetricsDisplay;

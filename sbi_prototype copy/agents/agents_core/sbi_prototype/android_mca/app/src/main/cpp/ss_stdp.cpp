#include "ss_stdp.h"
#include <cmath> // For std::exp

SsStdp::SsStdp(double initial_weight, double tau_et, double eta) {
    this->weight = initial_weight;
    this->tau_et = tau_et;
    this->eta = eta;
    this->eligibility_trace = 0.0;
    this->weight_update_count = 0; // Initialize count
}

void SsStdp::step(double dt, bool presynaptic_spike, bool postsynaptic_spike, double cgms_signal) {
    // Decay the eligibility trace: ET(t) = ET(t-1) * exp(-dt/tau_ET)
    this->eligibility_trace *= std::exp(-dt / this->tau_et);

    // Update eligibility trace if there is a pre-post spike pair: + delta(spike_pair)
    if (presynaptic_spike && postsynaptic_spike) {
        this->eligibility_trace += 1.0; // Simple delta update for spike pair
    }

    // Update the weight: ΔW = η * CGMS * ET * f(W)
    if (cgms_signal != 0 && this->eligibility_trace != 0) {
        double delta_W = this->eta * cgms_signal * this->eligibility_trace * this->f_weight();
        this->weight += delta_W;
        this->weight_update_count++; // Increment count
    }
}

double SsStdp::get_weight() {
    return this->weight;
}

long SsStdp::get_weight_update_count() {
    return this->weight_update_count;
}

double SsStdp::f_weight() {
    // Implement soft bounding function f(W) to keep weights in a range (e.g., [0, 1])
    // This is a simple placeholder.
    return (1.0 - this->weight);
}

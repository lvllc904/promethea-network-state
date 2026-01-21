#include "lif_neuron.h"

LifNeuron::LifNeuron(double v_rest, double tau_m, double initial_theta_base, double tau_theta, NeuronType type) {
    this->v_rest = v_rest;
    this->tau_m = tau_m;
    this->theta_base = initial_theta_base;
    this->tau_theta = tau_theta;
    this->type = type; // Set neuron type

    this->voltage = v_rest;
    this->theta = this->theta_base;
    this->spiked = false;
    this->spike_count = 0;

    // Initialize energy model
    this->internal_energy = 1.0;
    this->energy_replenishment_rate = 0.01;
    this->spike_energy_cost = 0.1;

    // Initialize Phase II model
    this->hibernating = false;
    this->fitness_score = 1.0; // Start with a healthy fitness
    this->activity_trace = 0.0;

    // Initialize ADH parameters
    this->long_term_activity = 0.0;
    this->target_firing_rate = 0.02; // Example: 2% of simulation steps
    this->activity_decay_rate = 0.001; // Example decay rate
    this->adp_strength = 0.1; // Example strength
}

void LifNeuron::step(double dt, double i_input, double cgms_signal) {
    if (this->hibernating) {
        return; // Do nothing if hibernating
    }

    // 1. Update long-term activity trace (decay)
    this->long_term_activity *= (1.0 - this->activity_decay_rate);

    // 2. Update internal energy state (slow homeostasis)
    this->internal_energy += this->energy_replenishment_rate * dt;
    if (this->internal_energy > 1.0) this->internal_energy = 1.0;

    // Calculate energy-influenced base firing threshold
    double initial_theta_center = -52.0;
    double energy_influenced_theta_base = initial_theta_center + (5.0 * (1.0 - this->internal_energy));

    // 3. Update membrane potential (LIF dynamics)
    double dV = (this->v_rest - this->voltage + i_input) / this->tau_m;
    this->voltage += dV * dt;

    // 4. Update activity trace (decays over time) - moved here to be before spike check
    this->activity_trace *= (1.0 - dt / this->tau_theta); // Using tau_theta for decay

    // 5. Check for spike
    if (this->voltage >= this->theta) {
        this->spiked = true;
        this->spike_count++;
        this->voltage = this->v_rest;
        this->internal_energy -= this->spike_energy_cost;
        if (this->internal_energy < 0.0) this->internal_energy = 0.0;
        this->theta += 0.5;
        
        // Increase activity trace on spike
        this->activity_trace += 1.0;
        // Increase long-term activity on spike
        this->long_term_activity += 1.0;

    } else {
        this->spiked = false;
    }

    // 6. Incorporate Activity-Dependent Homeostasis (ADH)
    double activity_deviation = this->long_term_activity - this->target_firing_rate;
    double adh_adjustment = this->adp_strength * activity_deviation;

    // Combine energy-influenced theta_base with ADH adjustment
    this->theta_base = energy_influenced_theta_base + adh_adjustment;

    // 7. Update adaptive threshold (fast adaptation) towards the new theta_base
    double dTheta = (this->theta_base - this->theta) / this->tau_theta;
    this->theta += dTheta * dt;

    // 8. Update Fitness Score (FS = Reward - Metabolic Cost)
    // Reward = correlation of activity with global signal
    double reward = this->activity_trace * cgms_signal;
    // Metabolic Cost = how much energy is being consumed (inversely proportional to internal energy)
    double metabolic_cost = (1.0 - this->internal_energy) * 0.01; // Scaled cost

    double current_fs_update = reward - metabolic_cost;
    // Update FS with a moving average
    this->fitness_score = (0.99 * this->fitness_score) + (0.01 * current_fs_update);

    // 9. Check for hibernation
    if (this->fitness_score < 0.1) { // Hibernation threshold
        this->hibernating = true;
    }
}

bool LifNeuron::has_spiked() const {
    return this->spiked;
}

void LifNeuron::reset_spike() {
    if (this->spiked) {
        this->voltage = this->v_rest;
        this->spiked = false;
    }
}

long LifNeuron::get_spike_count() const {
    return this->spike_count;
}

bool LifNeuron::is_hibernating() const {
    return this->hibernating;
}

double LifNeuron::get_fitness_score() const {
    return this->fitness_score;
}

NeuronType LifNeuron::get_type() const {
    return this->type;
}
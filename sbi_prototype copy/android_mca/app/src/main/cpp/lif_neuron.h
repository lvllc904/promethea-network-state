#ifndef MCA_KERNEL_LIF_NEURON_H
#define MCA_KERNEL_LIF_NEURON_H

enum NeuronType {
    INPUT,
    HIDDEN,
    OUTPUT
};

class LifNeuron {
public:
    // This comment is added to force recompilation and refresh the build system's view of this header.
    LifNeuron(double v_rest, double tau_m, double initial_theta_base, double tau_theta, NeuronType type);
    // Step method now takes cgms_signal to calculate fitness
    void step(double dt, double i_input, double cgms_signal);
    bool has_spiked() const;
    void reset_spike();
    long get_spike_count() const;
    bool is_hibernating() const;
    double get_fitness_score() const;
    NeuronType get_type() const;

private:
    // Membrane dynamics
    double v_rest;
    double tau_m;
    double voltage;

    // Adaptive threshold (driven by internal energy)
    double theta_base;
    double tau_theta;
    double theta;

    // Spike state
    bool spiked;
    long spike_count;

    // Homeostatic energy model
    double internal_energy;
    double energy_replenishment_rate;
    double spike_energy_cost;

    // Phase II: Microglial Fitness Score & Hibernation
    bool hibernating;
    double fitness_score;
    double activity_trace; // Neuron's own eligibility trace for reward calculation

    // Phase II: Specialization
    NeuronType type;

    // ADH (Activity-Dependent Homeostasis)
    double long_term_activity;
    double target_firing_rate; // Desired average firing rate
    double activity_decay_rate; // How fast long_term_activity decays
    double adp_strength; // Strength of ADH adaptation
};

#endif //MCA_KERNEL_LIF_NEURON_H

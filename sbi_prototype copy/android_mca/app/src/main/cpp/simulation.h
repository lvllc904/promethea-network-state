#ifndef MCA_KERNEL_SIMULATION_H
#define MCA_KERNEL_SIMULATION_H

#include "lif_neuron.h"
#include "ss_stdp.h"
#include <vector>
#include <string>

class Simulation {
public:
    Simulation();
    void initialize(int num_neurons);
    void step(double dt, double cgms_signal);
    std::string get_metrics_json();
    void set_external_input(const std::vector<double>& pattern); // New method
    std::string get_detailed_synapse_metrics_json(int synapse_index);

private:
    // Simulation state
    int num_neurons;
    std::vector<LifNeuron> neurons; // The full population of all neurons
    std::vector<int> active_neuron_indices; // Indices of currently active neurons

    std::vector<SsStdp> synapses;
    bool initialized;
    std::vector<double> external_input_pattern; // New member
};

#endif //MCA_KERNEL_SIMULATION_H

#include "simulation.h"
#include <cmath>
#include <cstdio>
#include <vector>
#include <algorithm> // For std::remove_if

Simulation::Simulation() {
    this->initialized = false;
    this->num_neurons = 0;
}

void Simulation::initialize(int num_neurons) {
    this->num_neurons = num_neurons;

    // Neuron parameters
    double v_rest = -65.0;
    double tau_m = 10.0;
    double theta_base = -52.0;
    double tau_theta = 100.0;

    // Synapse parameters
    double initial_weight = 0.5;
    double tau_et = 5.0;
    double eta = 0.01;

    this->neurons.clear();
    this->active_neuron_indices.clear();
    for (int i = 0; i < num_neurons; ++i) {
        NeuronType type;
        if (i < 10) { // First 10 neurons are INPUT
            type = INPUT;
        } else if (i == num_neurons - 1) { // The last neuron is OUTPUT
            type = OUTPUT;
        } else {
            type = HIDDEN;
        }
        this->neurons.emplace_back(v_rest, tau_m, theta_base, tau_theta, type);
        this->active_neuron_indices.push_back(i); // All neurons start as active
    }

    this->synapses.clear();
    int num_synapses = num_neurons * num_neurons;
    for (int i = 0; i < num_synapses; ++i) {
        this->synapses.emplace_back(initial_weight, tau_et, eta);
    }

    this->initialized = true;
}

void Simulation::set_external_input(const std::vector<double>& pattern) {
    this->external_input_pattern = pattern;
}

void Simulation::step(double dt, double cgms_signal) {
    if (!this->initialized) return;

    // 1. Update only active neurons, applying external input
    for (int idx : this->active_neuron_indices) {
        double input_current = 15.0; // Base background stimulus

        // Add external pattern stimulus for INPUT neurons
        if (this->neurons[idx].get_type() == INPUT) {
            if (idx < this->external_input_pattern.size()) {
                // Add a strong stimulus if the pattern value is high
                input_current += this->external_input_pattern[idx] * 20.0;
            }
        }

        this->neurons[idx].step(dt, input_current, cgms_signal);
    }

    // Clear the pattern after it has been applied for one step
    this->external_input_pattern.clear();

    // 2. Update synapses connected to active neurons
    for (int pre_idx : this->active_neuron_indices) {
        for (int post_idx : this->active_neuron_indices) {
            if (pre_idx == post_idx) continue;
            int synapse_index = pre_idx * this->num_neurons + post_idx;
            this->synapses[synapse_index].step(dt, this->neurons[pre_idx].has_spiked(), this->neurons[post_idx].has_spiked(), cgms_signal);
        }
    }

    // 3. Prune hibernating neurons from the active list after the step
    this->active_neuron_indices.erase(
        std::remove_if(this->active_neuron_indices.begin(), this->active_neuron_indices.end(),
                       [this](int neuron_idx) {
                           return this->neurons[neuron_idx].is_hibernating();
                       }),
        this->active_neuron_indices.end());
}

std::string Simulation::get_metrics_json() {
    if (!this->initialized) return "{}";

    std::string spiked_list_str;
    bool first_spike = true;
    for (int idx : this->active_neuron_indices) {
        if (this->neurons[idx].has_spiked()) {
            if (!first_spike) {
                spiked_list_str += ", ";
            }
            spiked_list_str += std::to_string(idx);
            first_spike = false;
        }
    }

    // Metrics are calculated across the entire population (active and hibernating)
    double sum_fitness = 0.0;
    long total_spike_count = 0;
    for (const auto& neuron : this->neurons) {
        sum_fitness += neuron.get_fitness_score();
        total_spike_count += neuron.get_spike_count();
    }
    double avg_fitness = (this->num_neurons > 0) ? sum_fitness / this->num_neurons : 0.0;
    int hibernating_count = this->num_neurons - this->active_neuron_indices.size();

    long total_weight_updates = 0;
    double sum_weights = 0.0;
    double sum_weights_sq = 0.0;
    for (const auto& synapse : this->synapses) {
        total_weight_updates += synapse.get_weight_update_count();
        double w = synapse.get_weight();
        sum_weights += w;
        sum_weights_sq += w * w;
    }

    int num_synapses = this->synapses.size();
    double mean_weight = (num_synapses > 0) ? sum_weights / num_synapses : 0.0;
    double variance = (num_synapses > 0) ? (sum_weights_sq / num_synapses) - (mean_weight * mean_weight) : 0.0;
    double sigma_w = std::sqrt(variance);
    long e_delta_w_proxy = total_weight_updates;

    std::string hibernating_list_str;
    bool first_hibernating = true;
    for(int i = 0; i < this->num_neurons; ++i) {
        if(this->neurons[i].is_hibernating()) {
            if(!first_hibernating) { hibernating_list_str += ", "; }
            hibernating_list_str += std::to_string(i);
            first_hibernating = false;
        }
    }

    // Build the JSON string
    std::string json = "{";
    json += "\"e_delta_w_proxy\": " + std::to_string(e_delta_w_proxy) + ", ";
    json += "\"sigma_w\": " + std::to_string(sigma_w) + ", ";
    json += "\"total_spikes\": " + std::to_string(total_spike_count) + ", ";
    json += "\"avg_fitness\": " + std::to_string(avg_fitness) + ", ";
    json += "\"hibernating_count\": " + std::to_string(hibernating_count) + ", ";
    json += "\"spiked_neurons\": [" + spiked_list_str + "], ";
    json += "\"hibernating_neurons\": [" + hibernating_list_str + "]";
    json += "}";

    return json;
}

std::string Simulation::get_detailed_synapse_metrics_json(int synapse_index) {
    if (!this->initialized) return "{}";
    if (synapse_index < 0 || synapse_index >= this->synapses.size()) {
        return "{\"error\": \"Invalid synapse index\"}";
    }

    const Synapse& synapse = this->synapses[synapse_index];
    double weight = synapse.get_weight();
    double eligibility_trace = synapse.get_eligibility_trace();
    long weight_update_count = synapse.get_weight_update_count();

    std::string json = "{";
    json += "\"weight\": " + std::to_string(weight) + ", ";
    json += "\"eligibility_trace\": " + std::to_string(eligibility_trace) + ", ";
    json += "\"weight_update_count\": " + std::to_string(weight_update_count);
    json += "}";

    return json;
}

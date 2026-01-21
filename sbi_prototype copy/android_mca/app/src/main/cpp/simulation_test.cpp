#include "simulation.h"
#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <chrono>
#include <thread>

// Function to run a simulation and log metrics
void run_simulation_and_log(const std::string& filename, int num_neurons, double dt, int num_steps, double cgms_signal) {
    std::ofstream outfile(filename);
    if (!outfile.is_open()) {
        std::cerr << "Error opening file: " << filename << std::endl;
        return;
    }

    Simulation sim;
    sim.initialize(num_neurons);

    // Write CSV header
    outfile << "step,e_delta_w_proxy,sigma_w,total_spikes,avg_fitness,hibernating_count\n";

    for (int i = 0; i < num_steps; ++i) {
        sim.step(dt, cgms_signal);
        std::string metrics_json = sim.get_metrics_json();

        // Parse JSON to extract relevant metrics for CSV
        // This is a simplified parsing for demonstration. A proper JSON library would be better.
        size_t pos = metrics_json.find("\"e_delta_w_proxy\": ");
        long e_delta_w_proxy = 0;
        if (pos != std::string::npos) {
            e_delta_w_proxy = std::stol(metrics_json.substr(pos + 19));
        }

        pos = metrics_json.find("\"sigma_w\": ");
        double sigma_w = 0.0;
        if (pos != std::string::npos) {
            sigma_w = std::stod(metrics_json.substr(pos + 11));
        }

        pos = metrics_json.find("\"total_spikes\": ");
        long total_spikes = 0;
        if (pos != std::string::npos) {
            total_spikes = std::stol(metrics_json.substr(pos + 16));
        }

        pos = metrics_json.find("\"avg_fitness\": ");
        double avg_fitness = 0.0;
        if (pos != std::string::npos) {
            avg_fitness = std::stod(metrics_json.substr(pos + 15));
        }

        pos = metrics_json.find("\"hibernating_count\": ");
        int hibernating_count = 0;
        if (pos != std::string::npos) {
            hibernating_count = std::stoi(metrics_json.substr(pos + 21));
        }

        outfile << i << ","
                  << e_delta_w_proxy << ","
                  << sigma_w << ","
                  << total_spikes << ","
                  << avg_fitness << ","
                  << hibernating_count << "\n";
    }

    outfile.close();
}

int main() {
    std::cout << "Running simulation tests..." << std::endl;

    // Test for I.2 ADH Stability Proof
    // Run a long simulation and log sigma_w to a CSV file
    run_simulation_and_log("adh_stability_test.csv", 100, 0.1, 10000, 0.5);
    std::cout << "ADH stability test completed. Results in adh_stability_test.csv" << std::endl;

    // Test for I.3 Temporal Credit Proof
    // This test would be more complex, requiring specific spike patterns and delayed CGMS signals.
    // For now, we'll just run a basic simulation.
    // A more sophisticated test would involve:
    // 1. Setting up a small network with known connections.
    // 2. Inducing specific pre- and post-synaptic spikes.
    // 3. Applying CGMS signals at different delays.
    // 4. Observing eligibility trace and weight changes.
    run_simulation_and_log("temporal_credit_test.csv", 10, 0.1, 1000, 0.1);
    std::cout << "Temporal credit test (basic) completed. Results in temporal_credit_test.csv" << std::endl;

    return 0;
}

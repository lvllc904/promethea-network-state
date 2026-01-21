
import numpy as np
from typing import Dict, Any, List

# --- Phase I & II: Integrated Simulation ---
from gcs_core import Astrocyte, Microglia, Oligodendrocyte

# --- I.1 MCA Kernel Build: LIF Neuron Model & SS-STDP Equations ---

# Neuron parameters
V_REST = -70.0
V_THRESH = -55.0
V_RESET = -75.0
TAU_M = 20.0
R_M = 10.0
I_EXT = 2.0

# STDP parameters
A_PLUS = 0.1
A_MINUS = 0.12
TAU_PLUS = 20.0
TAU_MINUS = 20.0

class LIFNeuron:
    """Simulates a single Leaky Integrate-and-Fire (LIF) neuron."""
    def __init__(self):
        self.v = V_REST
        self.last_spike_time = -1
        self.activity = 0

    def update(self, dt, i_syn):
        """Update neuron state for a single time step."""
        dv = (-(self.v - V_REST) + R_M * (i_syn + I_EXT)) / TAU_M
        self.v += dv * dt
        
        spike = self.v >= V_THRESH
        if spike:
            self.v = V_RESET
            self.last_spike_time = 0
            self.activity += 1
        
        if self.last_spike_time >= 0:
            self.last_spike_time += dt

        return spike

def apply_stdp(w, delta_t):
    """Applies the STDP learning rule to a single weight."""
    if delta_t > 0:
        delta_w = A_PLUS * np.exp(-delta_t / TAU_PLUS)
    else:
        delta_w = -A_MINUS * np.exp(delta_t / TAU_MINUS)
    return w + delta_w

# --- I.2 ADH Stability Proof: Activity-Dependent Homeostasis ---

def apply_adh(weights, avg_activity, target_activity=0.1, learning_rate=0.01):
    """Simulates Activity-Dependent Homeostasis."""
    scale_factor = 1 - learning_rate * (avg_activity - target_activity)
    return np.clip(weights * scale_factor, 0, 1)

# --- Main Simulation Function ---

def run_sbi_simulation(duration=1000, dt=1.0) -> Dict[str, Any]:
    """
    Runs an integrated simulation including Phase I (Temporal Efficiency)
    and Phase II (Structural Dynamism) logic.
    """
    # --- Initial Population ---
    num_neurons = 10
    neurons = [LIFNeuron() for _ in range(num_neurons)]
    weights = np.random.rand(num_neurons, num_neurons) * 0.5
    np.fill_diagonal(weights, 0)
    initial_weights = np.copy(weights)

    # --- GCS Agent Initialization ---
    astrocyte = Astrocyte(target_ams=10.0)
    microglia = Microglia(failure_threshold=0.01)
    oligodendrocyte = Oligodendrocyte() # For Phase III

    # --- Simulation Variables ---
    spike_times = {i: [] for i in range(num_neurons)}
    total_spikes = 0
    hibernated_log = []
    population_log = []
    
    # --- Simulation Loop (with GCS intervention) ---
    epoch_length = 200 # ms, GCS agents act between epochs
    for t in range(int(duration / dt)):
        
        # --- GCS Intervention Epoch ---
        if t > 0 and t % epoch_length == 0:
            # --- II.3 Microglia: Conservation Proof ---
            neuron_activities = [n.activity / epoch_length for n in neurons]
            failing_indices = microglia.hibernate_failing_neurons(weights, neuron_activities)
            
            if failing_indices:
                hibernated_log.extend(failing_indices)
                # Remove failing neurons and their connections
                neurons = [n for i, n in enumerate(neurons) if i not in failing_indices]
                weights = np.delete(np.delete(weights, failing_indices, axis=0), failing_indices, axis=1)
                num_neurons = len(neurons)
                # Reset activity counters
                for n in neurons: n.activity = 0

            # --- II.2 Astrocyte: DHB Homeostasis Proof ---
            current_ams = total_spikes / (num_neurons * (t / 1000.0)) if num_neurons > 0 else 0
            new_num_neurons = astrocyte.manage_population(current_ams, num_neurons)
            
            # Adjust population
            delta_n = new_num_neurons - num_neurons
            if delta_n > 0: # Neurogenesis
                for _ in range(delta_n):
                    neurons.append(LIFNeuron())
                    # Add new rows/columns to weights matrix
                    weights = np.pad(weights, ((0, 1), (0, 1)), 'constant', constant_values=np.random.rand() * 0.1)
                num_neurons = new_num_neurons
            
            population_log.append(num_neurons)


        if num_neurons == 0:
            print("Extinction event: All neurons hibernated.")
            break

        # --- Core Neuron Update Loop ---
        for i in range(num_neurons):
            i_syn = weights[:, i].sum()
            
            if neurons[i].update(dt, i_syn):
                if i not in spike_times: spike_times[i] = []
                spike_times[i].append(t * dt)
                total_spikes += 1
                
                # Apply STDP
                for j in range(num_neurons):
                    if i == j: continue
                    if j < len(neurons) and neurons[j].last_spike_time > 0:
                        delta_t = neurons[i].last_spike_time - neurons[j].last_spike_time
                        weights[j, i] = apply_stdp(weights[j, i], delta_t)

    # --- Final Metrics Calculation ---
    if num_neurons == 0:
        return {"message": "Simulation ended in extinction.", "metrics": {}}

    # --- I.2 Validation: σ_W ---
    sigma_w = np.var(weights)

    # --- I.1 Validation: E_ΔW ---
    # Note: Comparing weights of different sizes is complex. This is a simplification.
    final_size = weights.shape[0]
    energy_delta_w = np.mean(np.abs(weights - initial_weights[:final_size, :final_size])) / duration

    # --- ADH Application ---
    avg_activity = total_spikes / (num_neurons * duration / 1000.0)
    final_weights = apply_adh(weights, avg_activity)
    
    # --- Phase IV.1 (Simulated): MVS Metric ---
    mnp = total_spikes * (1 / energy_delta_w if energy_delta_w > 0 else 1)
    avg_chi_stable = np.mean(final_weights) * 10
    mvs_metric = mnp * avg_chi_stable

    return {
        "metrics": {
            # Phase I
            "sigma_w": sigma_w,
            "energy_delta_w": energy_delta_w,
            "fs": np.mean(final_weights),
            "ams": avg_activity,
            # Phase II
            "hibernated_neuron_count": len(set(hibernated_log)),
            "final_population": num_neurons,
            "population_history": population_log,
            # Phase IV
            "mvs_metric": mvs_metric
        },
        "message": "SBI integrated simulation (Phase I & II) complete."
    }

if __name__ == '__main__':
    results = run_sbi_simulation()
    print(results)

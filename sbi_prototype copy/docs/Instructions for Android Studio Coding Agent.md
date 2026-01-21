Instructions for Android Studio Coding Agent


Section 1 
Project Context
You are implementing Milestone I.1: MCA Kernel Build for the SBI (Synthetic Biological Intelligence) prototype. This is the foundational Phase I work that validates the energy-efficient Photonic SNN architecture.



Primary Objective
Build the C++/NDK implementation of the LIF Neuron Model and SS-STDP learning equations with JNI bridge to Android/Kotlin.

Success Metric: Calculate initial E_ΔW (energy per weight update) targeting 100× efficiency improvement over classical approaches.



Task Breakdown

T1.1: Project Setup & NDK Bridge
Priority: CRITICAL - Must complete first

Actions Required:
1. Create Android Studio Project
   ◦  Target: Android API 26+ (Android 8.0+)
   ◦  Language: Kotlin
   ◦  Enable C++ support (CMake/NDK)
   ◦  Package name suggestion: com.sbi.prototype.mca
2. Configure NDK/CMake
   ◦  Set up CMakeLists.txt for C++ compilation
   ◦  Configure build variants for debug/release
   ◦  Enable C++17 or later
3. Define JNI Bridge Interface
   ◦  Create native methods for:
   ▪  initializeMCA() - Initialize neuron state
   ▪  stepSimulation(double dt) - Advance simulation by timestep
   ▪  getMetrics() - Return E_ΔW, σ_W, firing rate
   ▪  applyInput(double[] spikeTimings) - Inject spike train
   ▪  updateWeights(double cgmsSignal) - Trigger SS-STDP
4. Project Structure


T1.2: MCA Core & LIF Model
Dependency: Complete after T1.1

Implementation Requirements:

LIF Neuron Model (lif_neuron.cpp):
cpp
Key Equations to Implement:
•  Membrane dynamics: dV/dt = (V_rest - V + I_input) / tau_m
•  Adaptive threshold: dθ/dt = (theta_base - theta) / tau_theta
•  Spike condition: V ≥ theta
•  Energy calculation: E_spike = k_photonic * (spike_events)



T1.3: SS-STDP Kernel
Dependency: Complete after T1.2

Implementation Requirements:

SS-STDP Module (ss_stdp.cpp):
cpp
Key Equations:
•  Eligibility trace: ET(t) = ET(t-1) * exp(-dt/tau_ET) + delta(spike_pair)
•  Weight update: ΔW = η * CGMS * ET * f(W) where f(W) provides soft bounds
•  Energy: E_ΔW = k_photonic * (num_weight_updates) / efficiency_factor



T1.4: ADH / Stability Module
Dependency: Complete after T1.3

Implement Activity-Dependent Homeostasis:
•  Monitor firing rate R_actual
•  Adjust theta_base to maintain target rate
•  Calculate weight distribution variance σ_W
•  Expose metrics via JNI



T1.5: Energy Budget Calculator
Dependency: Complete after T1.4

Create comprehensive energy accounting:
•  Track E_spike cumulative
•  Track E_ΔW cumulative
•  Calculate Fitness Score: FS = f(efficiency, activity)
•  Validate 100× efficiency target



Critical Implementation Notes

1. Asynchronous Design
   ◦  C++ code must be non-blocking
   ◦  Use event-driven spike processing
   ◦  Minimize memory allocations during simulation
2. Photonic Constraints
   ◦  Model energy costs realistically
   ◦  Assume spike energy: ~fJ (femtojoules)
   ◦  Weight update energy should be ~100× more expensive in classical systems
3. Numerical Precision
   ◦  Use double for all calculations
   ◦  Implement stable exponential decay for ET
   ◦  Handle edge cases (W bounds, numerical overflow)
4. Testing Strategy
   ◦  Unit tests for each component
   ◦  Integration test for full spike → update cycle
   ◦  Validate E_ΔW against theoretical predictions



Validation Checklist

Before marking I.1 complete, verify:
•  ✅ JNI bridge functions correctly
•  ✅ LIF neuron produces realistic spike trains
•  ✅ SS-STDP modifies weights in response to CGMS
•  ✅ Energy calculations return meaningful values
•  ✅ E_ΔW demonstrates path toward 100× efficiency
•  ✅ Code compiles without warnings
•  ✅ Basic UI displays neuron state and metrics



Next Steps After Completion

Once I.1 passes validation:
1. Proceed to I.2 ADH Stability Proof
2. Begin parallel Track 2 (Docker/Python services)
3. Document any deviations from theoretical model



Questions to Clarify

Before starting, confirm:
•  Timestep size: Suggested dt = 0.1ms for spike dynamics
•  Network size: Start with N=100 neurons for testing
•  CGMS source: Use random ±1 signal until T2.3 provides mock service

Begin with T1.1 and report progress after project skeleton is established.
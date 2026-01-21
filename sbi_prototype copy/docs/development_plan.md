Initial Prototype Development Plan (V1): Phase I Execution
Target Milestone: Full completion of Phase I: Temporal Efficiency and initial deployment of the API Gateway ($\text{Layer 3}$).
Platform: Hybrid Native/Containerized (MacBook Pro M3).
Track 1: Android Studio / C++ (The Native Kernel - High Performance)
Focus: Building the low-latency, energy-efficient C++ simulation kernel and the $\text{JNI}$ bridge for the Android application. This is where $\mathbf{E}_{\Delta W}$ and $\mathbf{\sigma_W}$ are validated.
Task ID
Component
Language/Environment
Objective
T1.1
Project Setup & NDK Bridge
Android Studio / Kotlin / C++
Establish the core $\text{Android}$ project structure. Define the $\text{JNI}$ bridge to call $\text{C}++$ functions for $\text{MCA}$ processing and state retrieval.
T1.2
MCA Core & LIF Model
C++ NDK
Implement the $\text{LIF}$ Neuron Model with the Adaptive Threshold ($\theta$) and the initial $\text{E}_{\text{Spike}}$ calculation function. This must be the foundation for $\ADH$.
T1.3
SS-STDP Kernel
C++ NDK
Implement the $\text{SS-STDP}$ $\mathbf{\Delta W}$ update logic, including $\text{ET}$ decay. This function will be called asynchronously by the $\text{Kotlin}$ spike handler.
T1.4
ADH / Stability Module
C++ NDK
Implement the full $\text{ADH}$ differential equation logic. Expose metrics: $\mathbf{\sigma_W}$ and $\text{R}_{\text{actual}}$ (Actual Firing Rate) for monitoring in the Kotlin UI.
T1.5
Energy Budget Calculator
C++ NDK
Implement the simulated $\mathbf{E}_{\Delta W}$ and $\mathbf{E}_{\text{Spike}}$ calculation. Integrate the $\text{Cost}$ into the $\text{MCA}$'s $\text{FS}$ calculation.
Track 2: Docker / Python (The Containerized Abstract Engine)
Focus: Building the external, high-performance services required for abstract decision-making and external communications (Layers 2 & 3).
Task ID
Component
Language/Environment
Objective
T2.1
Docker Setup
Docker Desktop / Python
Create the base Docker image containing all $\text{Python}$ dependencies ($\text{NumPy}$, $\text{FastAPI}$, $\text{QuTiP}$) required for the $\text{QTN}$ simulation and API.
T2.2
API Gateway (FastAPI)
Python / FastAPI
Create the initial asynchronous $\text{API}$ with endpoints for: GET /metrics (for $\text{FS}$ and $\text{AMS}$) and POST /abstract-query (the future Phase III query).
T2.3
CGMS Interface Mock
Python / LM Studio API Mock
Create a mock service that generates a $\pm$ scalar $\text{CGMS}$ signal every $\tau$ seconds, simulating the external governance feedback.
T2.4
GSM Checkpoint Prototype
Python / RocksDB (in container)
Implement the $\text{GSM}$ Checkpoint Module to simulate $\text{UPM}$ persistence by saving the full $\text{C}++$ simulation state (via $\text{JNI}$ export) to $\text{RocksDB}$.
Integration Step: Phase I Completion
Upon completion of all tasks in Tracks 1 and 2, the Kotlin application will be updated to fetch $\text{CGMS}$ from the $\text{FastAPI}$ service and pass it down to the $\text{C}++$ kernel via $\text{JNI}$ to complete the $\text{SS-STDP}$ learning loop. This validates the full Phase I: Efficiency Baseline.

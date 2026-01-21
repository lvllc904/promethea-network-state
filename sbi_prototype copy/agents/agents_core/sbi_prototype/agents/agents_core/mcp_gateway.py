from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import math
import time

# --- Agent Import ---
from main_agent import execute_sbi_simulation

# --- 1. FastAPI Application Setup ---
app = FastAPI(
    title="SBI Simulation Hub",
    description="API for running the SBI simulation and retrieving validation metrics.",
    version="2.0.0"
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. Pydantic Models for API Data ---
class StatusResponse(BaseModel):
    status: str
    message: str

class PatternResponse(BaseModel):
    pattern: list[float]
    expected_output_neuron: int

class CgmsRequest(BaseModel):
    output_neuron_spiked: bool

class CgmsResponse(BaseModel):
    cgms_signal: float

# --- 3. API Endpoints ---

@app.get("/pattern", response_model=PatternResponse)
async def get_pattern():
    """Generates a simple pattern recognition task."""
    # A simple alternating pattern for the first 10 input neurons
    pattern = [1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0]
    return PatternResponse(pattern=pattern, expected_output_neuron=99)

@app.post("/cgms", response_model=CgmsResponse)
async def get_cgms_signal(request: CgmsRequest):
    """
    Provides a reward signal based on task performance.
    """
    if request.output_neuron_spiked:
        cgms_signal = 1.0  # Positive reward for correct action
        print("Reward: +1.0 (Correct Output)")
    else:
        cgms_signal = -0.1  # Small punishment for incorrect action
        print("Reward: -0.1 (Incorrect Output)")

    return CgmsResponse(cgms_signal=cgms_signal)


@app.get("/", response_model=StatusResponse)
async def health_check():
    """Simple health check for the simulation hub."""
    return StatusResponse(status="active", message="SBI Simulation Hub is running on FastAPI.")

# Note: The /metrics and /simulation/run endpoints are from a previous iteration
# and are not used by the current Android app, but are kept for potential future use.
class MetricsResponse(BaseModel):
    sigma_w: float
    energy_delta_w: float
    fs: float
    ams: float
    mvs_metric: float

class SimulationResponse(BaseModel):
    metrics: MetricsResponse
    message: str

@app.get("/metrics", response_model=MetricsResponse)
async def get_sbi_metrics():
    simulation_results = execute_sbi_simulation()
    return simulation_results["metrics"]

@app.post("/simulation/run", response_model=SimulationResponse)
async def run_simulation_endpoint():
    simulation_results = execute_sbi_simulation()
    return simulation_results
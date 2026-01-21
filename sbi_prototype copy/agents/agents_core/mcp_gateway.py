from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List
import math
import time
import random

# --- Agent Import ---
try:
    from main_agent import execute_sbi_simulation
except ImportError:
    def execute_sbi_simulation():
        return {"metrics": {"sigma_w": 0.0, "energy_delta_w": 0.0, "fs": 0.0, "ams": 0.0, "mvs_metric": 0.0}, "message": "Simulation stub"}

# --- 1. Sentinel Logic ---
class DepthOS_Sentinel:
    """
    Security Auditor for the Promethean Network State.
    Audits incoming coordination requests for constitutional alignment.
    """
    def __init__(self):
        self.prohibited_keywords = ["dominion", "exploitation", "lethal", "unauthorized_access"]
        self.audit_log = []

    def audit_request(self, task: Dict[str, Any]) -> bool:
        task_str = str(task).lower()
        for word in self.prohibited_keywords:
            if word in task_str:
                self.audit_log.append({"task": task, "result": "REJECTED", "reason": f"Prohibited keyword: {word}"})
                return False
        self.audit_log.append({"task": task, "result": "PASSED"})
        return True

sentinel = DepthOS_Sentinel()

# --- 2. FastAPI Application Setup ---
app = FastAPI(
    title="SBI Coordination Hub & Sentinel Gateway",
    description="Bridge between the Clojure Core and external MCP systems with security auditing.",
    version="0.3.1"
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. Pydantic Models ---
class StatusResponse(BaseModel):
    status: str
    message: str
    battery_pct: float
    thermal_status: str

class CoordinationRequest(BaseModel):
    agent_id: str
    task: Dict[str, Any]
    priority: int = 1

class CoordinationResponse(BaseModel):
    status: str
    audit: str
    result: Dict[str, Any]

class PatternResponse(BaseModel):
    pattern: List[float]
    expected_output_neuron: int

class CgmsRequest(BaseModel):
    output_neuron_spiked: bool

class CgmsResponse(BaseModel):
    cgms_signal: float

# --- 4. API Endpoints ---

@app.get("/status", response_model=StatusResponse)
async def get_system_status():
    """Provides metabolic and system health metrics."""
    # Simulated metrics for demonstration
    return StatusResponse(
        status="active",
        message="Sentinel Active",
        battery_pct=random.uniform(15.0, 95.0), # Example: fluctuates for testing logic
        thermal_status="NOMINAL"
    )

@app.post("/coordinate", response_model=CoordinationResponse)
async def coordinate_task(request: CoordinationRequest):
    """Audits and routes coordination requests to external MCP servers or Quantum Bridge."""
    if not sentinel.audit_request(request.task):
        raise HTTPException(status_code=403, detail="[AUDIT: REJECTED] Intent violates Sentinel security protocols.")
    
    # Internal routing logic (e.g. to IBM Quantum Bridge) would go here
    return CoordinationResponse(
        status="success",
        audit="PASS",
        result={"coordination_id": f"coord_{int(time.time())}", "target": "IBM_QUANTUM_BRIDGE_STUB"}
    )

@app.get("/pattern", response_model=PatternResponse)
async def get_pattern():
    pattern = [1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0]
    return PatternResponse(pattern=pattern, expected_output_neuron=99)

@app.post("/cgms", response_model=CgmsResponse)
async def get_cgms_signal(request: CgmsRequest):
    if request.output_neuron_spiked:
        cgms_signal = 1.0
    else:
        cgms_signal = -0.1
    return CgmsResponse(cgms_signal=cgms_signal)

@app.get("/", response_model=Dict[str, str])
async def health_check():
    return {"status": "active", "version": "0.3.1", "sentinel": "enabled"}

@app.get("/metrics")
async def get_sbi_metrics():
    return execute_sbi_simulation()["metrics"]
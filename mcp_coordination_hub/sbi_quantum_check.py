import os
from qiskit import QuantumCircuit
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler
from dotenv import load_dotenv

# Load credentials from .env
load_dotenv()

def execute_sbi_entanglement_check():
    """
    SBI Functional Verification: Phase 1
    Goal: Create a Bell State (|ψ+⟩ = 1/√2(|00⟩ + |11⟩)) to verify the 
    Sentinel-to-IBM secure bridge and QTN grounding.
    """
    
    token = os.getenv("QISKIT_IBM_TOKEN")
    if not token:
        print("[ERROR] No IBM Token found. Please check your .env file.")
        return

    try:
        # 1. Initialize IBM Quantum Service
        service = QiskitRuntimeService(channel="ibm_quantum", token=token)
        
        # 2. Select the optimal available backend (preferring Heron or Eagle)
        # We filter for operational systems with at least 127 qubits to match SBI's target scale.
        backend = service.least_busy(min_qubits=127, simulator=False, operational=True)
        print(f"[SENTINEL] Target Hardware identified: {backend.name}")

        # 3. Construct the Entanglement Circuit
        # This is the 'Cognitive Handshake'
        qc = QuantumCircuit(2)
        qc.h(0)           # Superposition of Qubit 0
        qc.cx(0, 1)       # Entangle Qubit 1 with Qubit 0
        qc.measure_all()  # Collapse the state for measurement

        # 4. Execute via Sampler (Standard for verification)
        sampler = Sampler(mode=backend)
        print(f"[SENTINEL] Submitting Circuit to {backend.name} for Audit...")
        
        # Note: The Sentinel in mcp_gateway.py will intercept this if logic isn't aligned.
        job = sampler.run([qc])
        
        print(f"[SUCCESS] SBI Cognitive Handshake Job ID: {job.job_id()}")
        print(f"[INFO] Status: {job.status()}")
        
        return job.job_id()

    except Exception as e:
        print(f"[FAILURE] Quantum Bridge Error: {str(e)}")
        return None

if __name__ == "__main__":
    execute_sbi_entanglement_check()

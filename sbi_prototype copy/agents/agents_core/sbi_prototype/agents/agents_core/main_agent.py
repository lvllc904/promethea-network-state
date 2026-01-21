
from sbi_simulation import run_sbi_simulation
from typing import Dict, Any

def execute_sbi_simulation() -> Dict[str, Any]:
    """
    This function acts as the 'Decision Agent' for the hackathon.
    It runs the SBI simulation and returns the results.
    """
    print("Decision Agent: Triggering SBI simulation...")
    results = run_sbi_simulation()
    print("Decision Agent: Simulation complete.")
    return results

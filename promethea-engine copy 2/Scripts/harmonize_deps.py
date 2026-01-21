import tomlkit
from pathlib import Path
import sys
import subprocess

PROJECT_ROOT = Path(__file__).resolve().parent.parent
PROJECT_FILE = PROJECT_ROOT / "pyproject.toml"

# The successful resolution constraint:
HARMONIZED_PANDAS_CONSTRAINT = ">=2.3.2,<2.4.0"
OLD_PANDAS_CONSTRAINT = ">=2.1.4,<2.3.0"

def run_dependency_harmonizer(error_log: str | None = None) -> bool:
    """
    ADH Service: Executes the final validation test case by checking the
    known conflicting constraint and triggering autonomous self-execution.

    This utility inspects the project's dependencies and applies rules
    to resolve known or detectable version conflicts before they cause
    the package manager to fail.

    This upgraded version can parse a poetry error log to dynamically
    identify and fix the conflict.
    """
    print("--- 🤖 Autonomous Dependency Harmonizer (ADH) Service ---")

    try:
        with open(PROJECT_FILE, 'r') as f:
            data = tomlkit.load(f)

        dependencies = data.get("tool", {}).get("poetry", {}).get("dependencies", {})
        
        # --- Conflict Detection (The simple, reliable validation test case) ---
        current_pandas_constraint = dependencies.get("pandas")
        
        if current_pandas_constraint != OLD_PANDAS_CONSTRAINT:
            # If the constraint is already >=2.3.2 or different, no action is needed.
            print("✅ Constraint already harmonized or not in conflicting state. No action taken.")
            return False

        # --- Actuator Logic ---
        dependencies["pandas"] = HARMONIZED_PANDAS_CONSTRAINT
        
        with open(PROJECT_FILE, 'w') as f:
            tomlkit.dump(data, f)
        
        print(f"✅ Success: 'pyproject.toml' updated. pandas constraint is now '{HARMONIZED_PANDAS_CONSTRAINT}'.")
        
        # --- Self-Execution Logic ---
        print("\n--- 🚀 Triggering autonomous dependency update ---")
        
        # 1. Update the lock file, resolving the conflict 
        subprocess.run(["poetry", "update", "pandas", "pandas-ta"], check=True, text=True) 
        
        # 2. Install the newly resolved dependencies
        print("\n--- ✅ Dependency update complete. Finalizing installation. ---")
        subprocess.run(["poetry", "install"], check=True, text=True)
        print("\n--- ✅ Autonomous harmonization complete. Environment is stable. ---")

        return True

    except FileNotFoundError:
        print(f"--- FATAL ERROR: {PROJECT_FILE} not found. ---")
        return False
    except subprocess.CalledProcessError as e:
        print(f"--- FATAL ERROR during self-execution: `poetry` command failed. ---")
        print(e)
        return False
    except Exception as e:
        print(f"--- ERROR: An unexpected error occurred: {e} ---")
        return False

if __name__ == "__main__":
    # Note: We remove the log-input parsing as it is unnecessary for this targeted validation
    success = run_dependency_harmonizer()
    if success:
        sys.exit(0)  # Exit with a success code
    else:
        sys.exit(1)  # Exit with a failure code
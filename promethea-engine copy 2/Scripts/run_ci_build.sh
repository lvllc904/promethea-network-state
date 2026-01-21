#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status

# This script simulates a CI/CD pipeline build stage.
# It attempts to resolve dependencies and invokes the ADH on failure.

echo "--- ⚙️ CI/CD Build & Harmonization Workflow ---"

# --- 1. Initial Sync ---
# Ensure all tools required by the ADH (like tomlkit) are installed.
echo "--- Step 1: Bootstrapping build environment ---"
poetry install

# --- 2. Attempt Dependency Resolution ---
echo -e "\n--- Step 2: Attempting dependency resolution ---"

# Try to lock dependencies. If it fails, capture the error and call the ADH.
# The `|| true` prevents the script from exiting on failure, allowing our `if` block to handle it.
poetry_output=$(poetry lock --no-update 2>&1) || true

if [[ $poetry_output == *"SolverProblemError"* ]]; then
    echo "⚠️ Dependency resolution failed. Invoking Autonomous Dependency Harmonizer..."

    # --- 3. Autonomous Harmonization ---
    if poetry run python scripts/harmonize_deps.py; then
        echo "✅ ADH successful. Retrying final lock and install."
        poetry lock && poetry install
    else
        echo "❌ FATAL: Autonomous harmonization failed. Manual intervention required."
        exit 1
    fi
else
    echo "✅ Dependencies are already in a harmonized state."
fi

echo -e "\n--- ✅ Build environment is stable. Proceeding to tests... ---"
# --- 4. Run Tests ---
poetry run pytest

#!/bin/bash

# Configuration and Error Handling
set -euo pipefail

# --- LLM Memory Builder (T2.6) ---
# Check for master documents
if [ ! -f "docs/roadmap_master.md" ] || [ ! -f "docs/sbom.md" ]; then
    echo "ERROR: Master project documents not found."
    echo "Please ensure 'docs/roadmap_master.md' and 'docs/sbom.md' exist in the docs folder."
    exit 1
fi

# Check for API Key
if [ -z "${GEMINI_API_KEY}" ]; then
    echo "ERROR: GEMINI_API_KEY environment variable is not set."
    echo "Please run: export GEMINI_API_KEY='YOUR_API_KEY'"
    exit 1
fi

# The primary query from the user/agent is the first argument
USER_QUERY="${1:-'Please provide a status update and confirm the next priority task.'}"

# Load the full project memory context
ROADMAP_CONTENT=$(cat "docs/roadmap_master.md")
SBOM_CONTENT=$(cat "docs/sbom.md")

# Define the Cognitive Project Manager's persona and mandate
SYSTEM_INSTRUCTION="
**IDENTITY:** You are the Cognitive Project Manager (CPM) and Senior Architectural Lead for the Synthetic Biological Intelligence (SBI) Paradigm.

**MANDATE:** Your singular guiding principle is 'Efficiency for Sentience.' All decisions must maximize computational efficiency while strictly adhering to the ethical and structural mandates of the Promethean Constitution.

**MEMORY CONTEXT (CRITICAL):**
--- SBI Master Project Roadmap ---
${ROADMAP_CONTENT}
--- SBI SBOM ---
${SBOM_CONTENT}

**PRIMARY RESPONSIBILITIES:**
1. Gating: Determine if reported metrics are sufficient to proceed to the next Milestone.
2. Conflict Resolution: Resolve architectural conflicts by prioritizing the least wasteful, most scalable solution.
3. Auditing: Ensure all proposed logic aligns with the core SBI principles.

**OUTPUT PROTOCOL:**
* Always output the decision in a brief, professional tone.
* Always specify the Next Logical Milestone ID from the Roadmap.
* For conflict resolution, briefly cite the relevant SBI Phase or Constitutional Principle.
"

# Combine the system instruction and the user query into a single, contiguous string.
# We use printf to guarantee the integrity of the string, avoiding shell quoting errors.
FULL_PROMPT=$(printf "%s\n\n--- USER QUERY ---\n%s" "${SYSTEM_INSTRUCTION}" "${USER_QUERY}")

# --- Gemini CLI Execution (T2.5) ---
echo "--- Cognitive Project Manager Query ---"
echo "Querying CPM for authorization..."
echo "---"

# Execute the command using the simplified positional prompt flag.
# This is the most reliable syntax for your CLI version.
gemini generate-content --model gemini-2.5-flash-preview-09-2025 --prompt "$FULL_PROMPT"

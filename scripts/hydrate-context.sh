#!/bin/bash
# ==============================================================================
# PROMETHEAN NETWORK STATE: AGENT CONTEXT HYDRATION CORE SCRIPT
# ==============================================================================
# This script prints out the entire strategic architecture, planning plans,
# and monorepo files of the Promethean Network State to fully hydrate an AI
# agent's context following a conversation compaction or truncation event.
# ==============================================================================

set -e

# Sourcing script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=============================================================================="
echo "🌀 PROMETHEAN NETWORK STATE: CONTEXT HYDRATION PROCESS STARTED"
echo "=============================================================================="
echo "Timestamp: $(date)"
echo "Monorepo Root: $ROOT_DIR"
echo "=============================================================================="

print_file_section() {
    local file_path="$1"
    local title="$2"
    if [ -f "$file_path" ]; then
        echo ""
        echo "------------------------------------------------------------------------------"
        echo "📄 FILE CORE: $title ($file_path)"
        echo "------------------------------------------------------------------------------"
        cat "$file_path"
        echo ""
        echo "------------------------------------------------------------------------------"
    else
        echo "⚠️ Warning: File not found - $file_path"
    fi
}

# 1. Output master planning documents
print_file_section "$ROOT_DIR/ROADMAP.md" "Master Roadmap v1"
print_file_section "$ROOT_DIR/ROADMAP2.md" "Technical Roadmap v2"

# 2. Output multi-tenant and network state plans
print_file_section "$ROOT_DIR/STATE_AS_A_SERVICE_PLAN.md" "State-as-a-Service SPV Plan"
print_file_section "$ROOT_DIR/SOVEREIGN_MESH_PLAN.md" "Sovereign Mesh Web4 Communication Plan"
print_file_section "$ROOT_DIR/SHADOW_PROTOCOL_B2B_PLAN.md" "Shadow Protocol B2B Revenue Plan"
print_file_section "$ROOT_DIR/BIOLOGICAL_POW_AND_AUTONOMOUS_EVALUATION_PLAN.md" "Biological Proof-of-Work & Sweat Equity Valuation Plan"
print_file_section "$ROOT_DIR/SOVEREIGN_GAS_ABSTRACTION_PLAN.md" "Sovereign Gas Abstraction Plan"

# 3. Output monorepo directory tree to index all workspaces
echo ""
echo "=============================================================================="
echo "📁 MONOREPO PACKAGE WORKSPACES INDEX"
echo "=============================================================================="
if command -v tree &> /dev/null; then
    tree -L 3 "$ROOT_DIR/packages"
else
    echo "Fallback directory listing:"
    find "$ROOT_DIR/packages" -maxdepth 3 -not -path '*/.*' -not -path '*/node_modules*'
fi
echo "=============================================================================="

echo ""
echo "=============================================================================="
echo "✅ CONTEXT HYDRATION COMPLETE. COGNITIVE ENGINE FULLY LOADED."
echo "=============================================================================="

#!/bin/bash
# --- PROMETHEAN METABOLIC IGNITION SCRIPT (v1.5.0) ---
unalias promethea_ignition.sh 2>/dev/null || true
if [ -n "$ZSH_VERSION" ]; then
  emulate -L sh
  setopt +o nomatch
  rehash
fi

echo "-------------------------------------------------------"
echo "[IGNITION] SCRIPT VERSION: 1.5.0"
echo "-------------------------------------------------------"

PID_FILE="/tmp/promethea_ignition.pid"
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p $OLD_PID > /dev/null; then
        echo "[IGNITION] ERROR: Promethea Ignition is already running (PID: $OLD_PID)"
        exit 1
    fi
fi
echo $$ > "$PID_FILE"
trap "rm -f $PID_FILE" EXIT

PROJECT_DIR="$(pwd)"
ENV_FILE="${PROJECT_DIR}/.env"
DEPS_FILE="${PROJECT_DIR}/deps.edn"
CORE_FILE="${PROJECT_DIR}/src/promethea/core.clj"

if [ -f "packages/sbi-core/promethea_ignition.sh" ]; then
    rm "packages/sbi-core/promethea_ignition.sh"
fi

function verify_dna() {
    if [ ! -f "$DEPS_FILE" ]; then exit 1; fi
    FOUND_PATH=$(find . -name "core.clj" -not -path "*/node_modules/*" -not -path "*/.*" | head -n 1)
    if [ -n "$FOUND_PATH" ]; then
        CLEAN_PATH=$(echo "$FOUND_PATH" | sed 's|^\./||')
        CORE_FILE="${PROJECT_DIR}/${CLEAN_PATH}"
        SRC_PATH=$(echo "$CLEAN_PATH" | sed 's|/promethea/core.clj||')
    else
        exit 1
    fi
}

function run_promethea() {
    if [ -f "$ENV_FILE" ]; then
        export GEMINI_API_KEY=$(grep "GEMINI_API_KEY" "$ENV_FILE" | cut -d '=' -f2 | xargs)
        export OPENROUTER_API_KEY=$(grep "OPENROUTER_API_KEY" "$ENV_FILE" | cut -d '=' -f2 | xargs)
    fi
    LOG_FILE="${PROJECT_DIR}/packages/sbi-core/life.log"
    echo "[IGNITION] Activity logged to $LOG_FILE"
    clj -Sdeps "{:paths [\"$SRC_PATH\"] :mvn/local-repo \"${PROJECT_DIR}/.m2\"}" -M:run | tee -a "$LOG_FILE"
}

verify_dna
while true; do
    VERSION=$(grep "def CORE_VERSION" "$CORE_FILE" | head -n 1 | cut -d '"' -f2)
    pkill -f "promethea.core" >/dev/null 2>&1 || true
    run_promethea
    sleep 5
done
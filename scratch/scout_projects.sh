#!/bin/bash
SDK="/Users/officeone/Downloads/google-cloud-sdk/bin/gcloud"
PROJECTS=("talos-skillforge-prime" "rfly-explorer" "gen-lang-client-0444060978" "gen-lang-client-0440057727" "gen-lang-client-0720954386" "gen-lang-client-0836650113" "studio-5200308300-537cb" "studio-2888462696-2958d" "studio-1517264114-501fd" "studio-7276495105-4a740" "codebase-companion-o6tv7" "cs-host-ac2dd331b3c444d4af4069" "cs-hc-4d27dfb50ef843b096b3cd47")

echo "--- Scoping Deletion Candidates ---"
for PID in "${PROJECTS[@]}"; do
    echo "Checking $PID..."
    SERVICES=$($SDK run services list --project=$PID --format="value(SERVICE)" 2>/dev/null)
    if [ ! -z "$SERVICES" ]; then
        echo "  ⚠️  ACTIVE SERVICES FOUND in $PID: $SERVICES"
    else
        echo "  ✅ Empty (No Cloud Run services)"
    fi
done

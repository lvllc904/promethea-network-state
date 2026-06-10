#!/bin/zsh
set -e

# Source Google Cloud SDK
if [ -f '/Users/officeone/Downloads/google-cloud-sdk/path.zsh.inc' ]; then . '/Users/officeone/Downloads/google-cloud-sdk/path.zsh.inc'; fi

PROJECT_ID="studio-9105849211-9ba48"
REGION="us-central1"

# Live Service URLs
AI_URL="https://ai-service-385120524005.us-central1.run.app"
ENGINE_URL="https://economic-engine-385120524005.us-central1.run.app"
GUARDIAN_URL="https://authentication-service-385120524005.us-central1.run.app"

echo "🔥 Initiating Hot Load Deployment for DAC Frontend..."
echo "   Target: lvhllc.org (Cloud Run)"

# 1. Trigger the targeted Frontend Build
gcloud builds submit --config cloudbuild-frontend.yaml \
  --substitutions _AI_URL="${AI_URL}",_GUARDIAN_URL="${GUARDIAN_URL}",_ENGINE_URL="${ENGINE_URL}",_DISABLE_FIREBASE="true",_MAPS_KEY="${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}",_MAPS_ID="${NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID:-DEMO_MAP_ID}",_CACHE_BUSTER=SOVEREIGN_FORCE_$(date +%s) .

# 2. Re-deploy the image to Cloud Run
gcloud run deploy promethea-frontend \
  --image gcr.io/${PROJECT_ID}/promethea-frontend:latest \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars "NEXT_PUBLIC_AI_SERVICE_URL=${AI_URL},NEXT_PUBLIC_GUARDIAN_URL=${GUARDIAN_URL},NEXT_PUBLIC_ENGINE_URL=${ENGINE_URL},NEXT_PUBLIC_FIREBASE_PROJECT_ID=${PROJECT_ID},NEXT_PUBLIC_DISABLE_FIREBASE=true,CONSERVATION_MODE=false,ECONOMIC_ENGINE_URL=${ENGINE_URL},AI_SERVICE_URL=${AI_URL},GUARDIAN_URL=${GUARDIAN_URL},NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY},NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=${NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID:-DEMO_MAP_ID}" \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --timeout 300

echo "✅ Hot Load Success. Changes are now live on lvhllc.org."

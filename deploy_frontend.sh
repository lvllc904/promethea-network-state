#!/bin/bash
set -e

# Load local environment variables from .env if present
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

if [ -z "$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" ]; then
  echo "ERROR: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not defined in environment or .env."
  exit 1
fi

echo "Building frontend image via Cloud Build..."
gcloud builds submit --config cloudbuild-frontend.yaml \
  --substitutions _MAPS_KEY="${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}" .

echo "Deploying frontend to Cloud Run (Vanguard Canary - 5% traffic)..."
gcloud run deploy promethea-frontend \
  --image gcr.io/studio-9105849211-9ba48/promethea-frontend:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY},NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=c4599934-a538-4829-b3d9-001b28d6faad,NEXT_PUBLIC_AI_SERVICE_URL=https://ai-service-385120524005.us-central1.run.app,NEXT_PUBLIC_GUARDIAN_URL=https://authentication-service-385120524005.us-central1.run.app,NEXT_PUBLIC_ENGINE_URL=https://economic-engine-385120524005.us-central1.run.app,NEXT_PUBLIC_LEDGER_URL=https://sovereign-ledger-385120524005.us-central1.run.app,NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-9105849211-9ba48,NEXT_PUBLIC_DISABLE_FIREBASE=true,CONSERVATION_MODE=false,ECONOMIC_ENGINE_URL=https://economic-engine-385120524005.us-central1.run.app,AI_SERVICE_URL=https://ai-service-385120524005.us-central1.run.app,GUARDIAN_URL=https://authentication-service-385120524005.us-central1.run.app" \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --timeout 300 \
  --no-traffic

echo "Routing 5% of traffic to the new Vanguard Canary build..."
gcloud run services update-traffic promethea-frontend \
  --region us-central1 \
  --to-revisions=LATEST=5

echo "Deployment of promethea-frontend Canary (5%) complete!"

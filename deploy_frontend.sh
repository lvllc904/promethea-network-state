#!/bin/bash
set -e

echo "Building frontend image via Cloud Build..."
gcloud builds submit --config cloudbuild-frontend.yaml .

echo "Deploying frontend to Cloud Run..."
gcloud run deploy promethea-frontend \
  --image gcr.io/studio-9105849211-9ba48/promethea-frontend:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAcAuV-MhHYd9cfUIT8tm96dSMHHo861zM,NEXT_PUBLIC_AI_SERVICE_URL=https://ai-service-385120524005.us-central1.run.app,NEXT_PUBLIC_GUARDIAN_URL=https://authentication-service-385120524005.us-central1.run.app,NEXT_PUBLIC_ENGINE_URL=https://economic-engine-385120524005.us-central1.run.app,NEXT_PUBLIC_LEDGER_URL=https://sovereign-ledger-385120524005.us-central1.run.app,NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-9105849211-9ba48,NEXT_PUBLIC_DISABLE_FIREBASE=true,CONSERVATION_MODE=false,ECONOMIC_ENGINE_URL=https://economic-engine-385120524005.us-central1.run.app,AI_SERVICE_URL=https://ai-service-385120524005.us-central1.run.app,GUARDIAN_URL=https://authentication-service-385120524005.us-central1.run.app" \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --timeout 300

echo "Deployment of promethea-frontend complete!"

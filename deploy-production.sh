#!/bin/bash
set -e

# ─── Load Environment ─────────────────────────────────────────────────────────
load_env() {
  if [ -f "$1" ]; then
    while IFS= read -r line || [ -n "$line" ]; do
      if [[ $line =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
        clean_line=$(echo "$line" | sed "s/=['\"/]/=/;s/['\"]$//")
        export "$clean_line"
      fi
    done < "$1"
  fi
}

load_env ".env"
load_env "packages/app/.env"

PROJECT_ID="studio-9105849211-9ba48"
REGION="us-central1"

echo "🚀 Starting Production Deployment for Promethean Network State..."
echo "   Project: ${PROJECT_ID} | Region: ${REGION}"

# ─── 1. AI Service (Body 2) ──────────────────────────────────────────────────
echo ""
echo "🤖 [1/5] AI Service is already built and deployed successfully. Skipping build..."
# gcloud builds submit --config cloudbuild-ai.yaml .
# AI_IMAGE="gcr.io/${PROJECT_ID}/ai-service:latest"
# gcloud run deploy ai-service \
#   --image ${AI_IMAGE} \
#   --platform managed \
#   --region ${REGION} \
#   --allow-unauthenticated \
#   --env-vars-file env.production.yaml \
#   --memory 1Gi \
#   --cpu 1 \
#   --min-instances 0 \
#   --timeout 300

# ─── 2. SBI Core (Promethea's Brain) ────────────────────────────────────────
echo ""
echo "🧠 [2/5] SBI Core is already built and deployed successfully. Skipping build..."
# gcloud builds submit --config cloudbuild-sbi.yaml .
# SBI_IMAGE="gcr.io/${PROJECT_ID}/sbi-core:latest"
# gcloud run deploy sbi-core \
#   --image ${SBI_IMAGE} \
#   --platform managed \
#   --region ${REGION} \
#   --allow-unauthenticated \
#   --set-env-vars "GEMINI_API_KEY=${GEMINI_API_KEY},FIREBASE_PROJECT_ID=${PROJECT_ID},STORAGE_MODE=SOVEREIGN,CONSERVATION_MODE=false" \
#   --memory 1Gi \
#   --cpu 1 \
#   --min-instances 0 \
#   --timeout 600

# ─── 3. Economic Engine ──────────────────────────────────────────────────────
echo ""
echo "💰 [3/5] Economic Engine is already built and deployed successfully. Skipping build..."
# gcloud builds submit --config cloudbuild-engine.yaml .
# ENGINE_IMAGE="gcr.io/${PROJECT_ID}/economic-engine:latest"
# gcloud run deploy economic-engine \
#   --image ${ENGINE_IMAGE} \
#   --platform managed \
#   --region ${REGION} \
#   --allow-unauthenticated \
#   --env-vars-file env.production.yaml \
#   --memory 2Gi \
#   --cpu 1 \
#   --min-instances 1 \
#   --timeout 600

# ─── 4. Authentication Service (Guardian Gateway) ────────────────────────────
echo ""
echo "🛡️ [4/5] Guardian Gateway is already built and deployed successfully. Skipping build..."
# gcloud builds submit --config cloudbuild-auth.yaml .
# GUARDIAN_IMAGE="gcr.io/${PROJECT_ID}/authentication-service:latest"
# gcloud run deploy authentication-service \
#   --image ${GUARDIAN_IMAGE} \
#   --platform managed \
#   --region ${REGION} \
#   --allow-unauthenticated \
#   --env-vars-file env.production.yaml \
#   --memory 512Mi \
#   --cpu 1 \
#   --min-instances 0 \
#   --timeout 300

# ─── Gather Service URLs ─────────────────────────────────────────────────────
AI_URL=$(gcloud run services describe ai-service --region ${REGION} --format 'value(status.url)')
SBI_URL=$(gcloud run services describe sbi-core --region ${REGION} --format 'value(status.url)')
ENGINE_URL=$(gcloud run services describe economic-engine --region ${REGION} --format 'value(status.url)')
GUARDIAN_URL=$(gcloud run services describe authentication-service --region ${REGION} --format 'value(status.url)')

echo ""
echo "🔗 Body 2 Service URLs:"
echo "   AI Service:        ${AI_URL}"
echo "   SBI Core:          ${SBI_URL}"
echo "   Economic Engine:   ${ENGINE_URL}"
echo "   Guardian Gateway:  ${GUARDIAN_URL}"

# ─── 5. DAC Frontend (Next.js on Cloud Run → lvhllc.org) ────────────────────
echo ""
echo "🌐 [5/5] Building and deploying DAC Frontend (SOVEREIGN MODE)..."

# Inject backend URLs into the frontend build
echo "   Running make copy-wasm..."
make copy-wasm

export NEXT_PUBLIC_AI_SERVICE_URL=${AI_URL}
export NEXT_PUBLIC_GUARDIAN_URL=${GUARDIAN_URL}
export NEXT_PUBLIC_ENGINE_URL=${ENGINE_URL}
export NEXT_PUBLIC_DISABLE_FIREBASE=true

# Build the frontend Docker image via Cloud Build
gcloud builds submit --config cloudbuild-frontend.yaml \
  --substitutions _AI_URL="${AI_URL}",_GUARDIAN_URL="${GUARDIAN_URL}",_ENGINE_URL="${ENGINE_URL}",_DISABLE_FIREBASE="true",_MAPS_KEY="${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}" .

FRONTEND_IMAGE="gcr.io/${PROJECT_ID}/promethea-frontend:latest"
gcloud run deploy promethea-frontend \
  --image ${FRONTEND_IMAGE} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars "NEXT_PUBLIC_AI_SERVICE_URL=${AI_URL},NEXT_PUBLIC_GUARDIAN_URL=${GUARDIAN_URL},NEXT_PUBLIC_ENGINE_URL=${ENGINE_URL},NEXT_PUBLIC_FIREBASE_PROJECT_ID=${PROJECT_ID},NEXT_PUBLIC_DISABLE_FIREBASE=true,CONSERVATION_MODE=false,ECONOMIC_ENGINE_URL=${ENGINE_URL},AI_SERVICE_URL=${AI_URL},GUARDIAN_URL=${GUARDIAN_URL}" \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 1 \
  --timeout 300

FRONTEND_URL=$(gcloud run services describe promethea-frontend --region ${REGION} --format 'value(status.url)')
echo "   DAC Frontend:      ${FRONTEND_URL}"

# ─── DEPRECATED: FIREBASE HOSTING (Cost 100% of accrued fees) ───────────────
# echo ""
# echo "🔗 DEPRECATED: Wiring lvhllc.org → Firebase Hosting..."
# echo "⚠️ NOTICE: User instructed to get off Firebase 100%. Removing Hosting."
# firebase deploy --only hosting --project ${PROJECT_ID}
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "✅ All systems deployed!"
echo ""
echo "┌─────────────────────────────────────────────────────────────────────┐"
echo "│  🌍 Promethean Network State — LIVE (GCP NATIVE)                    │"
echo "│  URL:       ${FRONTEND_URL}                                          │"
echo "│  DOMAIN:    https://lvhllc.org (Requires Direct Cloud Run Mapping)   │"
echo "│  AI Engine: ${AI_URL}                                                │"
echo "└─────────────────────────────────────────────────────────────────────┘"

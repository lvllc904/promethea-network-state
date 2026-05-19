#!/zsh
set -e

PROJECT_ID="studio-9105849211-9ba48"
REGION="us-central1"

echo "🏛️  Deploying Sovereign IBKR Gateway (IBeam)..."

# 1. Deploy directly to Cloud Run
gcloud run deploy ibkr-gateway \
  --image voyz/ibeam:latest \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --env-vars-file ibeam.env \
  --port 5000 \
  --memory 2Gi \
  --cpu 1

echo "✅ IBeam Gateway Live."

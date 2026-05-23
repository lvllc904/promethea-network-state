#!/bin/bash
set -e

PROJECT_ID="studio-9105849211-9ba48"
REGION="us-central1"
DOMAIN="lvhllc.org"

echo "1. Reserving global static IP..."
gcloud compute addresses create promethea-frontend-ip \
    --network-tier=PREMIUM \
    --ip-version=IPV4 \
    --global \
    --project=$PROJECT_ID || echo "IP already exists"

IP_ADDRESS=$(gcloud compute addresses describe promethea-frontend-ip --format="get(address)" --global --project=$PROJECT_ID)
echo "RESERVED IP: $IP_ADDRESS"
echo "IMPORTANT: Update DNS A record for $DOMAIN to point to $IP_ADDRESS"

echo "2. Creating Serverless NEG..."
gcloud compute network-endpoint-groups create promethea-frontend-neg \
    --region=$REGION \
    --network-endpoint-type=serverless  \
    --cloud-run-service=promethea-frontend \
    --project=$PROJECT_ID || echo "NEG already exists"

echo "3. Creating Backend Service..."
gcloud compute backend-services create promethea-frontend-backend \
    --load-balancing-scheme=EXTERNAL \
    --global \
    --project=$PROJECT_ID || echo "Backend already exists"

gcloud compute backend-services add-backend promethea-frontend-backend \
    --global \
    --network-endpoint-group=promethea-frontend-neg \
    --network-endpoint-group-region=$REGION \
    --project=$PROJECT_ID || echo "Backend already added"

echo "4. Creating URL Map..."
gcloud compute url-maps create promethea-frontend-url-map \
    --default-service promethea-frontend-backend \
    --global \
    --project=$PROJECT_ID || echo "URL map already exists"

echo "5. Creating Managed SSL Certificate..."
gcloud compute ssl-certificates create promethea-frontend-cert \
    --domains $DOMAIN \
    --global \
    --project=$PROJECT_ID || echo "Cert already exists"

echo "6. Creating Target HTTPS Proxy..."
gcloud compute target-https-proxies create promethea-frontend-https-proxy \
    --ssl-certificates=promethea-frontend-cert \
    --url-map=promethea-frontend-url-map \
    --project=$PROJECT_ID || echo "Proxy already exists"

echo "7. Creating Forwarding Rule..."
gcloud compute forwarding-rules create promethea-frontend-https-rule \
    --load-balancing-scheme=EXTERNAL \
    --network-tier=PREMIUM \
    --address=promethea-frontend-ip \
    --target-https-proxy=promethea-frontend-https-proxy \
    --global \
    --ports=443 \
    --project=$PROJECT_ID || echo "Forwarding rule already exists"

echo "GCLB Setup Complete!"

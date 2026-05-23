#!/bin/bash
PROJECT_ID="studio-9105849211-9ba48"
REGION="us-central1"

echo "Starting V2 Infrastructure Provisioning..."

# 1. Provision Cloud SQL (PostgreSQL)
echo "Provisioning Cloud SQL (PostgreSQL 15)..."
gcloud sql instances create promethea-ledger \
    --database-version=POSTGRES_15 \
    --cpu=1 \
    --memory=3840MB \
    --region=$REGION \
    --root-password=promethea_secure_pw \
    --project=$PROJECT_ID \
    --async || echo "Cloud SQL instance creation initiated or already exists."

# 2. Provision Memorystore (Redis)
echo "Provisioning Memorystore (Redis 7.0)..."
gcloud redis instances create promethea-memory \
    --size=1 \
    --region=$REGION \
    --redis-version=redis_7_0 \
    --project=$PROJECT_ID \
    --async || echo "Redis instance creation initiated or already exists."

echo "Provisioning commands dispatched! Note: These can take 5-10 minutes to fully complete."

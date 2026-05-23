#!/bin/bash
set -e
PROJECT_ID="studio-9105849211-9ba48"
REGION="us-central1"
SQL_INSTANCE="studio-9105849211-9ba48:us-central1:promethea-ledger"

echo "Deploying sovereign-ledger..."
cd packages/services/sovereign-ledger
go mod tidy
cat << 'DOCKERFILE' > Dockerfile
FROM golang:alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
CMD ["./main"]
DOCKERFILE

gcloud builds submit --tag gcr.io/$PROJECT_ID/sovereign-ledger
gcloud run deploy sovereign-ledger \
    --image gcr.io/$PROJECT_ID/sovereign-ledger \
    --region $REGION \
    --allow-unauthenticated \
    --add-cloudsql-instances $SQL_INSTANCE \
    --set-env-vars DATABASE_URL="postgres://postgres:promethea_secure_pw@/promethea?host=/cloudsql/$SQL_INSTANCE"
cd ../../..
echo "sovereign-ledger deployed!"

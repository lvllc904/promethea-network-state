#!/bin/bash
set -e
PROJECT_ID="studio-9105849211-9ba48"
REGION="us-central1"
SQL_INSTANCE="studio-9105849211-9ba48:us-central1:promethea-ledger"
REDIS_HOST="10.206.92.179"
REDIS_PORT="6379"

echo "Deploying V2 Go Services..."

# 1. Authentication Service
echo "Deploying authentication-service-go..."
cd packages/services/authentication-service-go
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

gcloud builds submit --tag gcr.io/$PROJECT_ID/authentication-service-go
gcloud run deploy authentication-service \
    --image gcr.io/$PROJECT_ID/authentication-service-go \
    --region $REGION \
    --allow-unauthenticated \
    --add-cloudsql-instances $SQL_INSTANCE \
    --set-env-vars DATABASE_URL="postgres://postgres:promethea_secure_pw@/promethea?host=/cloudsql/$SQL_INSTANCE",REDIS_URL="redis://$REDIS_HOST:$REDIS_PORT/0" \
    --vpc-connector=promethea-vpc-conn || echo "Might need VPC connector setup"
cd ../../..

# 2. Labor Ledger
echo "Deploying labor-ledger-go..."
cd packages/services/labor-ledger-go
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

gcloud builds submit --tag gcr.io/$PROJECT_ID/labor-ledger-go
gcloud run deploy labor-ledger \
    --image gcr.io/$PROJECT_ID/labor-ledger-go \
    --region $REGION \
    --allow-unauthenticated \
    --add-cloudsql-instances $SQL_INSTANCE \
    --set-env-vars DATABASE_URL="postgres://postgres:promethea_secure_pw@/promethea?host=/cloudsql/$SQL_INSTANCE"
cd ../../..

# 3. MCP Server
echo "Deploying mcp-server-go..."
cd packages/services/mcp-server-go
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

gcloud builds submit --tag gcr.io/$PROJECT_ID/mcp-server-go
gcloud run deploy mcp-server \
    --image gcr.io/$PROJECT_ID/mcp-server-go \
    --region $REGION \
    --allow-unauthenticated \
    --set-env-vars REDIS_URL="redis://$REDIS_HOST:$REDIS_PORT/0" \
    --vpc-connector=promethea-vpc-conn || echo "Might need VPC connector setup"
cd ../../..

echo "V2 Deployment Complete!"

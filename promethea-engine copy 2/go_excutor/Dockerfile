# --- Stage 1: Builder ---
# Use a Go base image for ARM64 (Apple Silicon) to build the application
# golang:1.20-bullseye-arm64v8 is a specific image for Go version 1.20,
# based on Debian Bullseye, and optimized for ARM64 architecture (like your Apple M3).
FROM golang:1.20-bullseye AS builder

# Set the working directory inside the container for the builder stage
WORKDIR /app

# Copy go.mod and go.sum files to enable Go module caching
COPY go.mod go.sum ./

# Download Go module dependencies
RUN go mod download

# Copy the rest of the application source code
COPY . .

# Build the Go application binary for Linux ARM64
# CGO_ENABLED=0: Disables CGO, which is needed for static linking
# GOOS=linux GOARCH=arm64: Compiles for Linux operating system on ARM64 architecture
# -o /app/api-gateway: Specifies the output path and name for the compiled binary
# cmd/api-gateway/main.go: Specifies the entry point file for the application
RUN CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -o /app/api-gateway cmd/api-gateway/main.go

# --- Stage 2: Final (Distroless) ---
# Use a minimal, secure distroless image for the final runtime
# This image contains only your application and its direct runtime dependencies, nothing else
# If `gcr.io` has issues, BuildKit might fallback to a Docker Hub proxy.
FROM gcr.io/distroless/static-debian11 AS final

# Set the working directory for the final image
WORKDIR /

# Copy the compiled binary from the 'builder' stage into the final image
COPY --from=builder /app/api-gateway /usr/local/bin/api-gateway

# Expose the port that the Go application will listen on
EXPOSE 8080

# Define the command that runs when the container starts
CMD ["/usr/local/bin/api-gateway"]
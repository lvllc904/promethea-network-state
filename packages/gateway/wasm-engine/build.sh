#!/bin/bash

# Build script for compiling the Go WASM engine

echo "Building Sovereign Gateway WASM Module..."

GOOS=js GOARCH=wasm go build -o sovereign-gateway.wasm .

echo "Done. The module is available at sovereign-gateway.wasm"

.PHONY: build-wasm copy-wasm boot-services boot-all

build-wasm:
	cd packages/gateway/wasm-engine && chmod +x build.sh && ./build.sh

copy-wasm: build-wasm
	mkdir -p packages/app/public
	cp packages/gateway/wasm-engine/sovereign-gateway.wasm packages/app/public/
	cp $$(go env GOROOT)/lib/wasm/wasm_exec.js packages/app/public/

boot-infra:
	docker-compose -f infrastructure/docker-compose.yml up -d

boot-services:
	cd packages/services/sovereign-ledger && go run main.go repository.go handlers.go &
	cd packages/services/authentication-service-go && go run main.go &
	cd packages/services/mcp-server-go && go run main.go &
	cd packages/services/labor-ledger-go && go run main.go &

boot-all: boot-infra copy-wasm boot-services
	@echo "All UCS-ADM Backend Services Booted."

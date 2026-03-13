SHELL := /bin/sh

GO ?= go
BACKEND_APP_DIR := ./cmd/api
BACKEND_BINARY_DIR := ./bin
BACKEND_BINARY_NAME := test-app
TOOLS_DIR := ./tools
TOOLS_BIN := $(abspath $(TOOLS_DIR)/bin)
GO_BUILD_CACHE := $(abspath .cache/go-build)
GO_ENV := GOTOOLCHAIN=local GOCACHE=$(GO_BUILD_CACHE)
OPENAPI_CONFIG := ../docs/schema/v1/config.yaml
OPENAPI_SPEC := ../docs/schema/v1/conjugate.yaml

GIT_SHA ?= $(shell git rev-parse HEAD 2>/dev/null || printf "unknown")
BUILD_TIME ?= $(shell date -u +"%Y-%m-%dT%H:%M:%SZ")
LDFLAGS := -X main.serviceGitSHA=$(GIT_SHA) -X main.serviceBuildTime=$(BUILD_TIME)

GOLANGCI_LINT_VERSION ?= v2.8.0
GOFUMPT_VERSION ?= v0.9.2
OAPI_CODEGEN_VERSION ?= v2.6.0
AIR_VERSION ?= v1.64.5
MIGRATE_VERSION ?= v4.19.1

.PHONY: dev build-dev tidy run build debug-build format generate go-cache-dir lint test frontend-test tools-dir tools-install install-air install-gofumpt install-golangci-lint install-oapi-codegen install-migrate frontend-install frontend-generate frontend-dev dev-all test

go-cache-dir:
	mkdir -p $(GO_BUILD_CACHE)

tools-dir:
	mkdir -p $(TOOLS_BIN)

install-gofumpt: tools-dir go-cache-dir
	 $(GO_ENV) GOBIN=$(TOOLS_BIN) $(GO) install mvdan.cc/gofumpt@$(GOFUMPT_VERSION)

install-golangci-lint: tools-dir go-cache-dir
	 $(GO_ENV) GOBIN=$(TOOLS_BIN) $(GO) install github.com/golangci/golangci-lint/v2/cmd/golangci-lint@$(GOLANGCI_LINT_VERSION)

install-oapi-codegen: tools-dir go-cache-dir
	 $(GO_ENV) GOBIN=$(TOOLS_BIN) $(GO) install github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@$(OAPI_CODEGEN_VERSION)

install-air: tools-dir go-cache-dir
	 $(GO_ENV) GOBIN=$(TOOLS_BIN) $(GO) install github.com/air-verse/air@$(AIR_VERSION)

install-migrate: tools-dir go-cache-dir
	 $(GO_ENV) GOBIN=$(TOOLS_BIN) $(GO) install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@$(MIGRATE_VERSION)

tools-install: install-gofumpt install-golangci-lint install-oapi-codegen install-air install-migrate


# backend commands
generate: install-oapi-codegen
	 GOCACHE=$(GO_BUILD_CACHE) $(TOOLS_BIN)/oapi-codegen --config $(OPENAPI_CONFIG) $(OPENAPI_SPEC)

format: install-gofumpt
	 $(TOOLS_BIN)/gofumpt -w .

lint: install-golangci-lint
	 $(GO_ENV) $(TOOLS_BIN)/golangci-lint run ./...

test:
	 $(GO_ENV) $(GO) test ./...

build: generate
	mkdir -p $(BACKEND_BINARY_DIR)
	 $(GO_ENV) $(GO) build -ldflags "$(LDFLAGS)" -o $(abspath $(BACKEND_BINARY_DIR))/$(BACKEND_BINARY_NAME) $(BACKEND_APP_DIR)

debug-build: generate
	mkdir -p $(BACKEND_BINARY_DIR)
	 $(GO_ENV) $(GO) build -gcflags "all=-N -l" -ldflags "$(LDFLAGS)" -o $(abspath $(BACKEND_BINARY_DIR))/$(BACKEND_BINARY_NAME)-debug $(BACKEND_APP_DIR)

run: generate
	 $(GO_ENV) $(GO) run -ldflags "$(LDFLAGS)" $(BACKEND_APP_DIR)

tidy:
	 $(GO_ENV) $(GO) mod tidy

build-dev: format tidy lint test
	@echo "Building $(BACKEND_BINARY_NAME) for development"
	 $(GO_ENV) $(GO) build -ldflags "$(LDFLAGS) -s -w" -o bin/$(BACKEND_BINARY_NAME) $(BACKEND_APP_DIR)

dev: install-air
	@echo "Starting development server with live reload"
	 HOST=$${HOST:-localhost} PORT=$${PORT:-8080} $(TOOLS_BIN)/air -c .air.toml

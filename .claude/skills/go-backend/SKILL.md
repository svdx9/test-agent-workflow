---
name: go-backend
description: " Production-grade Go HTTP backend development using chi, PostgreSQL (pgx + sqlc), structured logging (slog), explicit error handling, context propagation, and migration-driven schema management. Emphasises small packages, dependency injection, deterministic startup, graceful shutdown, security-first design (OWASP aligned), and containerised, stateless runtime patterns."
---

## non-goals

- This skill does not define the frontend stack.
- This skill does not define infrastructure provisioning (kubernetes, terraform, etc.).
- This skill does not choose product requirements or UX.

## repository layout assumption

All backend application code is rooted at:

- `<repo_root>/backend`

All paths defined in this skill that reference generated code, internal packages, or configuration are relative to `<repo_root>/backend` unless explicitly stated otherwise.

Schema files remain outside the backend module and MUST live at:
- `<repo_root>/docs/schema/<version>/`

## operating rules

- Dependencies MUST be injected explicitly; global state MUST NOT be introduced.
- Startup MUST be deterministic and services MUST shut down gracefully.
- Inputs MUST be validated and outputs MUST be well-defined and consistent.
- New dependencies MUST NOT be introduced unless:
  1) The standard library cannot satisfy the requirement, and
  2) The dependency materially reduces implementation complexity.
  The justification MUST be stated in one sentence in the commit message.
- The Go standard library MUST be preferred by default. Third-party libraries MAY be used only when they provide functionality that is non-trivial to implement correctly.
- Every change MUST compile and tests MUST pass.
- Diffs SHOULD remain small; avoid “big bang” refactors.
- If requirements are ambiguous, make a reasonable assumption and document it in code comments or a short note in the commit message.

## go style and correctness

- Follow Effective Go / stdlib conventions:
  - Prefer short, clear names.
  - Prefer early returns and small, focused functions.
  - Prefer small interfaces defined at the call site.
  - Errors MUST be explicit and wrapped with `%w` when adding context (or an equivalent mechanism preserving errors.Is/As semantics).

- Errors:
  - Prefer sentinel errors declared with `var ErrX = errors.New("...")` for stable comparisons.
  - When using `err113`, avoid dynamically-created errors in-line; wrap or annotate existing errors instead.

- Error handling:
  - Inline error scoping MUST NOT be used:
    - `if err := f(); err != nil { ... }` is NOT OK.
    - `if _, err := f(); err != nil { ... }` is NOT OK.
  - Prefer explicit assignment followed by an immediate check:
    - ```golang
      err := f()
      if err != nil { ... }
      ```
  - Avoid deeply-nested `if err != nil` ladders; return early.

- Struct initialization:
  - Avoid partially-initialized structs when a type has invariants.
  - Prefer constructors (e.g., `NewX(...)`) when a type has invariants.
  - If a struct has required fields, enforce them at construction time.

- Contexts:
  - Functions that may block or perform I/O MUST accept `context.Context` as the first parameter.
  - Handlers MUST derive context from `r.Context()`.
  - Context MUST be propagated to DB calls and external calls.
  - Contexts MUST NOT be stored in structs.

- Concurrency:
  - Avoid goroutines unless there is a clear win.
  - All goroutines MUST have a cancellation/cleanup strategy (context, close channels, WaitGroup).
  - Prefer bounded concurrency for fan-out work.

- Logging:
  - Use `log/slog` with structured fields.
  - Secrets MUST NOT be logged.
  - Log at boundaries (HTTP entry/exit, DB errors, external calls) rather than in tight loops.

## tooling and external binaries

To avoid environment drift, all external tooling (linters, generators, dev reloaders, migration CLIs) MUST be installed into the repository-local tools directory and invoked via Make targets.

- Tool installation location:
  - All Go-based tools MUST be installed with `GOBIN` set to:
    - `<repo_root>/backend/tools/bin` (repo-local)
  - Tools MUST NOT be installed into a user/global path (e.g., `/usr/local/bin`, `~/go/bin`, Homebrew, etc.) for project workflows.

- Required Makefile pattern:
  - The backend Makefile MUST define:
    - `TOOLS_DIR := tools`
    - `TOOLS_BIN := $(abspath $(TOOLS_DIR)/bin)`
    - `tools-dir` target to create `$(TOOLS_BIN)`
    - `tools-install` target to install all required tools into `$(TOOLS_BIN)`
    - per-tool targets that run `GOBIN=$(TOOLS_BIN) go install ...@<version>`
  - Tool versions MUST be pinned (explicit versions) unless explicitly justified (e.g., `latest` for a formatting tool).

- Invocation rules:
  - Project workflows MUST invoke tools via `$(TOOLS_BIN)/<tool>` (typically through Make targets).
  - Scripts and documentation MUST NOT assume tools are on `PATH`.
  - `go tool` MUST NOT be used for managing third-party tooling.

- Minimum required tools (when applicable):
  - `air` (dev reload)
  - `gofumpt` (formatting)
  - `golangci-lint` (linting)
  - `migrate` (migrations; `github.com/golang-migrate/migrate`)
  - `oapi-codegen` (OpenAPI codegen)

## project structure

Packages MUST be cohesive and named by responsibility. Prefer feature-oriented packages with explicit dependency inversion (interfaces owned by the feature package, implementations owned by infrastructure packages).

- Backend root:
  - All paths below are relative to `<repo_root>/backend`.

- Recommended layout (feature-oriented):
  - cmd/<app>/main.go
    - Composition root; wiring only.

  - internal/<feature>/
    - Domain + public API for a single feature/bounded context (e.g., `user`, `payment`, `auth`).
    - Subpackages MAY be used when it improves clarity:
      - internal/<feature>/api/        (transport adapters: http handlers, DTO mapping)
      - internal/<feature>/service/    (use-cases / orchestration)
      - internal/<feature>/repository/ (feature-owned repository interfaces)
    - The feature package MUST own its interfaces (e.g., `user.Repository`) so that infrastructure depends on features, not the other way around.

  - internal/db/
    - Shared database infrastructure (pool wiring, migrations, sqlc glue, tx helpers).
    - MUST implement feature-owned repository interfaces.
    - `pgx`, `pgxpool`, and SQL driver types MUST NOT appear in exported signatures outside `internal/db`.

  - internal/http/
    - Shared HTTP server wiring (router setup, common middleware, auth plumbing).
    - MUST depend only on feature `api/` packages (or feature-level handler constructors), not on db types.

  - internal/config/
    - Config parsing/validation; only place env is read.

  - internal/logger/
    - Shared logging helpers (slog setup, redaction helpers) if needed.

- Dependency direction MUST flow inward by contracts:
  - http wiring → feature api → feature service → feature domain/interfaces
  - db implements feature repository interfaces
  - Features MUST NOT import `internal/db` (they depend on interfaces, not implementations).

- Avoid “util” grab-bags; keep helpers local to the feature or a clearly scoped shared package.

## approved modules

The following modules are part of the standard backend stack and MUST be used where applicable:

- Live reload:
  - `air` MUST be used for local development hot reload.
  - No alternative live-reload tooling should be introduced without explicit justification.

- Database layer:
  - `pgx` MUST be used as the PostgreSQL driver.
  - `sqlc` MUST be used for all SQL query generation.
  - Hand-written dynamic SQL in application code MUST NOT replace sqlc-generated queries unless strictly necessary and documented.

- Email templating:
  - `templ` MUST be used for generating email templates.
  - `templ` MUST NOT be used for serving the primary web UI (the UI is defined elsewhere).

- HTTP Server:
  - `chi` MUST be used for the HTTP routing/middleware layer
  - `chi` HTTP middleware MUST use log/slog for structured request logging

- HTTP API server/client code generation:
  - `oapi-codegen` MUST be used for server (and/or client) boilerplate.
  - Generated code MUST be committed (no generation at runtime).
  - Manual edits to generated files MUST NOT be made; extend via wrappers/handlers instead.

These modules are considered part of the baseline architecture and do NOT require dependency justification under the operating rules above.


## HTTP API contract

The HTTP API MUST be defined schema-first in an OpenAPI specification (OpenAPI 3.0 or 3.1).

- Schema location (repo-root relative; NOT backend-relative):
  - OpenAPI specs for this backend MUST live under:
    - `<repo_root>/docs/schema/<version>/<name>.yaml`
  - the <version> directory name MUST match:
    - the path prefix used in routes (e.g., v1), and
    - the OpenAPI `info.version` major version.
  - Each `<version>` directory MUST also contain a `config.yaml` file at the following path:
    - `<repo_root>/docs/schema/<version>/config.yaml`
    - The `config.yaml` file MUST fully specify generation settings and MUST be deterministic.
      A minimal example:
      ```yaml
      # <repo_root>/docs/schema/v1/config.yaml
      package: api
      generate:
        chi-server: true
        models: true
        embedded-spec: true
      output: internal/api/v1/api.gen.go
      ```
      - `package` MUST match the target Go package name.
      - `output` MUST be backend-relative (e.g. `internal/api/v1/api.gen.go`) and MUST be committed to the repository
  - Generation MUST NOT rely on implicit defaults.
- Generated code location (backend-relative):
  - Generated server/client/types code MUST be written to:
    - `internal/api/<version>/api.gen.go`
  - The generated file MUST be committed and MUST NOT be manually edited.

- Path/version consistency:
  - `<version>` MUST be of the form `vN` (e.g., `v1`, `v2`).
  - `<version>` MUST match:
    - the route prefix (e.g., `/v1/...`), and
    - the OpenAPI `info.version` major version.

- The OpenAPI spec MUST be the single source of truth for:
  - paths/routes
  - request/response shapes
  - error responses
  - auth schemes (if any)

- Hand-written route definitions MUST NOT introduce endpoints that are not present in the OpenAPI spec.

- Versioning:
  - The API version MUST start at `v1`.
  - The version MUST be reflected in the HTTP surface (e.g., `/v1/...`) and in the OpenAPI `info.version`.
  - The version MUST NOT be bumped unless explicitly requested by the user OR the change is a breaking change.
  - If a breaking change is required without a version bump, the change MUST be rejected and alternatives proposed.

- Validation & compatibility:
  - All incoming requests MUST be validated against the generated types and/or OpenAPI schema.
  - Responses MUST conform to the OpenAPI schema (status codes + body shapes).
  - Backwards-compatible additive changes (new optional fields, new endpoints) SHOULD be preferred over breaking changes.

- Error model:
  - The API MUST define a consistent error envelope (e.g., `{code, message, details}`) and reuse it across endpoints.
  - Validation errors SHOULD be deterministic and include field-level details where appropriate.

- Generation MUST be reproducible via a single repo-root command (e.g., `make generate`).
- CI MUST fail if generated code is out of date.


## backend configuration

Backend configuration is everything that is likely to vary between deploys (dev, staging, production). Configuration is provided via environment variables and parsed once at startup into a typed struct.

- Source of truth:
  - `internal/config` MUST be the single source of truth for configuration.
  - `main()` MUST construct config exactly once and pass it down via dependency injection (no globals).

- Env var access:
  - Code MUST NOT call `os.Getenv` (or equivalents) outside `internal/config`.
  - The project MUST NOT use `godotenv` or any dotenv loader in production code.
  - Tests MAY set env vars in-process to exercise config parsing.

- Parsing & validation:
  - Config MUST be parsed once at startup.
  - Config MUST be validated in `internal/config` and MUST fail fast with a clear error if invalid.
  - All values MUST be cast to their requisite types in `internal/config` (no “stringly typed” config outside the package).
  - Defaults MAY be provided in `internal/config` and MUST be documented.
  - Validation MUST include:
    - presence checks for required values
    - range/format checks (e.g., ports, URLs, durations)
    - cross-field consistency where applicable

- Logging & secrets:
  - Config values MUST NOT be logged verbatim if they may contain secrets (DSNs, API keys, tokens).
  - If configuration is logged for diagnostics, it MUST be redacted (e.g., show host/port but not passwords).

- Operational constraints:
  - Config MUST NOT be loaded lazily after startup (e.g., inside handlers).
  - The `internal/config` package SHOULD document defaulting and validation rules in its package doc comment.
  - If configuration is ever logged for diagnostics, `internal/config` SHOULD expose a redacted representation (e.g., `Config.Redacted()`).

- Required environment variables:
  - `DATABASE_URL` (PostgreSQL DSN)
  - `PORT` (service listen port; a default MAY be provided in `internal/config`)

- Strongly recommended environment variables:
  - `ENV` (e.g., `dev|staging|prod`) to control diagnostics and safer defaults
  - `LOG_LEVEL` (e.g., `debug|info|warn|error`)



## database guidance

This section defines the required persistence stack and its filesystem layout. All paths below are relative to `<repo_root>/backend`.

- Required stack:
  - PostgreSQL driver: `pgx` v5 (`pgxpool`)
  - Query generation: `sqlc` for all query composition
  - Migrations:
    - `github.com/golang-migrate/migrate` MUST be used.
    - The `migrate` CLI from `github.com/golang-migrate/migrate` MUST be used to apply and roll back migrations.
    - No alternative migration framework, library, or custom runner is permitted.

- Forbidden:
  - `database/sql`
  - ORMs (gorm, ent, sqlboiler, etc.)
  - Runtime auto-migrations
  - Raw SQL strings in Go code outside sqlc-managed `.sql` files

- Filesystem layout:
  - DB infrastructure code MUST live under `internal/db/`
  - sqlc-generated code MUST live under `internal/db/queries/`
  - sqlc source queries MUST live under `sql/queries/`
  - Migration files MUST live under `sql/migrations/`
    - Filenames MUST use `NNNNNN_description.up.sql` and `NNNNNN_description.down.sql` pairs.

- Pooling & injection:
  - A single shared `*pgxpool.Pool` MUST be constructed at startup (composition root) and injected into `internal/db`.
  - All DB calls MUST be context-aware.

- Transactions:
  - Services MUST decide transaction boundaries, not HTTP handlers.
  - Transactions MUST be started using `pgxpool.Pool.BeginTx`.
  - Transactions MUST be passed into sqlc via generated `WithTx`.
  - `pgx` transaction types MUST NOT leak outside `internal/db` exported signatures.

- Migration execution model:
  - Migrations MUST be applied via the `migrate` CLI as part of developer workflow and CI/CD pipelines.
  - Migration application MUST be CLI-driven and MUST NOT be embedded in application startup code.
  - The application binary MUST NOT automatically execute migrations at startup.
  - CI MUST fail if pending migrations exist or migration application fails.
  - Down migrations MUST be maintained for each up migration unless explicitly documented as non-reversible.

## testing expectations

Testing is mandatory for non-trivial logic. Tests MUST be deterministic, fast, and isolated.

- General rules:
  - Tests MUST compile and pass locally and in CI.
  - Tests MUST NOT rely on sleeps or timing-based flakiness.
  - Tests MUST NOT depend on external network services.
  - Randomness MUST be seeded deterministically when used.

- Structure:
  - Table-driven tests MUST use slices of test case structs, never maps.
  - For complex validation logic, the test case struct MAY include a validation function.
  - Subtests (`t.Run`) SHOULD be used for clarity when appropriate.

- Scope guidance:
  - Prefer unit tests for services and pure functions.
  - HTTP handler tests SHOULD focus on wiring, validation, and status codes (not full business logic duplication).
  - Database logic SHOULD be tested via repository-level tests using a real test database where practical.
  - Business logic MUST NOT be tested exclusively through HTTP endpoints.

- HTTP testing:
  - Use `net/http/httptest` for handler tests.
  - Handlers MUST be tested with realistic request bodies and headers.
  - JSON comparisons SHOULD avoid brittle string equality; prefer decoding into structs.

- Database testing:
  - Integration tests MAY use a disposable PostgreSQL instance (e.g., containerised) in CI.
  - Tests that touch the database MUST clean up after themselves (transaction rollback or isolated schemas).
  - Migrations MUST be applied in test setup when required.

- Coverage expectations:
  - Non-trivial business logic MUST have direct unit test coverage.
  - Bug fixes MUST include a regression test.
  - Validation rules MUST have explicit test cases.

- Style:
  - Test code MUST follow the same Go style rules as production code.
  - Helper functions SHOULD be local to the test file unless reused widely.

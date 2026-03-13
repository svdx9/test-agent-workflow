---
id: TASK-1
title: Add migrate tool to backend Makefile
status: In Progress
assignee:
  - claude
created_date: '2026-03-13 11:09'
updated_date: '2026-03-13 11:12'
labels:
  - tooling
  - backend
dependencies: []
references:
  - backend/Makefile
  - .claude/skills/go-backend/SKILL.md
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The backend Makefile includes installation targets for air, gofumpt, golangci-lint, and oapi-codegen, but is missing the `migrate` CLI from `github.com/golang-migrate/migrate`. The go-backend skill requires this tool for managing database migrations. This task adds the missing tool target and wires it into the existing tooling setup.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 install-migrate target exists in the Makefile, installs github.com/golang-migrate/migrate CLI into $(TOOLS_BIN) with a pinned version
- [ ] #2 tools-install target includes install-migrate as a dependency
- [ ] #3 make install-migrate completes successfully
- [ ] #4 sql/migrations/ and sql/queries/ directories exist per go-backend skill database layout
- [ ] #5 .gitignore updated to exclude backend/.cache/ and backend/tools/ if not already
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add `MIGRATE_VERSION ?= v4.19.1` alongside other version vars (line ~21)\n2. Add `install-migrate` target after `install-air` (depends on `tools-dir go-cache-dir`), using `-tags 'postgres'` for pgx compatibility\n3. Add `install-migrate` to `tools-install` dependency list\n4. Add `install-migrate` to `.PHONY`\n5. Create `backend/sql/migrations/.gitkeep` and `backend/sql/queries/.gitkeep`\n6. Update root `.gitignore` with `backend/.cache/` and `backend/tools/`
<!-- SECTION:PLAN:END -->

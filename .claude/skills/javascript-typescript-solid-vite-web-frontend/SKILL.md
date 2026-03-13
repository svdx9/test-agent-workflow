---
name: javascript-typescript-solid-vite-web-frontend
description: solidjs + typescript + vite frontend skill for a spa under ./frontend. uses rfc2119 language to enforce deterministic structure, explicit data flow, accessibility, secure defaults, and reproducible tooling. includes extra guidance for non-frontend specialists.
---

## scope

This skill MUST be applied when modifying the solidjs + vite frontend under `./frontend/`, including screens, components, routing, client state, api calls, forms, and styling.

This skill MUST NOT be applied to:
- golang backend code (the go-backend skill MUST be loaded instead)
- infra/ci/deployment manifests (a dedicated infra skill SHOULD be used)

## goals and non-goals

The agent MUST optimize for:
- deterministic file locations and predictable patterns
- type-safe data flow and robust error handling
- accessibility by default
- performance-minded solid patterns (fine-grained reactivity)
- secure handling of untrusted data and secrets

The agent MUST NOT:
- introduce a new ui library, css framework, or state library unless explicitly requested
- introduce global state when local state + props is sufficient
- perform broad refactors unrelated to the task

## repository layout (deterministic)

The frontend root MUST be `./frontend/`.

The following structure MUST exist under `./frontend/` (create it if missing for the task):
- `src/`
  - `app/` (app shell: routes, layout, providers, global wiring)
  - `features/` (feature-first folders; owns ui + api helpers)
  - `shared/` (reusable primitives: small ui atoms, api wrapper, utilities, shared types)
  - `assets/`
  - `styles/` (MAY exist if using global css)
- `index.html`
- `vite.config.ts`
- `tsconfig.json`

New work MUST be placed in `src/features/<feature>/...` unless it is truly shared.

Feature-specific helpers MUST remain inside the owning feature.

`src/shared/` MUST remain small and stable; code MUST NOT be moved into `shared/` unless it is reused across multiple features or is a true cross-cutting primitive.

## approved stack and dependency policy

The implementation MUST use:
- solidjs + typescript
- vite
- fetch for http requests (axios MUST NOT be added unless it already exists in the repo)

Tests SHOULD use:
- vitest
- @solidjs/testing-library

Lint/format tooling MUST follow the repo’s existing choice (eslint/prettier or biome). The agent MUST NOT introduce a new toolchain without explicit request.

The agent MUST NOT add a major dependency without:
- a short justification in the pr description, and
- evidence that browser/solid primitives are insufficient

## solidjs coding standards

### props and reactivity (critical)

Component props MUST be treated as reactive.

The agent MUST NOT destructure props in the function signature if reactivity is required.
- acceptable: `function C(props: Props) { return <div>{props.x}</div> }`
- prohibited when `x` is reactive: `function C({ x }: Props) { return <div>{x}</div> }`

### derived values and side effects

Derived values SHOULD be implemented with `createMemo`.

`createEffect` MUST be used only for side effects (imperative dom, analytics, non-resource async). The agent MUST NOT use `createEffect` as a primary mechanism for data fetching when `createResource` is appropriate.

The agent SHOULD avoid “sync signal from props” effects. If unavoidable, the effect MUST be documented inline with rationale.

### rendering patterns

Conditional rendering MUST use:
- `<Show when={cond} fallback={...}>...</Show>` for simple branches, or
- `<Switch><Match when=...>...</Match></Switch>` for multi-branch

Lists MUST use:
- `<For each={items()} fallback={...}>...</For>`

Screens that load data asynchronously MUST provide:
- a loading state
- an error state with a retry affordance
- an empty state when the resulting dataset can be empty

### performance guardrails

The agent MUST NOT store derived state in signals; it MUST be derived via `createMemo` or direct computation in render.

Expensive computations used by `<For>` SHOULD be memoized (e.g., `createMemo(() => ...)`).

## state management

The agent MUST use the simplest viable state mechanism in this order:
1. local state via `createSignal`
2. lifted state via props to the nearest common parent
3. feature-level store via `createStore` and/or `createContext` when multiple siblings require shared state

A global app store MUST NOT be introduced unless explicitly requested.

Context providers SHOULD live in `frontend/src/app/providers/` (or `frontend/src/app/` for very small apps).

## routing

The agent MUST use the router already present in the repo.

If routing is required and no router exists, the agent SHOULD use `@solidjs/router`.

Routes MUST be defined in `frontend/src/app/routes.tsx` (single source of truth).

Route components MUST be implemented as feature screens at:
- `frontend/src/features/<feature>/screens/<screen>.tsx`

Route params MUST be parsed/validated; they MUST NOT be treated as trusted strings by default.

## api and data fetching

### module locations

Feature-specific api modules MUST live at:
- `frontend/src/features/<feature>/api/`

Shared api plumbing MUST live at:
- `frontend/src/shared/api/`

### fetch wrapper (recommended)

The repo SHOULD implement a small shared fetch wrapper that:
- reads base url from `import.meta.env`
- sets `accept: application/json`
- parses json safely (including empty bodies)
- converts non-2xx responses into typed errors
- supports cancellation via `AbortController`

Requests MUST NOT fail silently. Each request MUST have explicit loading/success/error handling.

The agent MUST NOT log secrets or tokens.

Bearer tokens MUST NOT be stored in localstorage unless explicitly required. Http-only cookies SHOULD be preferred when supported by the backend.

### solid integration

Data fetching driven by reactive inputs SHOULD use `createResource`.

Render logic MUST use:
- loading: `resource.loading`
- error: `resource.error`
- data: `resource()`

Mutations MUST be triggered from event handlers. Optimistic updates MAY be used only if a safe rollback strategy exists; otherwise the agent SHOULD refetch/invalidate.

## forms and validation

Forms MUST use native semantics first (label, name, required, fieldset where appropriate).

Client-side validation SHOULD be minimal (required + basic format). Server-side validation MUST be treated as authoritative.

The UI MUST:
- show field-level errors when possible
- show a top-level submit error summary on failure
- disable submit while submitting
- prevent double-submit (ignore while pending)

## styling

The agent MUST follow the repo’s existing styling approach and MUST NOT introduce a new styling system.

If css modules are present, they SHOULD be preferred for new components.

Selectors MUST NOT be overly deep; class names SHOULD be semantic.

## accessibility (required)

Every input MUST have an associated `<label>` or an `aria-label`.

All interactive controls MUST be keyboard accessible.

The agent MUST use semantic elements (`<button>`, `<a>`) and MUST NOT use `div`/`span` with click handlers as primary controls.

Focus styles MUST remain visible.

For icons/images:
- decorative icons MUST use `aria-hidden="true"`
- meaningful images MUST provide correct `alt` text

Any modal/dialog implemented by the agent MUST trap focus and MUST be dismissible via escape; if the repo has an existing modal primitive, it SHOULD be used.

## security defaults

All backend data MUST be treated as untrusted.

The agent MUST NOT inject raw html (no `dangerouslySetInnerHTML`).

The agent MUST NOT interpolate untrusted strings into:
- `style=` attributes
- `href=` without protocol validation

Secrets MUST NOT be committed. Configuration MUST use `import.meta.env` for non-secret values only.

Debug logging MAY be used only under `import.meta.env.DEV` and MUST NOT include tokens or sensitive payloads.

## error handling and user feedback

Each screen that can fail MUST provide an error state with a retry option.

User-facing errors MUST be actionable and MUST NOT expose stack traces or raw backend dumps.

## testing (vitest)

New pure logic (parsing/mapping/validation) MUST include unit tests.

Components/screens with conditional rendering SHOULD include component tests.

Tests MUST be colocated as `*.test.ts` / `*.test.tsx` near the module unless the repo uses a central test folder.

Tests MUST assert user-visible behavior, not signal implementation details.

Tests MUST NOT use sleeps; they SHOULD use fake timers where timing matters.

## tooling and commands (deterministic)

The agent MUST use scripts defined in `frontend/package.json`. The agent MUST NOT assume global tool installs.

If scripts are missing and required for the task, the agent MAY add:
- `dev`: vite dev server
- `build`: production build
- `test`: vitest
- `lint`: eslint/biome
- `format`: prettier/biome

## change discipline

Diffs MUST be kept small and task-scoped. Drive-by refactors MUST NOT be performed.

When introducing a new module, the agent MUST explain why it belongs in `shared/` versus `features/<feature>/`.

Bug fixes and non-trivial logic changes MUST include or update tests.

## reference loading (optional)

If security references exist under `./references/` relative to this file, the agent SHOULD load:
- `javascript-typescript-solid-web-frontend-security.md`
- `javascript-general-web-frontend-security.md`

Loading order MUST be:
- framework-specific reference first
- general web frontend reference second
- if none exist, proceed using the secure defaults in this file

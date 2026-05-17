# Plan: Context Drop

> Source PRD: `plans/context-drop.md` (see also `CONTEXT.md` glossary entry "Context Drop" and `docs/adr/0001-context-drop-lifecycle.md`)

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**:
  - `/api/mcp` — remote HTTP MCP endpoint exposing the `create_drop` tool
  - `/h/[id]` — branded raw-markdown serve route (the Drop Link); the app owns this, not the raw Blob URL
  - `/tools/context-drop` — dashboard page, following the existing `app/tools/<slug>/page.tsx` pattern, with a matching entry in `lib/tools-config.ts`
- **Storage**: Vercel Blob. A store wrapper calls the Vercel Blob SDK directly — no storage-port abstraction (deliberate simplification; store is integration-level, not unit-tested).
- **Key models**: a Context Drop = `{ id, markdown, title?, createdAt }`. `markdown` is stored and served byte-for-byte verbatim. `title` is sidecar metadata, never injected into the served body.
- **Identity**: `id` is 128-bit cryptographically random, base64url-encoded (~22 chars). The id-as-URL is a capability and the sole, permanent access gate — no expiry, no auth.
- **MCP surface**: exactly one tool, `create_drop(markdown: string, title?: string) → { id: string, url: string }`. No get/list/update/delete tools. Receiving agents only fetch the URL.
- **Serve contract**: `/h/[id]` returns stored markdown verbatim with `Content-Type: text/plain; charset=utf-8`, `X-Content-Type-Options: nosniff`, `Content-Disposition: inline`. Unknown id → 404.
- **Lifecycle / access**: no expiry; create path open/unauthenticated (v1, risk accepted); no API delete or update; management (list + delete) only when running in dev/localhost, disabled in production.
- **Size**: only the Vercel platform ceiling (4.5 MB request and response, not configurable) is enforced; oversize create returns an actionable "summarize, not a dump" error. No smaller product cap.
- **Testing**: Vitest (`pnpm test`). No prior app-level tests exist — these are the first. Only the pure modules are unit-tested: create-input validation and the id generator.

---

## Phase 1: Storage + raw serve tracer

**User stories**: 4, 6, 7, 14, 15, 16; 18 (id generator portion)

### What to build

The end-to-end read path before any public create surface exists. Generate a 128-bit base64url id, persist a Context Drop (markdown + optional title metadata + createdAt) to Vercel Blob via the store wrapper, and serve it back at `/h/[id]` as verbatim markdown with the hardened response headers. Unknown ids return 404. A Drop is placed for verification via an internal store call (a script or test), so the read path is demoable by `curl` against `/h/[id]` without MCP yet. Unit tests cover the id generator.

### Acceptance criteria

- [ ] An internal store call persists a Drop to Vercel Blob and returns a 128-bit base64url id
- [ ] `GET /h/{id}` returns the stored markdown byte-for-byte identical to what was stored
- [ ] Response sets `Content-Type: text/plain; charset=utf-8`, `X-Content-Type-Options: nosniff`, `Content-Disposition: inline`
- [ ] A Drop whose markdown contains `<script>`/HTML is returned as inert text (browser shows source, does not execute)
- [ ] `GET /h/{unknown-id}` returns 404
- [ ] `title` is stored as sidecar metadata and does not appear in the served body
- [ ] Unit tests: id generator produces correct length/base64url charset, no collisions across a large iteration count, values drawn from a cryptographic source
- [ ] Read path is demonstrable end-to-end via `curl` after an internal seed

---

## Phase 2: MCP `create_drop` endpoint

**User stories**: 1, 2, 3, 5, 13; 18 (validation portion)

### What to build

The real agent-facing create surface. `/api/mcp` exposes a single MCP tool `create_drop(markdown, title?)`. Submissions pass through pure input validation (non-empty markdown; within the 4.5 MB ceiling, otherwise an actionable "summarize — a Context Drop is a handoff, not a dump" error; title normalized), then the Phase 1 store, returning `{ id, url }` where `url` is the `/h/{id}` Drop Link. This closes the full loop: a producing agent calls `create_drop`, receives a link, and a receiving agent (needing nothing but fetch) retrieves verbatim markdown. Unit tests cover create-input validation.

### Acceptance criteria

- [ ] `/api/mcp` is reachable as a remote HTTP MCP endpoint and advertises exactly the `create_drop` tool
- [ ] `create_drop(markdown)` stores the Drop and returns `{ id, url }` with `url` pointing at `/h/{id}`
- [ ] `create_drop(markdown, title)` records the title as sidecar metadata only
- [ ] Empty/whitespace-only markdown is rejected with a clear error
- [ ] Markdown exceeding the 4.5 MB ceiling is rejected with the actionable summarize-not-dump message
- [ ] A full round-trip works: `create_drop` → returned `url` fetched by a plain HTTP client → verbatim markdown, with no MCP server needed on the receiving side
- [ ] Unit tests: validation rejects empty and oversize input, accepts valid input at/below the boundary, normalizes title (present/absent/empty), never injects title into the body

---

## Phase 3: Dashboard page + config entry

**User stories**: 8, 9, 17

### What to build

A "Context Drop" entry in `lib/tools-config.ts` and a `/tools/context-drop` page following the existing tool-page pattern. The page explains what a Context Drop is and is not (curated handoff, not a codebase dump) and displays the exact MCP server configuration a developer pastes into an agent to enable `create_drop`. Keeps the feature inside the one deployable. No composer.

### Acceptance criteria

- [ ] A "Context Drop" tool appears in the dashboard tool list via `tools-config`
- [ ] `/tools/context-drop` renders an explanation of the feature and its intended (non-dump) use
- [ ] The page shows copy-pasteable MCP server configuration pointing at `/api/mcp`
- [ ] The page is consistent with existing dashboard tool pages (layout, components)

---

## Phase 4: Dev-only management UI

**User stories**: 10, 11, 12

### What to build

A pure management guard predicate that is true only in dev/localhost and false in production, gating a list + delete UI rendered on the `/tools/context-drop` page. In dev, an operator can list existing Drops (id, title, createdAt) and delete one. In production the management UI is entirely absent and no delete path is reachable.

### Acceptance criteria

- [ ] Management guard returns true in dev/localhost and false in production
- [ ] When enabled, the page lists existing Drops with id, title, and createdAt
- [ ] When enabled, an operator can delete a specific Drop and it is removed from Blob and no longer served at `/h/{id}`
- [ ] When disabled (production), the list/delete UI does not render and no delete operation is reachable from the deployed site
- [ ] No enumeration or delete capability is exposed via `/api/mcp` or `/h/[id]`

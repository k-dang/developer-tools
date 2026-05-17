# Context Drop — PRD

## Problem Statement

When work moves from one AI coding agent to another (a new session, a different tool, a teammate's agent, or a human picking up where an agent left off), the receiving side starts cold. The "why" — the task, the decisions already made, the constraints, the open questions — lives in a conversation that the next agent cannot see. Today the only options are pasting walls of text between tools (lossy, bloated, easily truncated) or re-deriving context from scratch (slow, error-prone). There is no lightweight, durable way for one agent to publish curated context and hand a single link to whoever picks up the task.

## Solution

A **Context Drop**: a single markdown artifact one agent submits and another agent (or a human) retrieves at a unique, permanent link served as raw markdown.

The producing agent uses a small MCP server (hosted inside this developer-tools app) that exposes one tool, `create_drop`. It submits curated handoff markdown and gets back a Drop Link. Anyone — most importantly another coding agent — can fetch that link and receive the markdown verbatim, with no rendering, no auth, and nothing else needed on the receiving side. The receiving agent does not need the MCP server at all; it just fetches a URL.

The dashboard gains a "Context Drop" page that explains the feature, shows the MCP configuration to paste into an agent, and (only when running locally) lets the operator list and delete Drops.

## User Stories

1. As a producing coding agent, I want to submit a markdown handoff via a single MCP tool call, so that I can capture context without bespoke plumbing.
2. As a producing coding agent, I want the create call to return a single URL, so that I can hand off context by sharing just that link.
3. As a producing coding agent, I want to optionally attach a title to a Drop, so that a human can later tell Drops apart in the management view.
4. As a receiving coding agent, I want to fetch a Drop Link and get pure markdown, so that I can ingest the context without parsing HTML or DOM noise.
5. As a receiving coding agent, I want to retrieve a Drop without installing or configuring the MCP server, so that picking up a handoff requires nothing but the ability to fetch a URL.
6. As a human reviewer, I want to open a Drop Link in a browser and see the literal markdown source, so that I can sanity-check what an agent was handed.
7. As a human reviewer, I want a Drop Link to never execute scripts or render as a web page, so that opening an untrusted link is safe.
8. As a developer integrating an agent, I want a dashboard page that shows the exact MCP server configuration, so that I can wire up `create_drop` quickly.
9. As a developer, I want the dashboard page to explain what a Context Drop is and is not, so that agents are pointed at curated handoffs rather than codebase dumps.
10. As an operator running the app locally, I want to list existing Drops, so that I can review what has accumulated.
11. As an operator running the app locally, I want to delete a Drop, so that I can clean up stale or sensitive handoffs.
12. As an operator, I want the management list/delete UI to be unavailable in production, so that the public deployment never exposes or allows deletion of everyone's handoffs.
13. As a producing agent, I want a clear error when my submission exceeds the platform size ceiling, so that I know to summarize rather than dump.
14. As a producing agent, I want each Drop to have an unguessable URL, so that a Drop is not discoverable by enumeration.
15. As a security-conscious operator, I want Drops served with a content type that browsers never execute, so that a malicious Drop cannot run script on the app's origin.
16. As a receiving agent, I want a missing or unknown Drop Link to return a clear not-found response, so that I can distinguish "expired/deleted" from "broken".
17. As a maintainer, I want the feature to live inside the existing Next.js app, so that there is one deployable and no separate service to operate.
18. As a maintainer, I want the size/validation and id-generation logic isolated as pure functions, so that the riskiest behavior is unit-tested.

## Implementation Decisions

**Topology**
- The feature lives inside the existing Next.js app — its first backend. No separate service.
- The MCP server is exposed as a remote HTTP endpoint at an API route (`/api/mcp`).
- Persistence is Vercel Blob. The store wrapper calls the Vercel Blob SDK directly (no storage-port abstraction — deliberately simpler; the store is therefore integration-level, not unit-tested).

**MCP surface**
- Exactly one tool: `create_drop(markdown: string, title?: string) → { id: string, url: string }`.
- No `get`/`update`/`delete`/`list` tools. Retrieval is "fetch the URL"; deletion is dev-only UI.
- The receiving agent needs nothing from the MCP server.

**Drop identity**
- `id` is 128-bit cryptographically random, base64url-encoded (~22 chars).
- The id-as-URL is a capability and the sole, permanent access gate (no expiry, no auth).

**Link & response contract**
- The Drop Link is a branded route the app owns: `/h/{id}`. Not the raw Vercel Blob URL.
- `/h/{id}` returns the stored markdown **verbatim** (no injected heading or frontmatter).
- Response headers: `Content-Type: text/plain; charset=utf-8`, `X-Content-Type-Options: nosniff`, `Content-Disposition: inline`. Browsers display literal source and never execute embedded HTML/JS.
- Unknown id → 404 (clear not-found).

**Title handling**
- `title` is sidecar metadata only, stored alongside the Drop. It is shown in the dev-only management list. It is never written into the served markdown body.

**Lifecycle & access** (recorded in `docs/adr/0001-context-drop-lifecycle.md`)
- No expiry. Drops are permanent and immutable in production.
- No API delete or update. Management (list + delete) is available only when the app runs in dev/localhost; it is disabled in production. Production cleanup requires an operator running locally against the prod Blob store.
- Create path is open/unauthenticated for v1; the abuse risk is explicitly accepted.

**Size**
- The only hard limit is the Vercel platform ceiling: 4.5 MB on both the create request body and the read response body (not configurable).
- `create_drop` rejects oversized submissions with a clear, actionable error message ("summarize; a Context Drop is a handoff, not a dump").
- No smaller product cap is enforced. The "curated, not a codebase dump" framing is a documented usage convention in `CONTEXT.md`, not a v1-enforced rule.
- Consequence accepted: a Drop larger than 4.5 MB cannot be served through the owned `/h/{id}` proxy and would be permanently unreadable. Client uploads were considered and rejected — they bypass only the write limit, not the owned read proxy.

**Dashboard surface**
- A new "Context Drop" entry in `tools-config` and a corresponding page.
- The page explains the feature, shows the MCP server configuration to paste into an agent, and hosts the dev-only management UI. No manual composer in v1.

**Modules**
- *Create-input validation* — pure: non-empty markdown, within the 4.5 MB ceiling, optional title normalization → typed ok/error result.
- *Drop id generator* — pure: 128-bit base64url id.
- *Management guard* — pure predicate: management enabled only in dev/localhost.
- *Drop store* — thin wrapper over the Vercel Blob SDK: create / get / list / delete. Integration-level.
- *MCP endpoint adapter* (`/api/mcp`) — maps the `create_drop` tool to validation + store.
- *Raw serve route* (`/h/[id]`) — store lookup + the hardened response headers + 404.
- *Dashboard page* — info + MCP config + dev-only manage UI; plus the `tools-config` entry.

## Testing Decisions

A good test here exercises **external behavior** through a module's public interface and asserts observable outcomes — not internal structure, private helpers, or call sequencing. Tests should remain green if the implementation is refactored without changing behavior. There is no prior art in this repo (Vitest is configured via `pnpm test`, but no app-level tests exist yet); these are the first.

Modules to be tested (pure units only — chosen because they hold the riskiest behavior and need no Blob/Next harness):

- **Create-input validation**
  - Rejects empty / whitespace-only markdown.
  - Rejects markdown exceeding the 4.5 MB ceiling, with the error surfacing the actionable message.
  - Accepts valid markdown at and below the boundary.
  - Handles `title`: present, absent, empty — normalized as specified, never injected into the body.
- **Drop id generator**
  - Produces ids of the expected length and base64url character set.
  - No collisions across a large iteration count.
  - Draws from a cryptographic random source (distinct values, no obvious patterning).

Explicitly **not** unit-tested in v1: the Drop store (integration-level, hits Blob), the `/api/mcp` adapter, the `/h/[id]` serve route and its headers, and the management guard. Their behavior is specified above and verified manually/by integration as needed; they were deliberately left out of automated scope per the testing decision.

## Out of Scope

- Expiry / TTL, scheduled cleanup, or any automatic reclamation of Drops.
- API-driven delete or update of a Drop; production-side deletion of any kind.
- Authentication, accounts, ownership, per-agent keys, or rate limiting on create.
- A `get_drop`/`list_drops`/`update_drop` MCP tool.
- A manual browser-based handoff composer.
- A rendered/HTML view of a Drop or any markdown rendering of the served content.
- A smaller product size cap or chunked/batched ("append") submission for >4.5 MB content.
- Client-side direct-to-Blob uploads.
- A storage-port abstraction making the store unit-testable.
- Enumeration/discovery of Drops anywhere in production.

## Further Notes

- The originating term and full design tree are captured in `CONTEXT.md` (glossary entry "Context Drop") and `docs/adr/0001-context-drop-lifecycle.md` (lifecycle/access decision with considered alternatives and consequences).
- Vercel platform facts sourced from current (Feb 2026) Vercel docs: request and response body limits are each 4.5 MB and not configurable; exceeding returns `413 FUNCTION_PAYLOAD_TOO_LARGE`.
- The sharpest standing risk to keep visible during implementation: permanence + open create + no production delete + a read proxy hard-capped at 4.5 MB. A >4.5 MB Drop is writable but permanently unreadable, and nothing is reclaimable except by an operator running locally. This is intentional for v1 and recorded in the ADR.

# ADR 004: REST API with Lovable Cloud Backend

**Status:** Accepted
**Date:** 2026-02-14
**Deciders:** Loki Mode Autonomous Agent

## Context

Still requires a backend for data persistence, auth, and real-time sync. PRD specifies Lovable Cloud as the backend provider.

## Decision

Use **Lovable Cloud** with REST API (defined in OpenAPI spec) and WebSocket for real-time sync.

## Rationale

**Why Lovable Cloud:**
- PRD requirement (specified by project scope)
- Managed infrastructure
- Built-in auth, database, real-time sync
- No backend code to maintain

**Why REST over GraphQL:**
- Simpler for this use case (CRUD operations)
- Better caching (HTTP semantics)
- OpenAPI spec for documentation
- Less client bundle size

**Why WebSocket for sync:**
- Bi-directional real-time updates
- Low latency for note edits
- Standard protocol

## API Design

**Endpoints:**
- `/auth/*` - Authentication
- `/notes/*` - Private notes CRUD
- `/links/*` - Link parsing and management
- `/search` - Full-text search
- `/graph` - Graph data
- `/published/*` - Publishing (some public, some authenticated)
- `/attachments/*` - Fork/attach operations
- `/ws` - WebSocket connection

**Auth:**
- Bearer token (JWT) in Authorization header
- Token stored in localStorage
- Auto-refresh on 401

## Consequences

**Positive:**
- No backend maintenance
- Scales automatically
- Focus on frontend development
- Built-in security (Lovable handles)

**Negative:**
- Vendor lock-in to Lovable Cloud
- Less control over backend logic
- Potential cost at scale

## Offline Strategy (Future)

- IndexedDB for local storage
- Sync queue for offline edits
- Conflict resolution UI

## References

- OpenAPI spec: `.loki/specs/openapi.yaml`
- API client: `src/lib/api.ts`

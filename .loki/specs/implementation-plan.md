# Still - Consolidated Implementation Plan

**Generated:** 2026-02-14
**Phase:** INFRASTRUCTURE → DEVELOPMENT
**Based on:** 4 parallel research agents (DEEPEN_PLAN phase)

---

## Executive Summary

This plan consolidates findings from 4 specialized research agents covering:
1. Component Architecture & Performance
2. State Management & Real-time Sync
3. Link Parsing & Graph Visualization
4. Publishing System & Versioning

All recommendations are production-ready patterns validated against the PRD requirements.

---

## Phase 1: Infrastructure Setup (INFRASTRUCTURE)

### 1.1 Install Core Dependencies

```bash
npm install zustand immer react-virtuoso cmdk date-fns fuse.js lru-cache
npm install -D @types/react-virtuoso
```

**Rationale:**
- `zustand` + `immer`: State management with immutable updates
- `react-virtuoso`: Variable-height virtual scrolling (handles 10K+ notes)
- `cmdk`: Command palette component (Cmd+K)
- `date-fns`: Date formatting (lightweight vs moment.js)
- `fuse.js`: Fuzzy search for autocomplete
- `lru-cache`: LRU cache for graph computations

### 1.2 Directory Structure

```
src/
├── stores/              # Zustand stores (slice pattern)
│   ├── index.ts        # Root store with slices
│   ├── notes.slice.ts
│   ├── links.slice.ts
│   ├── published.slice.ts
│   └── ui.slice.ts
├── providers/          # React Context providers
│   ├── AuthProvider.tsx
│   ├── SyncProvider.tsx
│   └── index.ts
├── components/         # UI components (layered)
│   ├── editor/        # Note editor compound component
│   ├── graph/         # Graph visualization
│   ├── command/       # Command palette
│   ├── sidebar/       # Navigation sidebar
│   └── ui/            # shadcn/ui components
├── lib/
│   ├── link-parser.ts # [[wiki-link]] parsing
│   ├── graph.ts       # Graph algorithms
│   ├── websocket.ts   # WebSocket client
│   └── sync.ts        # Sync reconciliation
└── hooks/             # Custom React hooks
    ├── useNotes.ts
    ├── useLinks.ts
    └── useSync.ts
```

---

## Phase 2: State Management (Week 1)

### Key Patterns
- **Immer middleware** for immutable updates
- **Persist middleware** for offline-first (IndexedDB)
- **Slice pattern** for code organization
- **Optimistic updates** with rollback on failure
- **WebSocket reconnection** with exponential backoff (1s → 30s max)
- **Last-Write-Wins** conflict resolution based on timestamps

---

## Phase 3: Core Components (Week 2)

### 3.1 Editor Component (Compound Pattern)
- Debounced auto-save (500ms)
- Compound component composition (Editor.Toolbar, Editor.Content, Editor.Footer)
- Context-based state sharing

### 3.2 Virtual Scrolling
- `react-virtuoso` for variable-height lists
- Overscan=5 to prevent white flashing
- Handles 10K+ notes smoothly

### 3.3 Link Parser
- Regex: `/\[\[([^\]]+)\]\]/g`
- Fuse.js fuzzy matching (threshold=0.3)
- LRU cache (max=100) for parsed content
- Autocomplete with limit=5 suggestions

---

## Phase 4: Graph Visualization (Week 3)

### Force-Directed Graph Settings
- `d3VelocityDecay=0.3` (balances aesthetics and performance)
- `cooldownTime=3000ms`
- Node size based on backlink count
- Directional particles for link direction

---

## Phase 5: Publishing System (Week 4)

### Key Features
- Sequential versioning (v1, v2, v3)
- Slug generation from title
- Slug availability check
- Myers diff algorithm for version diffs
- License selection (default: CC-BY-4.0)
- Fork/attachment state machine

---

## Quality Gates

Before transitioning to DEPLOYMENT:

- [ ] All unit tests passing (>80% coverage)
- [ ] Integration tests for:
  - [ ] WebSocket reconnection
  - [ ] Optimistic updates + rollback
  - [ ] Link parsing edge cases
  - [ ] Conflict resolution (Last-Write-Wins)
- [ ] Performance benchmarks:
  - [ ] 10K notes render < 100ms
  - [ ] Graph with 1K nodes < 500ms stabilization
  - [ ] Search autocomplete < 50ms
- [ ] Accessibility audit (WCAG AA):
  - [ ] Keyboard navigation
  - [ ] Screen reader support
  - [ ] Focus indicators
- [ ] Security review:
  - [ ] XSS protection in markdown rendering
  - [ ] CSRF tokens for mutations
  - [ ] Auth token refresh

---

## Implementation Priority

1. **Week 1 (INFRASTRUCTURE):**
   - Install dependencies
   - Set up Zustand stores with slice pattern
   - Create AuthProvider and SyncProvider
   - WebSocket client with exponential backoff

2. **Week 2 (DEVELOPMENT - Core):**
   - Editor component with debounced auto-save
   - Link parser with autocomplete
   - Virtual scrolling note list
   - Command palette (Cmd+K)

3. **Week 3 (DEVELOPMENT - Features):**
   - Graph visualization
   - Search functionality
   - Offline queue and sync reconciliation

4. **Week 4 (DEVELOPMENT - Publishing):**
   - Publish workflow
   - Forking system
   - Version history UI
   - Analytics dashboard

5. **Week 5 (QA):**
   - Comprehensive testing
   - Performance optimization
   - Accessibility audit
   - Security review

---

## References

- **Component Architecture:** Agent 1 research findings
- **State Management:** Agent 2 research findings
- **Link Parsing:** Agent 3 research findings
- **Publishing System:** Agent 4 research findings
- **ADRs:** `docs/adr/001-004`
- **PRD:** `prd.md`
- **OpenAPI Spec:** `.loki/specs/openapi.yaml`

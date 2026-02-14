# Still - Requirements Specification

## User Stories

### Epic 1: Core Writing Experience
- **US-001**: As a writer, I want to open the app and immediately start writing, so I can capture thoughts without friction
  - AC: App loads with cursor focused in editor
  - AC: No persistent logo/branding visible
  - AC: Max 680px content width, centered
  - Priority: Critical

- **US-002**: As a user, I want the UI to feel invisible, so I can focus on my thoughts
  - AC: Minimal visual elements (no dashboard, no cards)
  - AC: Typography-led design
  - AC: Transitions <220ms, opacity-only hover states
  - Priority: Critical

- **US-003**: As a writer, I want to create and link notes using [[Note Title]] syntax, so I can build connections naturally
  - AC: Real-time parsing of [[link]] syntax
  - AC: Autocomplete suggestions for existing notes
  - AC: Create new note if link target doesn't exist
  - Priority: Critical

### Epic 2: Navigation & Discovery
- **US-004**: As a user, I want to quickly find any note using CMD/CTRL+K, so I can recall ideas instantly
  - AC: Overlay command palette on CMD/CTRL+K
  - AC: Fuzzy search across all note titles and content
  - AC: "Create new note" option always visible
  - Priority: High

- **US-005**: As a user, I want to see backlinks to the current note, so I understand context
  - AC: Backlinks list appears at bottom of note
  - AC: Simple text list (no heavy cards)
  - AC: Click backlink to navigate
  - Priority: High

- **US-006**: As a visual thinker, I want to see my notes as a graph, so I can understand connections
  - AC: Keyboard shortcut toggles graph view
  - AC: Monochrome nodes/edges
  - AC: Smooth zoom/pan with calm easing
  - AC: Click node to open note
  - Priority: Medium

### Epic 3: Publishing & Collaboration
- **US-007**: As a creator, I want to publish individual notes or subgraphs, so I can share knowledge
  - AC: Explicit publish action (never accidental)
  - AC: Choose public or unlisted
  - AC: Select single note, folder, or graph subset
  - AC: Published view shows title, content, links, optional backlinks/graph
  - Priority: Critical

- **US-008**: As a reader, I want to attach published notes to my graph, so I can build on others' ideas
  - AC: "Attach to my graph" button on published notes
  - AC: Two modes: Linked Attachment (synced) or Forked Copy (independent)
  - AC: Attribution preserved (author, source link, timestamp)
  - Priority: Critical

- **US-009**: As an author, I want to version my published notes, so readers can get updates
  - AC: New version created on each publish update
  - AC: Version history visible (v1, v2, etc.)
  - AC: Linked attachments show "Update available" indicator (subtle, dismissible)
  - AC: Pull updates is explicit (never auto-merge)
  - Priority: High

### Epic 4: Privacy & Permissions
- **US-010**: As a privacy-conscious user, I want all notes private by default, so I control what's shared
  - AC: New notes are private
  - AC: Explicit action required to publish
  - AC: Clear visual indicator of publication status
  - Priority: Critical

- **US-011**: As an author, I want to set licenses on published content, so I control usage
  - AC: "Allow forks" toggle
  - AC: "Require attribution" always on
  - AC: Simple license selector (no legal jargon)
  - Priority: Medium

### Epic 5: Optional AI
- **US-012**: As a user, I want optional AI suggestions, so I can discover connections (opt-in only)
  - AC: AI features disabled by default
  - AC: Suggest related notes while writing (one-line hint)
  - AC: Summaries only when requested
  - AC: Suggest "related published notes" for published content
  - Priority: Low

## Functional Requirements

### F-001: Note Management
- CRUD operations for notes
- Auto-save on edit (debounced)
- Markdown support (title + body)
- Timestamp tracking (created, updated)

### F-002: Linking System
- Parse [[Note Title]] syntax in real-time
- Maintain bidirectional link index
- Generate backlinks automatically
- Handle link updates when note titles change

### F-003: Search
- Full-text search across all notes
- Fuzzy matching on titles
- Search results ranked by relevance
- Create note from search query

### F-004: Graph Visualization
- Force-directed layout algorithm
- Render nodes (notes) and edges (links)
- Interactive pan/zoom
- Performance: handle 1000+ nodes

### F-005: Publishing
- Publish individual notes
- Publish folders/collections
- Publish selected subgraph
- Generate shareable URLs
- Public/unlisted visibility options

### F-006: Forking/Attachment
- Attach published note as reference (read-only)
- Fork published note as editable copy
- Track attribution metadata
- Sync mechanism for linked attachments
- Version comparison for updates

### F-007: Authentication
- Email/password registration/login
- Optional Google OAuth
- Session management
- Password reset flow

### F-008: Data Sync
- Real-time sync with Lovable Cloud
- Offline support with conflict resolution
- Multi-device sync
- Local-first architecture

## Non-Functional Requirements

### Performance
- **NFR-001**: Initial load <2s on 3G
- **NFR-002**: Note switch <100ms
- **NFR-003**: Search results <200ms
- **NFR-004**: Graph render <500ms for 1000 nodes

### Design
- **NFR-005**: WCAG AA contrast minimum
- **NFR-006**: Keyboard-first navigation
- **NFR-007**: Focus rings visible but subtle
- **NFR-008**: Typography scale: 26px/16px/13px
- **NFR-009**: Max writing width 680px
- **NFR-010**: Motion: 180-220ms fades only

### Security
- **NFR-011**: Notes private by default
- **NFR-012**: HTTPS only
- **NFR-013**: Secure token storage
- **NFR-014**: Content moderation for published notes

### Scalability
- **NFR-015**: Support 10,000+ notes per user
- **NFR-016**: Support 100,000+ links per user
- **NFR-017**: Published notes CDN-cached

## Technical Requirements

### Frontend
- React 18+ with TypeScript
- Vite for build tooling
- Tailwind CSS + shadcn/ui
- React Router for navigation
- State management (TBD: Zustand/Jotai)
- Graph library (TBD: D3/vis.js/react-force-graph)

### Backend
- Lovable Cloud integration
- REST API (OpenAPI spec required)
- WebSocket for real-time sync
- PostgreSQL for relational data
- Object storage for attachments (future)

### Infrastructure
- Edge CDN for published content
- Real-time database sync
- Serverless functions
- OAuth provider integration

## Success Criteria

### Phase 1 (MVP)
- ✅ Core writing surface functional
- ✅ [[Link]] syntax working with backlinks
- ✅ Command palette search
- ✅ Basic graph visualization
- ✅ Auth (email/password)

### Phase 2 (Publishing)
- ✅ Publish individual notes
- ✅ Attach/fork mechanism
- ✅ Attribution tracking
- ✅ Versioning system

### Phase 3 (Polish)
- ✅ Performance optimizations
- ✅ Offline support
- ✅ Multi-device sync
- ✅ AI suggestions (opt-in)

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Graph performance degrades with scale | High | Medium | Implement virtualization, limit visible nodes, optimize layout algorithm |
| Link parsing conflicts with Markdown | Medium | Low | Escape syntax, clear precedence rules |
| Sync conflicts on multi-device edits | High | High | CRDT or last-write-wins with conflict UI |
| Forking creates orphaned references | Medium | Medium | Reference integrity checks, cascade updates |
| Published content moderation | High | Medium | Report mechanism, admin review queue |

## Dependencies

### External
- Lovable Cloud availability
- OAuth provider uptime (Google)

### Internal
- Design system completion
- API specification finalization
- Component library setup

## Out of Scope (v1)

- Mobile apps (web-responsive only)
- Rich media embeds (images/video)
- Team workspaces
- Fine-grained permissions
- Export to PDF/DOCX
- API access for developers

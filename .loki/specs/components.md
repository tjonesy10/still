# Still - Component Architecture

## Component Hierarchy

```
App
├── AuthProvider (context)
├── SyncProvider (context)
├── Router
│   ├── AuthLayout
│   │   ├── LoginPage
│   │   └── RegisterPage
│   └── AppLayout
│       ├── Sidebar (collapsible)
│       │   ├── Logo
│       │   ├── SearchTrigger
│       │   ├── NotesList
│       │   │   └── NoteListItem[]
│       │   └── UserMenu
│       ├── MainContent (routes)
│       │   ├── EditorPage
│       │   │   ├── Editor
│       │   │   │   ├── TitleInput
│       │   │   │   ├── ContentEditor
│       │   │   │   └── BacklinksList
│       │   │   └── PublishButton
│       │   ├── GraphPage
│       │   │   └── GraphView
│       │   └── PublishedNotePage (public)
│       │       ├── PublishedNoteHeader
│       │       ├── PublishedNoteContent
│       │       ├── AttachButton
│       │       └── VersionHistory
│       └── CommandPalette (overlay)
│           ├── SearchInput
│           └── CommandResults
│               ├── NoteResult[]
│               └── CreateNoteAction
```

---

## Core Components

### App (`src/App.tsx`)

**Purpose:** Root component, providers, routing

**Props:** None

**State:** None (delegated to providers)

**Structure:**
```tsx
<AuthProvider>
  <SyncProvider>
    <Router>
      {/* Routes */}
    </Router>
    <Toaster />
  </SyncProvider>
</AuthProvider>
```

**Responsibilities:**
- Initialize auth context
- Initialize sync engine
- Define routes
- Global error boundary

---

### AuthProvider (`src/providers/AuthProvider.tsx`)

**Purpose:** Authentication state and methods

**Context Shape:**
```tsx
interface AuthContext {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
}
```

**Implementation:**
- Use localStorage for token persistence
- Intercept API calls to inject Bearer token
- Auto-refresh on 401 responses
- Redirect to /login if unauthenticated

---

### SyncProvider (`src/providers/SyncProvider.tsx`)

**Purpose:** Real-time sync with backend (WebSocket)

**Context Shape:**
```tsx
interface SyncContext {
  isOnline: boolean
  isSyncing: boolean
  lastSyncedAt: Date | null
  syncNow: () => Promise<void>
}
```

**Implementation:**
- WebSocket connection to `/ws`
- Listen for `note.*`, `link.*` events
- Optimistic updates with rollback on error
- Retry logic with exponential backoff

---

### Router (`src/Router.tsx`)

**Purpose:** Page routing and navigation

**Routes:**
- `/` → Redirect to `/notes` (authenticated) or `/login`
- `/login` → LoginPage
- `/register` → RegisterPage
- `/notes` → EditorPage (latest note or blank)
- `/notes/:noteId` → EditorPage (specific note)
- `/graph` → GraphPage
- `/published/:handle/:slug` → PublishedNotePage (public)
- `/settings` → SettingsPage

**Guards:**
- Private routes require auth
- Public routes (`/published/*`) no auth

---

## Layout Components

### AppLayout (`src/layouts/AppLayout.tsx`)

**Purpose:** Main app shell (sidebar + content)

**Props:** None

**State:**
```tsx
const [isSidebarOpen, setIsSidebarOpen] = useState(false)
const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
```

**Layout:**
- Sidebar: absolute/fixed, hidden by default, slides in on hover/shortcut
- MainContent: max-width 680px, centered
- CommandPalette: overlay modal

**Keyboard Shortcuts:**
- `Cmd/Ctrl+K`: Toggle command palette
- `Cmd/Ctrl+B`: Toggle sidebar
- `Cmd/Ctrl+G`: Navigate to graph

---

### Sidebar (`src/components/Sidebar.tsx`)

**Purpose:** Navigation, note list, user menu

**Props:**
```tsx
interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}
```

**State:**
```tsx
const [notes, setNotes] = useState<Note[]>([])
const [isLoading, setIsLoading] = useState(true)
```

**Data Fetching:**
- Load recent notes on mount (`GET /notes?limit=50&sortBy=updatedAt`)
- Real-time updates via SyncProvider

**Interactions:**
- Click note → navigate to `/notes/:noteId`
- Hover over sidebar area → show sidebar
- Mouse leave → hide sidebar (debounced)

---

## Page Components

### EditorPage (`src/pages/EditorPage.tsx`)

**Purpose:** Main writing surface

**Props:** None (uses `useParams()` for `noteId`)

**State:**
```tsx
const [note, setNote] = useState<Note | null>(null)
const [isLoading, setIsLoading] = useState(true)
const [isSaving, setIsSaving] = useState(false)
```

**Data Fetching:**
- Load note by ID from URL (`GET /notes/:noteId?includeLinks=true`)
- If no ID, create blank note

**Auto-Save:**
- Debounced `PATCH /notes/:noteId` on content change (500ms delay)
- Optimistic updates
- Show "Saving..." / "Saved" indicator (subtle)

**Components:**
- `<Editor />` (title + content)
- `<BacklinksList />` (at bottom)
- `<PublishButton />` (top-right, subtle)

---

### GraphPage (`src/pages/GraphPage.tsx`)

**Purpose:** Graph visualization

**Props:** None

**State:**
```tsx
const [graphData, setGraphData] = useState<{ nodes: GraphNode[], edges: GraphEdge[] } | null>(null)
const [selectedNode, setSelectedNode] = useState<string | null>(null)
```

**Data Fetching:**
- Load graph data (`GET /graph`)
- Real-time updates for link changes

**Interactions:**
- Click node → navigate to `/notes/:nodeId`
- Zoom/pan with mouse/touch
- Keyboard: Arrow keys to traverse graph, Enter to open note

---

### PublishedNotePage (`src/pages/PublishedNotePage.tsx`)

**Purpose:** Public view of published note

**Props:** None (uses `useParams()` for `handle` and `slug`)

**State:**
```tsx
const [publishedNote, setPublishedNote] = useState<PublishedNotePublic | null>(null)
const [selectedVersion, setSelectedVersion] = useState<number | null>(null)
```

**Data Fetching:**
- Load published note (`GET /published/:handle/:slug`)
- No auth required

**Components:**
- `<PublishedNoteHeader />` (author, date, version selector)
- `<PublishedNoteContent />` (title, content, rendered [[links]])
- `<AttachButton />` (if authenticated)
- `<VersionHistory />` (dropdown/modal)

**Interactions:**
- Click "Attach to my graph" → open modal (choose linked/forked)
- Version selector → load different version content

---

## Editor Components

### Editor (`src/components/Editor.tsx`)

**Purpose:** Composite editor (title + content)

**Props:**
```tsx
interface EditorProps {
  note: Note
  onChange: (updates: Partial<Note>) => void
  isLoading: boolean
}
```

**State:** None (controlled component)

**Structure:**
```tsx
<div className="editor">
  <TitleInput value={note.title} onChange={handleTitleChange} />
  <ContentEditor value={note.content} onChange={handleContentChange} />
</div>
```

---

### TitleInput (`src/components/editor/TitleInput.tsx`)

**Purpose:** Note title input

**Props:**
```tsx
interface TitleInputProps {
  value: string
  onChange: (value: string) => void
  autoFocus?: boolean
}
```

**Styling:**
- Font-size: 26px
- Font-weight: normal
- No border, transparent background
- Placeholder: "Untitled"

---

### ContentEditor (`src/components/editor/ContentEditor.tsx`)

**Purpose:** Markdown editor with [[link]] parsing

**Props:**
```tsx
interface ContentEditorProps {
  value: string
  onChange: (value: string) => void
}
```

**Implementation:**
- Textarea with auto-resize
- Real-time [[link]] highlighting (CSS class for matched pattern)
- Autocomplete on `[[` trigger (show existing note titles)
- Syntax: `/\[\[([^\]]+)\]\]/g`

**Features:**
- Tab key inserts 2 spaces (not focus change)
- Cmd/Ctrl+Enter to create new note
- Show link previews on hover (optional)

---

### BacklinksList (`src/components/editor/BacklinksList.tsx`)

**Purpose:** Show notes linking to current note

**Props:**
```tsx
interface BacklinksListProps {
  noteId: string
}
```

**State:**
```tsx
const [backlinks, setBacklinks] = useState<Link[]>([])
```

**Data Fetching:**
- Load from note data (`note.incomingLinks`)
- Real-time updates via SyncProvider

**Rendering:**
- Simple text list: "← Referenced in [[Note Title]]"
- Click to navigate
- If empty: no UI (don't show "No backlinks")

---

### PublishButton (`src/components/editor/PublishButton.tsx`)

**Purpose:** Trigger publish flow

**Props:**
```tsx
interface PublishButtonProps {
  noteId: string
}
```

**Interactions:**
- Click → open `<PublishDialog />`
- If already published → show "Update" instead of "Publish"

---

## Command Palette

### CommandPalette (`src/components/CommandPalette.tsx`)

**Purpose:** Quick search and note creation

**Props:**
```tsx
interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}
```

**State:**
```tsx
const [query, setQuery] = useState('')
const [results, setResults] = useState<Note[]>([])
const [isSearching, setIsSearching] = useState(false)
```

**Data Fetching:**
- Debounced search (`GET /search?q={query}`) on query change (200ms)
- Always show "Create note: {query}" option at top

**Keyboard Nav:**
- Arrow up/down: Select result
- Enter: Navigate to selected note OR create note
- Escape: Close palette

**Styling:**
- Centered overlay
- Max-width: 600px
- Soft fade animation (180ms)
- No heavy card styling

---

## Graph Components

### GraphView (`src/components/GraphView.tsx`)

**Purpose:** Force-directed graph visualization

**Props:**
```tsx
interface GraphViewProps {
  data: { nodes: GraphNode[], edges: GraphEdge[] }
  onNodeClick: (nodeId: string) => void
}
```

**Implementation:**
- Library: `react-force-graph-2d` (lightweight, performant)
- Node color: `#1C1C1C`
- Edge color: `#E5E7EB`
- Background: `#FAFAF8`
- No labels by default (show on hover)

**Performance:**
- Virtualization for 1000+ nodes
- Limit visible nodes to 500 (show most connected)
- Debounce zoom/pan events

**Interactions:**
- Click node → call `onNodeClick`
- Hover node → show title label
- Drag node → reposition (non-persistent)

---

## Published Note Components

### AttachButton (`src/components/published/AttachButton.tsx`)

**Purpose:** Attach or fork published note

**Props:**
```tsx
interface AttachButtonProps {
  publishedNoteId: string
  allowForks: boolean
}
```

**Interactions:**
- Click → open `<AttachDialog />`
- Dialog shows two options:
  1. "Linked Attachment (stays synced)"
  2. "Forked Copy (independent)"
- On confirm → `POST /attachments`

---

### AttachDialog (`src/components/published/AttachDialog.tsx`)

**Purpose:** Choose attachment mode

**Props:**
```tsx
interface AttachDialogProps {
  publishedNoteId: string
  allowForks: boolean
  onClose: () => void
}
```

**State:**
```tsx
const [selectedMode, setSelectedMode] = useState<'linked' | 'forked'>('linked')
```

**UI:**
- Radio buttons for mode selection
- Explanation text for each mode
- "Attach" button (primary action)
- "Cancel" button

---

## Dialog/Modal Components

### PublishDialog (`src/components/dialogs/PublishDialog.tsx`)

**Purpose:** Configure and publish note

**Props:**
```tsx
interface PublishDialogProps {
  noteId: string
  existingPublish?: PublishedNote
  onClose: () => void
}
```

**Form Fields:**
- Slug (pre-filled with sanitized title, editable)
- Visibility (public / unlisted radio)
- Allow forks toggle (default: true)
- Change log (textarea, if updating)

**Validation:**
- Slug: lowercase, hyphens, alphanumeric only
- Duplicate slug check (debounced)

**Actions:**
- "Publish" / "Update" button
- "Cancel" button
- "Unpublish" button (if existing)

---

## UI Primitive Components (shadcn/ui)

### Button (`src/components/ui/button.tsx`)

**Variants:**
- `default`: Subtle background, text color
- `ghost`: Transparent, hover opacity
- `link`: Text-only, underline on hover

**Styling:**
- No bold text
- 180ms opacity transitions
- Focus ring: `#C7CDD6`

---

### Input (`src/components/ui/input.tsx`)

**Styling:**
- Border: `#E5E7EB`
- Background: `#FFFFFF`
- Text: `#1C1C1C`
- Placeholder: `#7A7A7A`
- Focus border: `#C7CDD6`

---

### Dialog (`src/components/ui/dialog.tsx`)

**Styling:**
- Overlay: `rgba(0, 0, 0, 0.3)`
- Content: Max-width 500px, centered
- Border-radius: 8px
- Shadow: subtle
- Animation: 200ms fade + slight scale

---

### Command (`src/components/ui/command.tsx`)

**Purpose:** Basis for CommandPalette (cmdk library)

**Styling:**
- Clean input, no borders
- Results list with hover states
- Keyboard navigation indicators
- Fuzzy search built-in

---

## State Management Components

### NotesStore (`src/store/notesStore.ts`)

**Library:** Zustand

**State Shape:**
```tsx
interface NotesStore {
  notes: Map<string, Note>
  currentNoteId: string | null
  isLoading: boolean

  // Actions
  setNotes: (notes: Note[]) => void
  addNote: (note: Note) => void
  updateNote: (id: string, updates: Partial<Note>) => void
  deleteNote: (id: string) => void
  setCurrentNote: (id: string) => void
}
```

---

### LinksStore (`src/store/linksStore.ts`)

**State Shape:**
```tsx
interface LinksStore {
  links: Map<string, Link>

  // Actions
  setLinks: (links: Link[]) => void
  addLink: (link: Link) => void
  deleteLink: (id: string) => void
  getLinksForNote: (noteId: string) => { outgoing: Link[], incoming: Link[] }
}
```

---

### PublishedStore (`src/store/publishedStore.ts`)

**State Shape:**
```tsx
interface PublishedStore {
  publishedNotes: Map<string, PublishedNote>
  attachments: Attachment[]

  // Actions
  setPublished: (notes: PublishedNote[]) => void
  addPublished: (note: PublishedNote) => void
  deletePublished: (id: string) => void
  setAttachments: (attachments: Attachment[]) => void
  addAttachment: (attachment: Attachment) => void
}
```

---

## Custom Hooks

### useDebounce (`src/hooks/useDebounce.ts`)

**Purpose:** Debounce value changes

**Signature:**
```tsx
function useDebounce<T>(value: T, delay: number): T
```

---

### useAutoSave (`src/hooks/useAutoSave.ts`)

**Purpose:** Auto-save note changes

**Signature:**
```tsx
function useAutoSave(
  noteId: string,
  content: Partial<Note>,
  delay: number = 500
): { isSaving: boolean, lastSavedAt: Date | null }
```

---

### useLinkParser (`src/hooks/useLinkParser.ts`)

**Purpose:** Parse [[links]] from content

**Signature:**
```tsx
function useLinkParser(content: string): {
  links: string[]
  highlightedContent: React.ReactNode
}
```

**Implementation:**
- Regex: `/\[\[([^\]]+)\]\]/g`
- Return matched link titles
- Optionally return JSX with highlighted links

---

### useKeyboardShortcut (`src/hooks/useKeyboardShortcut.ts`)

**Purpose:** Register keyboard shortcuts

**Signature:**
```tsx
function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options?: { ctrl?: boolean, meta?: boolean, shift?: boolean }
): void
```

**Example:**
```tsx
useKeyboardShortcut('k', () => setCommandPaletteOpen(true), { meta: true })
```

---

## Accessibility

### Focus Management
- Auto-focus title input on note load
- Trap focus in modals
- Restore focus on dialog close

### Keyboard Navigation
- All interactive elements keyboard-accessible
- Skip links for screen readers
- ARIA labels on icon-only buttons

### ARIA Attributes
- `role="dialog"` on modals
- `aria-label` on search input
- `aria-live` for save status

---

## Performance Optimizations

### Lazy Loading
- Code-split routes with `React.lazy()`
- Lazy-load graph library (heavy)

### Memoization
- `React.memo()` for list items (NoteListItem, search results)
- `useMemo()` for expensive computations (link parsing, graph data)

### Virtualization
- Virtual scrolling for long note lists (react-window)
- Graph node limiting (top 500 by connections)

---

## File Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── command.tsx
│   ├── editor/
│   │   ├── Editor.tsx
│   │   ├── TitleInput.tsx
│   │   ├── ContentEditor.tsx
│   │   ├── BacklinksList.tsx
│   │   └── PublishButton.tsx
│   ├── dialogs/
│   │   ├── PublishDialog.tsx
│   │   └── AttachDialog.tsx
│   ├── published/
│   │   ├── PublishedNoteHeader.tsx
│   │   ├── PublishedNoteContent.tsx
│   │   ├── AttachButton.tsx
│   │   └── VersionHistory.tsx
│   ├── Sidebar.tsx
│   ├── CommandPalette.tsx
│   └── GraphView.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── EditorPage.tsx
│   ├── GraphPage.tsx
│   ├── PublishedNotePage.tsx
│   └── SettingsPage.tsx
├── layouts/
│   ├── AppLayout.tsx
│   └── AuthLayout.tsx
├── providers/
│   ├── AuthProvider.tsx
│   └── SyncProvider.tsx
├── store/
│   ├── notesStore.ts
│   ├── linksStore.ts
│   └── publishedStore.ts
├── hooks/
│   ├── useDebounce.ts
│   ├── useAutoSave.ts
│   ├── useLinkParser.ts
│   └── useKeyboardShortcut.ts
├── lib/
│   ├── api.ts          # API client
│   ├── utils.ts        # cn() + helpers
│   └── constants.ts    # Design tokens
├── types/
│   ├── note.ts
│   ├── user.ts
│   └── api.ts
├── Router.tsx
├── App.tsx
└── main.tsx
```

---

## Design Token Constants

```tsx
// src/lib/constants.ts
export const COLORS = {
  background: '#FAFAF8',
  surface: '#FFFFFF',
  text: '#1C1C1C',
  secondary: '#7A7A7A',
  divider: '#E5E7EB',
  focus: '#C7CDD6',
} as const

export const TYPOGRAPHY = {
  title: '26px',
  body: '16px',
  caption: '13px',
  lineHeight: '1.65',
} as const

export const LAYOUT = {
  maxWritingWidth: '680px',
  sidebarWidth: '280px',
  gridBase: '8px',
} as const

export const MOTION = {
  fadeDuration: '180ms',
  easing: 'ease-out',
} as const
```

---

This component architecture:
- ✅ Matches PRD design philosophy (invisible UI)
- ✅ Supports all core features
- ✅ Scales to complex graph visualizations
- ✅ Enables real-time sync
- ✅ Provides clear separation of concerns
- ✅ Optimized for keyboard-first interaction

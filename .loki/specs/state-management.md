# Still - State Management Strategy

## Decision: Zustand + React Context

**Rationale:**
- **Zustand** for client-side data (notes, links, published)
  - Minimal boilerplate
  - No provider nesting hell
  - TypeScript-first
  - DevTools support
  - Middleware for persistence

- **React Context** for cross-cutting concerns (auth, sync)
  - Natural fit for "app-wide" state
  - Standard React pattern
  - Easy to mock in tests

---

## Store Architecture

### 1. Notes Store (`src/store/notesStore.ts`)

**Purpose:** Manage all user notes and current note selection

```typescript
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface Note {
  id: string
  userId: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  metadata: Record<string, unknown>
}

interface NotesStore {
  // State
  notes: Map<string, Note>
  currentNoteId: string | null
  isLoading: boolean
  error: string | null

  // Actions
  setNotes: (notes: Note[]) => void
  addNote: (note: Note) => void
  updateNote: (id: string, updates: Partial<Note>) => void
  deleteNote: (id: string) => void
  setCurrentNote: (id: string) => void
  clearError: () => void

  // Selectors
  getCurrentNote: () => Note | null
  getNoteById: (id: string) => Note | undefined
  getAllNotes: () => Note[]
  getRecentNotes: (limit: number) => Note[]
}

export const useNotesStore = create<NotesStore>()(
  devtools(
    persist(
      (set, get) => ({
        notes: new Map(),
        currentNoteId: null,
        isLoading: false,
        error: null,

        setNotes: (notes) => set({
          notes: new Map(notes.map(n => [n.id, n]))
        }),

        addNote: (note) => set(state => ({
          notes: new Map(state.notes).set(note.id, note)
        })),

        updateNote: (id, updates) => set(state => {
          const note = state.notes.get(id)
          if (!note) return state

          const updated = { ...note, ...updates, updatedAt: new Date() }
          return {
            notes: new Map(state.notes).set(id, updated)
          }
        }),

        deleteNote: (id) => set(state => {
          const notes = new Map(state.notes)
          notes.delete(id)
          return { notes }
        }),

        setCurrentNote: (id) => set({ currentNoteId: id }),

        clearError: () => set({ error: null }),

        // Selectors
        getCurrentNote: () => {
          const { notes, currentNoteId } = get()
          return currentNoteId ? notes.get(currentNoteId) ?? null : null
        },

        getNoteById: (id) => get().notes.get(id),

        getAllNotes: () => Array.from(get().notes.values()),

        getRecentNotes: (limit) => {
          return Array.from(get().notes.values())
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
            .slice(0, limit)
        },
      }),
      {
        name: 'still-notes',
        partialize: (state) => ({
          notes: Array.from(state.notes.entries()),
          currentNoteId: state.currentNoteId,
        }),
      }
    )
  )
)
```

---

### 2. Links Store (`src/store/linksStore.ts`)

**Purpose:** Manage bidirectional link index

```typescript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface Link {
  id: string
  sourceNoteId: string
  targetNoteId: string
  createdAt: Date
  context?: string
}

interface LinksStore {
  // State
  links: Map<string, Link>
  isLoading: boolean

  // Actions
  setLinks: (links: Link[]) => void
  addLink: (link: Link) => void
  deleteLink: (id: string) => void
  syncLinks: (noteId: string, linkTitles: string[]) => Promise<void>

  // Selectors
  getLinksForNote: (noteId: string) => { outgoing: Link[], incoming: Link[] }
  getBacklinks: (noteId: string) => Link[]
  getLinkCount: (noteId: string) => number
}

export const useLinksStore = create<LinksStore>()(
  devtools((set, get) => ({
    links: new Map(),
    isLoading: false,

    setLinks: (links) => set({
      links: new Map(links.map(l => [l.id, l]))
    }),

    addLink: (link) => set(state => ({
      links: new Map(state.links).set(link.id, link)
    })),

    deleteLink: (id) => set(state => {
      const links = new Map(state.links)
      links.delete(id)
      return { links }
    }),

    syncLinks: async (noteId, linkTitles) => {
      // Will be implemented with API call to /links/parse
      // This is a placeholder for the architecture
    },

    // Selectors
    getLinksForNote: (noteId) => {
      const links = Array.from(get().links.values())
      return {
        outgoing: links.filter(l => l.sourceNoteId === noteId),
        incoming: links.filter(l => l.targetNoteId === noteId),
      }
    },

    getBacklinks: (noteId) => {
      return Array.from(get().links.values())
        .filter(l => l.targetNoteId === noteId)
    },

    getLinkCount: (noteId) => {
      const links = Array.from(get().links.values())
      return links.filter(l =>
        l.sourceNoteId === noteId || l.targetNoteId === noteId
      ).length
    },
  }))
)
```

---

### 3. Published Store (`src/store/publishedStore.ts`)

**Purpose:** Manage published notes and attachments

```typescript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface PublishedNote {
  id: string
  userId: string
  sourceNoteId: string
  slug: string
  visibility: 'public' | 'unlisted'
  allowForks: boolean
  currentVersionId: string
  createdAt: Date
  updatedAt: Date
  viewCount: number
}

interface Attachment {
  id: string
  userId: string
  publishedNoteId: string
  attachmentType: 'linked' | 'forked'
  localNoteId: string
  attachedVersionId: string
  currentVersionId: string
  hasPendingUpdate: boolean
  createdAt: Date
}

interface PublishedStore {
  // State
  publishedNotes: Map<string, PublishedNote>
  attachments: Attachment[]
  isLoading: boolean

  // Actions
  setPublished: (notes: PublishedNote[]) => void
  addPublished: (note: PublishedNote) => void
  updatePublished: (id: string, updates: Partial<PublishedNote>) => void
  deletePublished: (id: string) => void

  setAttachments: (attachments: Attachment[]) => void
  addAttachment: (attachment: Attachment) => void
  updateAttachment: (id: string, updates: Partial<Attachment>) => void

  // Selectors
  getPublishedBySourceNoteId: (noteId: string) => PublishedNote | undefined
  getPendingUpdates: () => Attachment[]
  getAttachmentCount: () => number
}

export const usePublishedStore = create<PublishedStore>()(
  devtools((set, get) => ({
    publishedNotes: new Map(),
    attachments: [],
    isLoading: false,

    setPublished: (notes) => set({
      publishedNotes: new Map(notes.map(n => [n.id, n]))
    }),

    addPublished: (note) => set(state => ({
      publishedNotes: new Map(state.publishedNotes).set(note.id, note)
    })),

    updatePublished: (id, updates) => set(state => {
      const note = state.publishedNotes.get(id)
      if (!note) return state

      const updated = { ...note, ...updates }
      return {
        publishedNotes: new Map(state.publishedNotes).set(id, updated)
      }
    }),

    deletePublished: (id) => set(state => {
      const notes = new Map(state.publishedNotes)
      notes.delete(id)
      return { publishedNotes: notes }
    }),

    setAttachments: (attachments) => set({ attachments }),

    addAttachment: (attachment) => set(state => ({
      attachments: [...state.attachments, attachment]
    })),

    updateAttachment: (id, updates) => set(state => ({
      attachments: state.attachments.map(a =>
        a.id === id ? { ...a, ...updates } : a
      )
    })),

    // Selectors
    getPublishedBySourceNoteId: (noteId) => {
      return Array.from(get().publishedNotes.values())
        .find(p => p.sourceNoteId === noteId)
    },

    getPendingUpdates: () => {
      return get().attachments.filter(a =>
        a.attachmentType === 'linked' && a.hasPendingUpdate
      )
    },

    getAttachmentCount: () => get().attachments.length,
  }))
)
```

---

## React Context Providers

### AuthProvider (`src/providers/AuthProvider.tsx`)

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface User {
  id: string
  email: string
  displayName: string
  handle: string
  settings: Record<string, unknown>
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const token = localStorage.getItem('still_token')
    if (token) {
      api.get('/users/me')
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('still_token'))
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('still_token', res.data.token)
    setUser(res.data.user)
  }

  const register = async (data: RegisterData) => {
    const res = await api.post('/auth/register', data)
    localStorage.setItem('still_token', res.data.token)
    setUser(res.data.user)
  }

  const logout = async () => {
    await api.post('/auth/logout')
    localStorage.removeItem('still_token')
    setUser(null)
  }

  const updateProfile = async (updates: Partial<User>) => {
    const res = await api.patch('/users/me', updates)
    setUser(res.data)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

---

### SyncProvider (`src/providers/SyncProvider.tsx`)

```typescript
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useNotesStore } from '@/store/notesStore'
import { useLinksStore } from '@/store/linksStore'
import { useAuth } from './AuthProvider'

interface SyncContextType {
  isOnline: boolean
  isSyncing: boolean
  lastSyncedAt: Date | null
  syncNow: () => Promise<void>
}

const SyncContext = createContext<SyncContextType | null>(null)

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null)

  const { isAuthenticated } = useAuth()
  const { addNote, updateNote, deleteNote } = useNotesStore()
  const { addLink, deleteLink } = useLinksStore()

  useEffect(() => {
    if (!isAuthenticated) return

    const token = localStorage.getItem('still_token')
    const socket = new WebSocket(`wss://api.still.app/v1/ws?token=${token}`)

    socket.onopen = () => {
      setIsOnline(true)
      console.log('WebSocket connected')
    }

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data)

      switch (message.type) {
        case 'note.created':
          addNote(message.data)
          break
        case 'note.updated':
          updateNote(message.data.id, message.data)
          break
        case 'note.deleted':
          deleteNote(message.data.id)
          break
        case 'link.created':
          addLink(message.data)
          break
        case 'link.deleted':
          deleteLink(message.data.id)
          break
      }

      setLastSyncedAt(new Date())
    }

    socket.onerror = () => setIsOnline(false)
    socket.onclose = () => setIsOnline(false)

    setWs(socket)

    return () => {
      socket.close()
    }
  }, [isAuthenticated])

  const syncNow = useCallback(async () => {
    setIsSyncing(true)
    try {
      // Trigger manual sync via API
      // (implementation depends on backend sync mechanism)
      setLastSyncedAt(new Date())
    } finally {
      setIsSyncing(false)
    }
  }, [])

  return (
    <SyncContext.Provider value={{
      isOnline,
      isSyncing,
      lastSyncedAt,
      syncNow,
    }}>
      {children}
    </SyncContext.Provider>
  )
}

export const useSync = () => {
  const context = useContext(SyncContext)
  if (!context) throw new Error('useSync must be used within SyncProvider')
  return context
}
```

---

## Data Flow Patterns

### Pattern 1: Optimistic Updates

```typescript
// In a component
const { updateNote } = useNotesStore()

const handleSave = async (id: string, updates: Partial<Note>) => {
  // 1. Optimistic update (instant UI feedback)
  updateNote(id, updates)

  try {
    // 2. Persist to backend
    await api.patch(`/notes/${id}`, updates)
  } catch (error) {
    // 3. Rollback on failure
    // (requires storing previous state or refetching)
    toast.error('Failed to save')
  }
}
```

---

### Pattern 2: Real-time Sync

```typescript
// SyncProvider automatically updates stores on WebSocket events
// Components subscribe to stores and re-render automatically

function NotesList() {
  const notes = useNotesStore(state => state.getAllNotes())

  // This component automatically re-renders when:
  // - Local updates happen (user edits)
  // - Remote updates arrive (WebSocket events)

  return <>{/* render notes */}</>
}
```

---

### Pattern 3: Derived State

```typescript
// Use selectors for computed values
function BacklinksPanel({ noteId }: { noteId: string }) {
  const backlinks = useLinksStore(state => state.getBacklinks(noteId))

  // Selector re-computes only when links change
  return <>{/* render backlinks */}</>
}
```

---

## Persistence Strategy

### LocalStorage (via Zustand persist middleware)

**What to persist:**
- Notes (for offline access)
- Current note ID (restore on reload)

**What NOT to persist:**
- Links (too large, derived from notes)
- Auth user (use token refresh instead)
- Published notes (refetch on mount)

### IndexedDB (future enhancement)

For larger datasets (10,000+ notes):
- Migrate from localStorage to IndexedDB
- Use `idb-keyval` or Dexie.js
- Keep Zustand as state layer, IndexedDB as storage

---

## DevTools Integration

### Zustand DevTools

```typescript
import { devtools } from 'zustand/middleware'

export const useNotesStore = create<NotesStore>()(
  devtools(
    // ... store implementation
    { name: 'NotesStore' }
  )
)
```

**Usage:**
- Install Redux DevTools extension
- All store actions logged with time travel
- Inspect state snapshots

---

## Testing Strategy

### Store Unit Tests

```typescript
import { renderHook, act } from '@testing-library/react'
import { useNotesStore } from './notesStore'

test('addNote updates state', () => {
  const { result } = renderHook(() => useNotesStore())

  const note = { id: '1', title: 'Test', content: '', ... }

  act(() => {
    result.current.addNote(note)
  })

  expect(result.current.getNoteById('1')).toEqual(note)
})
```

### Context Provider Tests

```typescript
import { render, screen } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthProvider'

function TestComponent() {
  const { isAuthenticated } = useAuth()
  return <div>{isAuthenticated ? 'Logged in' : 'Logged out'}</div>
}

test('AuthProvider provides auth state', () => {
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  )

  expect(screen.getByText('Logged out')).toBeInTheDocument()
})
```

---

## Performance Considerations

### Selector Optimization

```typescript
// ❌ Bad: re-renders on any notes change
const notes = useNotesStore(state => state.notes)

// ✅ Good: only re-renders when specific note changes
const note = useNotesStore(state => state.getNoteById(id))
```

### Memoization

```typescript
// Use Zustand's built-in shallow equality check
import { shallow } from 'zustand/shallow'

const { title, content } = useNotesStore(
  state => ({
    title: state.getCurrentNote()?.title,
    content: state.getCurrentNote()?.content,
  }),
  shallow
)
```

---

## Migration Path

### Phase 1: Local-only (MVP)
- Zustand stores with persist middleware
- No backend sync
- localStorage for persistence

### Phase 2: Cloud sync
- Add SyncProvider with WebSocket
- Implement optimistic updates
- Add conflict resolution UI

### Phase 3: Offline-first
- Migrate to IndexedDB
- Queue failed mutations
- Background sync when online

---

This state management strategy:
- ✅ Minimal boilerplate (Zustand)
- ✅ TypeScript-first
- ✅ Real-time sync ready
- ✅ Optimistic updates supported
- ✅ Persistence built-in
- ✅ DevTools integration
- ✅ Testable architecture

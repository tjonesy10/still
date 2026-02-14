# ADR 001: State Management with Zustand

**Status:** Accepted
**Date:** 2026-02-14
**Deciders:** Loki Mode Autonomous Agent

## Context

Still requires client-side state management for notes, links, published content, and real-time sync. Need to choose between Redux, MobX, Jotai, Zustand, or React Context.

## Decision

Use **Zustand** for application state (notes, links, published) and **React Context** for cross-cutting concerns (auth, sync).

## Rationale

**Why Zustand:**
- Minimal boilerplate compared to Redux
- No provider wrapping (simple API)
- TypeScript-first design
- Built-in middleware (persist, devtools)
- Small bundle size (~1KB)
- Excellent performance with selectors

**Why React Context for auth/sync:**
- Standard React pattern
- Natural fit for app-wide concerns
- Easy to mock in tests
- Clear separation: Context for "infrastructure", Zustand for "data"

**Alternatives considered:**
- **Redux:** Too much boilerplate for this project size
- **MobX:** Less TypeScript-friendly, more magic
- **Jotai:** Atom-based approach adds complexity
- **Context only:** Performance issues with frequent updates

## Consequences

**Positive:**
- Fast development (minimal setup)
- Good DevTools integration
- Clear mental model
- Easy to test (no provider nesting)

**Negative:**
- Less ecosystem than Redux
- Manual selector optimization needed
- Multiple stores to manage (vs single Redux store)

## Implementation

```typescript
// Store example
export const useNotesStore = create<NotesStore>()(
  devtools(
    persist(
      (set, get) => ({
        notes: new Map(),
        addNote: (note) => set(state => ({ notes: new Map(state.notes).set(note.id, note) }))
      }),
      { name: 'still-notes' }
    )
  )
)
```

## References

- Zustand documentation: https://github.com/pmndrs/zustand
- Data model: `.loki/specs/data-model.md`
- State management strategy: `.loki/specs/state-management.md`

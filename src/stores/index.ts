import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createNotesSlice, NotesSlice } from './notes.slice'
import { createLinksSlice, LinksSlice } from './links.slice'
import { createPublishedSlice, PublishedSlice } from './published.slice'
import { createUISlice, UISlice } from './ui.slice'

type StoreState = NotesSlice & LinksSlice & PublishedSlice & UISlice

export const useStore = create<StoreState>()(
  devtools(
    persist(
      immer((...a) => ({
        ...createNotesSlice(...a),
        ...createLinksSlice(...a),
        ...createPublishedSlice(...a),
        ...createUISlice(...a),
      })),
      {
        name: 'still-storage',
        partialize: (state) => ({
          // Only persist data, not UI state or loading states
          notes: Array.from(state.notes.entries()),
          links: Array.from(state.links.entries()),
          published: Array.from(state.published.entries()),
        }),
        // Custom serialization for Map types
        serialize: (state) => {
          const serialized = {
            notes: Array.from((state.state as any).notes || []),
            links: Array.from((state.state as any).links || []),
            published: Array.from((state.state as any).published || []),
          }
          return JSON.stringify({ state: serialized, version: state.version })
        },
        deserialize: (str) => {
          const { state, version } = JSON.parse(str)
          return {
            state: {
              notes: new Map(state.notes || []),
              links: new Map(state.links || []),
              published: new Map(state.published || []),
            },
            version,
          }
        },
      }
    )
  )
)

// Typed selector hook for performance
export const useShallow = <T,>(selector: (state: StoreState) => T) => {
  return useStore(selector)
}

// Export store type for typing
export type { StoreState }

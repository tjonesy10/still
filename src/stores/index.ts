import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createNotesSlice, NotesSlice } from './notes.slice'
import { createLinksSlice, LinksSlice } from './links.slice'
import { createPublishedSlice, PublishedSlice } from './published.slice'
import { createUISlice, UISlice } from './ui.slice'

type StoreState = NotesSlice & LinksSlice & PublishedSlice & UISlice

export const useStore = create<StoreState>()(
  devtools(
    immer((set, get, store) => ({
      ...createNotesSlice(set as any, get as any, store as any),
      ...createLinksSlice(set as any, get as any, store as any),
      ...createPublishedSlice(set as any, get as any, store as any),
      ...createUISlice(set as any, get as any, store as any),
    }))
  )
)

// Typed selector hook for performance
export const useShallow = <T,>(selector: (state: StoreState) => T) => {
  return useStore(selector)
}

// Export store type for typing
export type { StoreState }

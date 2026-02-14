import { StateCreator } from 'zustand'

export type ViewMode = 'editor' | 'graph' | 'split'

export interface UISlice {
  selectedNoteId: string | null
  viewMode: ViewMode
  isSidebarOpen: boolean
  isCommandPaletteOpen: boolean
  searchQuery: string

  // Actions
  setSelectedNoteId: (id: string | null) => void
  setViewMode: (mode: ViewMode) => void
  toggleSidebar: () => void
  openCommandPalette: () => void
  closeCommandPalette: () => void
  setSearchQuery: (query: string) => void
}

export const createUISlice: StateCreator<
  UISlice,
  [['zustand/immer', never]],
  [],
  UISlice
> = (set) => ({
  selectedNoteId: null,
  viewMode: 'editor',
  isSidebarOpen: true,
  isCommandPaletteOpen: false,
  searchQuery: '',

  setSelectedNoteId: (id) =>
    set((state) => {
      state.selectedNoteId = id
    }),

  setViewMode: (mode) =>
    set((state) => {
      state.viewMode = mode
    }),

  toggleSidebar: () =>
    set((state) => {
      state.isSidebarOpen = !state.isSidebarOpen
    }),

  openCommandPalette: () =>
    set((state) => {
      state.isCommandPaletteOpen = true
    }),

  closeCommandPalette: () =>
    set((state) => {
      state.isCommandPaletteOpen = false
    }),

  setSearchQuery: (query) =>
    set((state) => {
      state.searchQuery = query
    }),
})

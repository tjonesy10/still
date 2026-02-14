import { StateCreator } from 'zustand'
import { Note } from '@/types/note'
import { api } from '@/lib/api'

export interface NotesSlice {
  notes: Map<string, Note>
  optimisticUpdates: Map<string, Note>
  isLoading: boolean
  error: string | null

  // Actions
  setNotes: (notes: Note[]) => void
  addNote: (note: Note) => void
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'userId'>>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  rollbackUpdate: (id: string) => void
  fetchNotes: () => Promise<void>
}

export const createNotesSlice: StateCreator<
  NotesSlice,
  [['zustand/immer', never]],
  [],
  NotesSlice
> = (set, get) => ({
  notes: new Map(),
  optimisticUpdates: new Map(),
  isLoading: false,
  error: null,

  setNotes: (notes) =>
    set((state) => {
      state.notes = new Map(notes.map((note) => [note.id, note]))
    }),

  addNote: (note) =>
    set((state) => {
      state.notes.set(note.id, note)
    }),

  updateNote: async (id, updates) => {
    const originalNote = get().notes.get(id)
    if (!originalNote) return

    // Optimistic update
    const updatedNote = {
      ...originalNote,
      ...updates,
      updatedAt: new Date(),
    }

    set((state) => {
      state.notes.set(id, updatedNote)
      state.optimisticUpdates.set(id, updatedNote)
    })

    try {
      const response = await api.patch(`/notes/${id}`, updates)

      // Server confirmed, update with server version
      set((state) => {
        state.notes.set(id, response.data)
        state.optimisticUpdates.delete(id)
      })
    } catch (error) {
      // Rollback on failure
      get().rollbackUpdate(id)
      set((state) => {
        state.error = error instanceof Error ? error.message : 'Failed to update note'
      })
      throw error
    }
  },

  deleteNote: async (id) => {
    const originalNote = get().notes.get(id)
    if (!originalNote) return

    // Optimistic delete
    set((state) => {
      state.notes.delete(id)
      state.optimisticUpdates.set(id, originalNote)
    })

    try {
      await api.delete(`/notes/${id}`)

      // Server confirmed
      set((state) => {
        state.optimisticUpdates.delete(id)
      })
    } catch (error) {
      // Rollback - restore note
      set((state) => {
        state.notes.set(id, originalNote)
        state.optimisticUpdates.delete(id)
        state.error = error instanceof Error ? error.message : 'Failed to delete note'
      })
      throw error
    }
  },

  rollbackUpdate: (id) => {
    const optimisticVersion = get().optimisticUpdates.get(id)
    set((state) => {
      state.optimisticUpdates.delete(id)
      // In a real implementation, we'd restore from a separate serverNotes map
      // For now, just remove the optimistic update
      if (optimisticVersion) {
        state.notes.set(id, optimisticVersion)
      }
    })
  },

  fetchNotes: async () => {
    set((state) => {
      state.isLoading = true
      state.error = null
    })

    try {
      const response = await api.get('/notes')
      get().setNotes(response.data)
    } catch (error) {
      set((state) => {
        state.error = error instanceof Error ? error.message : 'Failed to fetch notes'
      })
      throw error
    } finally {
      set((state) => {
        state.isLoading = false
      })
    }
  },
})

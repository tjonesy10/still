import { StateCreator } from 'zustand'
import { PublishedNote } from '@/types/published'
import { api } from '@/lib/api'

export interface PublishedSlice {
  published: Map<string, PublishedNote>
  isPublishing: boolean
  publishError: string | null

  // Actions
  setPublished: (notes: PublishedNote[]) => void
  addPublished: (note: PublishedNote) => void
  updatePublished: (id: string, updates: Partial<PublishedNote>) => void
  removePublished: (id: string) => void
  publishNote: (noteId: string, options: PublishOptions) => Promise<PublishedNote>
  unpublishNote: (publishedId: string) => Promise<void>
  updatePublishedVersion: (publishedId: string, noteId: string) => Promise<void>
}

export interface PublishOptions {
  license?: string
  allowForks?: boolean
  allowComments?: boolean
}

export const createPublishedSlice: StateCreator<
  PublishedSlice,
  [['zustand/immer', never]],
  [],
  PublishedSlice
> = (set, get) => ({
  published: new Map(),
  isPublishing: false,
  publishError: null,

  setPublished: (notes) =>
    set((state) => {
      state.published = new Map(notes.map((note) => [note.id, note]))
    }),

  addPublished: (note) =>
    set((state) => {
      state.published.set(note.id, note)
    }),

  updatePublished: (id, updates) =>
    set((state) => {
      const existing = state.published.get(id)
      if (existing) {
        state.published.set(id, { ...existing, ...updates })
      }
    }),

  removePublished: (id) =>
    set((state) => {
      state.published.delete(id)
    }),

  publishNote: async (noteId, options = {}) => {
    set((state) => {
      state.isPublishing = true
      state.publishError = null
    })

    try {
      const response = await api.post('/published', {
        noteId,
        license: options.license || 'CC-BY-4.0',
        allowForks: options.allowForks ?? true,
        allowComments: options.allowComments ?? true,
      })

      const publishedNote = response.data
      get().addPublished(publishedNote)

      return publishedNote
    } catch (error) {
      set((state) => {
        state.publishError =
          error instanceof Error ? error.message : 'Failed to publish note'
      })
      throw error
    } finally {
      set((state) => {
        state.isPublishing = false
      })
    }
  },

  unpublishNote: async (publishedId) => {
    try {
      await api.delete(`/published/${publishedId}`)
      get().removePublished(publishedId)
    } catch (error) {
      set((state) => {
        state.publishError =
          error instanceof Error ? error.message : 'Failed to unpublish note'
      })
      throw error
    }
  },

  updatePublishedVersion: async (publishedId, noteId) => {
    set((state) => {
      state.isPublishing = true
      state.publishError = null
    })

    try {
      const response = await api.post(`/published/${publishedId}/versions`, {
        noteId,
      })

      // Update the published note with new version info
      get().updatePublished(publishedId, {
        version: response.data.version,
        updatedAt: new Date(response.data.updatedAt),
      })
    } catch (error) {
      set((state) => {
        state.publishError =
          error instanceof Error ? error.message : 'Failed to update published version'
      })
      throw error
    } finally {
      set((state) => {
        state.isPublishing = false
      })
    }
  },
})

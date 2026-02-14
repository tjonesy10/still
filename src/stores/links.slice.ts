import { StateCreator } from 'zustand'
import { Link } from '@/types/note'

export interface LinksSlice {
  links: Map<string, Link>

  // Computed getters
  getBacklinks: (noteId: string) => Link[]
  getForwardLinks: (noteId: string) => Link[]
  getOrphanLinks: () => Link[]

  // Actions
  setLinks: (links: Link[]) => void
  addLink: (link: Link) => void
  removeLink: (linkId: string) => void
  updateLinksForNote: (noteId: string, parsedLinks: string[]) => void
}

export const createLinksSlice: StateCreator<
  LinksSlice,
  [['zustand/immer', never]],
  [],
  LinksSlice
> = (set, get) => ({
  links: new Map(),

  getBacklinks: (noteId) => {
    return Array.from(get().links.values()).filter(
      (link) => link.targetNoteId === noteId
    )
  },

  getForwardLinks: (noteId) => {
    return Array.from(get().links.values()).filter(
      (link) => link.sourceNoteId === noteId
    )
  },

  getOrphanLinks: () => {
    return Array.from(get().links.values()).filter(
      (link) => !link.targetNoteId // Unresolved links
    )
  },

  setLinks: (links) =>
    set((state) => {
      state.links = new Map(links.map((link) => [link.id, link]))
    }),

  addLink: (link) =>
    set((state) => {
      state.links.set(link.id, link)
    }),

  removeLink: (linkId) =>
    set((state) => {
      state.links.delete(linkId)
    }),

  updateLinksForNote: (noteId, parsedLinkTexts) => {
    // Remove old links for this note
    const oldLinks = get().getForwardLinks(noteId)
    oldLinks.forEach((link) => get().removeLink(link.id))

    // Add new links
    parsedLinkTexts.forEach((linkText, index) => {
      const link: Link = {
        id: `${noteId}-${index}`,
        sourceNoteId: noteId,
        targetNoteId: null, // Will be resolved by link parser
        linkText,
        createdAt: new Date(),
      }
      get().addLink(link)
    })
  },
})

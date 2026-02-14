import { useEffect } from 'react'
import { useStore } from '@/stores'
import { Note } from '@/types/note'

export function useKeyboardShortcuts() {
  const openCommandPalette = useStore((state) => state.openCommandPalette)
  const closeCommandPalette = useStore((state) => state.closeCommandPalette)
  const isCommandPaletteOpen = useStore((state) => state.isCommandPaletteOpen)
  const toggleSidebar = useStore((state) => state.toggleSidebar)
  const viewMode = useStore((state) => state.viewMode)
  const setViewMode = useStore((state) => state.setViewMode)
  const addNote = useStore((state) => state.addNote)
  const setSelectedNoteId = useStore((state) => state.setSelectedNoteId)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey

      // Cmd/Ctrl + K: Toggle command palette
      if (isMod && e.key === 'k') {
        e.preventDefault()
        if (isCommandPaletteOpen) {
          closeCommandPalette()
        } else {
          openCommandPalette()
        }
        return
      }

      // Cmd/Ctrl + B: Toggle sidebar
      if (isMod && e.key === 'b') {
        e.preventDefault()
        toggleSidebar()
        return
      }

      // Cmd/Ctrl + N: New note
      if (isMod && e.key === 'n') {
        e.preventDefault()
        const newNote: Note = {
          id: `note-${Date.now()}`,
          userId: 'local-user',
          title: 'Untitled',
          content: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {},
        }
        addNote(newNote)
        setSelectedNoteId(newNote.id)
        return
      }

      // Cmd/Ctrl + G: Toggle to graph view
      if (isMod && e.key === 'g') {
        e.preventDefault()
        setViewMode(viewMode === 'graph' ? 'editor' : 'graph')
        return
      }

      // Escape: Close command palette
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        e.preventDefault()
        closeCommandPalette()
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [
    openCommandPalette,
    closeCommandPalette,
    isCommandPaletteOpen,
    toggleSidebar,
    viewMode,
    setViewMode,
    addNote,
    setSelectedNoteId,
  ])
}

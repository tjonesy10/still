import { useEffect, useState } from 'react'
import { Command } from 'cmdk'
import { useStore } from '@/stores'
import { Note } from '@/types/note'

export function CommandPalette() {
  const isOpen = useStore((state) => state.isCommandPaletteOpen)
  const closeCommandPalette = useStore((state) => state.closeCommandPalette)
  const notes = useStore((state) => Array.from(state.notes.values()))
  const setSelectedNoteId = useStore((state) => state.setSelectedNoteId)
  const addNote = useStore((state) => state.addNote)

  const [search, setSearch] = useState('')

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        useStore.getState().openCommandPalette()
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(search.toLowerCase()) ||
    note.content.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreateNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      userId: 'local-user',
      title: search || 'Untitled',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {},
    }
    addNote(newNote)
    setSelectedNoteId(newNote.id)
    closeCommandPalette()
    setSearch('')
  }

  const handleSelectNote = (note: Note) => {
    setSelectedNoteId(note.id)
    closeCommandPalette()
    setSearch('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-[20vh]">
      <Command
        className="bg-background rounded-lg shadow-2xl w-full max-w-2xl border border-divider overflow-hidden"
        value={search}
        onValueChange={setSearch}
      >
        <div className="flex items-center border-b border-divider px-4">
          <svg
            className="w-5 h-5 text-secondary mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <Command.Input
            placeholder="Search notes or create new..."
            className="flex-1 py-3 bg-transparent border-none outline-none text-text placeholder-secondary"
            autoFocus
          />
          <button
            onClick={closeCommandPalette}
            className="text-xs text-secondary px-2 py-1 rounded border border-divider hover:bg-gray-50"
          >
            ESC
          </button>
        </div>

        <Command.List className="max-h-96 overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-secondary text-sm">
            No notes found.
          </Command.Empty>

          {search && (
            <Command.Group heading="Actions">
              <Command.Item
                onSelect={handleCreateNote}
                className="flex items-center px-4 py-3 rounded cursor-pointer hover:bg-gray-100 data-[selected=true]:bg-gray-100"
              >
                <svg
                  className="w-5 h-5 mr-3 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="text-text">
                  Create note: <strong>{search}</strong>
                </span>
              </Command.Item>
            </Command.Group>
          )}

          {filteredNotes.length > 0 && (
            <Command.Group heading="Notes">
              {filteredNotes.map((note) => (
                <Command.Item
                  key={note.id}
                  value={note.title}
                  onSelect={() => handleSelectNote(note)}
                  className="flex flex-col px-4 py-3 rounded cursor-pointer hover:bg-gray-100 data-[selected=true]:bg-gray-100"
                >
                  <span className="font-medium text-text">{note.title || 'Untitled'}</span>
                  <span className="text-sm text-secondary line-clamp-1 mt-1">
                    {note.content.slice(0, 100)}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>
      </Command>
    </div>
  )
}

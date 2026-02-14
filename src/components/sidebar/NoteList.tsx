import { Virtuoso } from 'react-virtuoso'
import { useStore } from '@/stores'
import { NoteCard } from './NoteCard'
import { Note } from '@/types/note'

export function NoteList() {
  const notes = useStore((state) => Array.from(state.notes.values()))
  const searchQuery = useStore((state) => state.searchQuery)

  // Filter by search query
  const filteredNotes = notes.filter((note) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    )
  })

  // Sort by most recently updated
  const sortedNotes = [...filteredNotes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )

  if (sortedNotes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-secondary p-4 text-center">
        No notes yet. Create your first note to get started.
      </div>
    )
  }

  return (
    <Virtuoso
      data={sortedNotes}
      itemContent={(_index, note: Note) => <NoteCard key={note.id} note={note} />}
      style={{ height: '100%' }}
      overscan={5}
    />
  )
}

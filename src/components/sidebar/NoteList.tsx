import { Virtuoso } from 'react-virtuoso'
import { useStore } from '@/stores'
import { NoteCard } from './NoteCard'
import { Note } from '@/types/note'

export function NoteList() {
  const notes = useStore((state) => Array.from(state.notes.values()))

  // Sort by most recently updated
  const sortedNotes = [...notes].sort(
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

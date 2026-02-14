import { Note } from '@/types/note'
import { useStore } from '@/stores'

interface NoteCardProps {
  note: Note
}

export function NoteCard({ note }: NoteCardProps) {
  const selectedNoteId = useStore((state) => state.selectedNoteId)
  const setSelectedNoteId = useStore((state) => state.setSelectedNoteId)

  const isSelected = selectedNoteId === note.id
  const preview = note.content.slice(0, 100).replace(/\n/g, ' ')

  return (
    <button
      onClick={() => setSelectedNoteId(note.id)}
      className={`w-full text-left px-4 py-3 border-b border-divider hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-gray-100' : ''
      }`}
    >
      <h3 className="font-semibold text-text mb-1 truncate">{note.title || 'Untitled'}</h3>
      <p className="text-sm text-secondary line-clamp-2">{preview}</p>
      <div className="flex items-center gap-2 mt-2 text-xs text-secondary">
        <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
      </div>
    </button>
  )
}

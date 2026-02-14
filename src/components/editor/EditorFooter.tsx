import { useEditor } from './Editor'
import { useStore } from '@/stores'

export function EditorFooter() {
  const { noteId, isSaving } = useEditor()
  const note = useStore((state) => (noteId ? state.notes.get(noteId) : null))

  if (!note) return null

  return (
    <div className="py-2 text-xs text-secondary flex items-center justify-between border-t border-divider">
      <div>
        {isSaving ? (
          <span className="text-focus">Saving...</span>
        ) : (
          <span>
            Last saved{' '}
            {new Date(note.updatedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
      </div>
      <div className="flex gap-4">
        <span>{note.content.length} characters</span>
        <span>{note.content.split(/\s+/).filter(Boolean).length} words</span>
      </div>
    </div>
  )
}

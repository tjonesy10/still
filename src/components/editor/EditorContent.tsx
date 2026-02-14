import { useEffect } from 'react'
import { useEditor } from './Editor'
import { useNoteLinks } from '@/hooks/useNoteLinks'
import { useStore } from '@/stores'
import { Note } from '@/types/note'

export function EditorContent() {
  const { noteId, content, setContent } = useEditor()
  const { links } = useNoteLinks(content)
  const updateLinksForNote = useStore((state) => state.updateLinksForNote)
  const setSelectedNoteId = useStore((state) => state.setSelectedNoteId)
  const addNote = useStore((state) => state.addNote)

  // Update links in store when content changes
  useEffect(() => {
    if (noteId) {
      const linkTexts = links.map((link) => link.text)
      updateLinksForNote(noteId, linkTexts)
    }
  }, [noteId, links, updateLinksForNote])

  const handleCreateOrphanNote = (linkText: string) => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      userId: 'local-user',
      title: linkText,
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {},
    }
    addNote(newNote)
    setSelectedNoteId(newNote.id)
  }

  return (
    <div className="flex-1 py-6 overflow-y-auto flex flex-col">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing... Use [[note title]] to create links."
        className="flex-1 w-full min-h-[300px] bg-transparent border-none outline-none resize-none text-text placeholder-secondary focus:ring-0 font-mono leading-relaxed"
      />
      
      {/* Link indicators */}
      {links.length > 0 && (
        <div className="mt-4 pt-4 border-t border-divider">
          <h4 className="text-xs font-semibold text-secondary mb-2">
            Links in this note ({links.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {links.map((link, index) => (
              <button
                key={index}
                onClick={() =>
                  link.isOrphan
                    ? handleCreateOrphanNote(link.text)
                    : link.noteId && setSelectedNoteId(link.noteId)
                }
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  link.isOrphan
                    ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 cursor-pointer'
                    : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 cursor-pointer'
                }`}
                title={link.isOrphan ? 'Note not found - click to create' : 'Click to open'}
              >
                {link.text}
                {link.isOrphan && ' ⚠️'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

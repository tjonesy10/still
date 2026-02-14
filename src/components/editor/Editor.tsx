import { createContext, useContext, useState, useEffect } from 'react'
import { useStore } from '@/stores'
import { useDebouncedCallback } from '@/hooks/useDebounce'
import { EditorToolbar } from './EditorToolbar'
import { EditorContent } from './EditorContent'
import { EditorFooter } from './EditorFooter'

interface EditorContextValue {
  noteId: string | null
  title: string
  content: string
  setTitle: (title: string) => void
  setContent: (content: string) => void
  isSaving: boolean
}

const EditorContext = createContext<EditorContextValue | null>(null)

export function Editor({ noteId }: { noteId: string | null }) {
  const note = useStore((state) => (noteId ? state.notes.get(noteId) : null))
  const updateNote = useStore((state) => state.updateNote)

  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [isSaving, setIsSaving] = useState(false)

  // Sync with store when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
    }
  }, [note?.id])

  // Debounced auto-save (500ms)
  const debouncedSave = useDebouncedCallback(
    async (noteId: string, title: string, content: string) => {
      setIsSaving(true)
      try {
        await updateNote(noteId, { title, content })
      } catch (error) {
        console.error('Failed to save note:', error)
      } finally {
        setIsSaving(false)
      }
    },
    500
  )

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    if (noteId) {
      debouncedSave(noteId, newTitle, content)
    }
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    if (noteId) {
      debouncedSave(noteId, title, newContent)
    }
  }

  if (!noteId) {
    return (
      <div className="flex items-center justify-center h-full text-secondary">
        Select a note to start editing
      </div>
    )
  }

  return (
    <EditorContext.Provider
      value={{
        noteId,
        title,
        content,
        setTitle: handleTitleChange,
        setContent: handleContentChange,
        isSaving,
      }}
    >
      <div className="flex flex-col h-full max-w-[680px] mx-auto">
        <Editor.Toolbar />
        <Editor.Content />
        <Editor.Footer />
      </div>
    </EditorContext.Provider>
  )
}

Editor.Toolbar = EditorToolbar
Editor.Content = EditorContent
Editor.Footer = EditorFooter

export const useEditor = () => {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditor must be used within Editor')
  }
  return context
}

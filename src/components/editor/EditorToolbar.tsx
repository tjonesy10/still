import { useEditor } from './Editor'

export function EditorToolbar() {
  const { title, setTitle } = useEditor()

  return (
    <div className="py-4 border-b border-divider">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title..."
        className="w-full text-2xl font-semibold bg-transparent border-none outline-none text-text placeholder-secondary focus:ring-0"
        autoFocus
      />
    </div>
  )
}

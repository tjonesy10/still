import { useEditor } from './Editor'

export function EditorContent() {
  const { content, setContent } = useEditor()

  return (
    <div className="flex-1 py-6 overflow-y-auto">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing... Use [[note title]] to create links."
        className="w-full h-full min-h-[300px] bg-transparent border-none outline-none resize-none text-text placeholder-secondary focus:ring-0 font-mono leading-relaxed"
      />
    </div>
  )
}

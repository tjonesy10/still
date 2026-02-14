import { useStore } from '@/stores'
import { NoteList } from './NoteList'

export function Sidebar() {
  const isSidebarOpen = useStore((state) => state.isSidebarOpen)
  const searchQuery = useStore((state) => state.searchQuery)
  const setSearchQuery = useStore((state) => state.setSearchQuery)

  if (!isSidebarOpen) return null

  return (
    <div className="w-80 h-full border-r border-divider flex flex-col bg-background">
      <div className="p-4 border-b border-divider">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes..."
          className="w-full px-3 py-2 text-sm border border-divider rounded-md bg-background text-text placeholder-secondary focus:outline-none focus:ring-2 focus:ring-focus"
        />
      </div>
      <div className="flex-1 overflow-hidden">
        <NoteList />
      </div>
    </div>
  )
}

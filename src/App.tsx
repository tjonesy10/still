import { AuthProvider, SyncProvider } from './providers'
import { Sidebar } from './components/sidebar'
import { Editor } from './components/editor'
import { GraphView } from './components/graph'
import { CommandPalette } from './components/command'
import { useStore } from './stores'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

function App() {
  useKeyboardShortcuts()

  const selectedNoteId = useStore((state) => state.selectedNoteId)
  const viewMode = useStore((state) => state.viewMode)
  const setViewMode = useStore((state) => state.setViewMode)
  const toggleSidebar = useStore((state) => state.toggleSidebar)
  const openCommandPalette = useStore((state) => state.openCommandPalette)

  return (
    <AuthProvider>
      <SyncProvider>
        <div className="h-screen flex flex-col bg-background">
          {/* Header */}
          <header className="h-12 px-4 flex items-center justify-between border-b border-divider">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label="Toggle sidebar"
              >
                <svg
                  className="w-5 h-5 text-text"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-text">Still</h1>
            </div>
            <div className="flex items-center gap-3">
              {/* View mode toggle */}
              <div className="flex border border-divider rounded">
                <button
                  onClick={() => setViewMode('editor')}
                  className={`px-3 py-1 text-sm transition-colors ${
                    viewMode === 'editor'
                      ? 'bg-gray-100 text-text'
                      : 'text-secondary hover:bg-gray-50'
                  }`}
                >
                  Editor
                </button>
                <button
                  onClick={() => setViewMode('graph')}
                  className={`px-3 py-1 text-sm transition-colors ${
                    viewMode === 'graph'
                      ? 'bg-gray-100 text-text'
                      : 'text-secondary hover:bg-gray-50'
                  }`}
                >
                  Graph
                </button>
              </div>
              <button
                onClick={openCommandPalette}
                className="flex items-center gap-2 px-3 py-1 text-sm text-secondary border border-divider rounded hover:bg-gray-50 transition-colors"
              >
                <span>Search</span>
                <kbd className="text-xs">⌘K</kbd>
              </button>
            </div>
          </header>

          {/* Main content */}
          <div className="flex-1 flex overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              {viewMode === 'editor' ? (
                <div className="p-8">
                  <Editor noteId={selectedNoteId} />
                </div>
              ) : (
                <GraphView />
              )}
            </main>
          </div>

          {/* Command Palette */}
          <CommandPalette />
        </div>
      </SyncProvider>
    </AuthProvider>
  )
}

export default App

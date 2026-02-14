import { AuthProvider, SyncProvider } from './providers'
import { Sidebar } from './components/sidebar'
import { Editor } from './components/editor'
import { useStore } from './stores'

function App() {
  const selectedNoteId = useStore((state) => state.selectedNoteId)
  const toggleSidebar = useStore((state) => state.toggleSidebar)

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
          </header>

          {/* Main content */}
          <div className="flex-1 flex overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-auto p-8">
              <Editor noteId={selectedNoteId} />
            </main>
          </div>
        </div>
      </SyncProvider>
    </AuthProvider>
  )
}

export default App

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react'
import { useStore } from '@/stores'
import { Note } from '@/types/note'

interface SyncContextValue {
  isConnected: boolean
  lastSync: Date | null
  sendMessage: (message: any) => void
}

const SyncContext = createContext<SyncContextValue | null>(null)

interface WebSocketMessage {
  type: string
  data: any
}

export function SyncProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const ws = useRef<WebSocket | null>(null)
  const reconnectAttempts = useRef(0)
  const reconnectTimeout = useRef<NodeJS.Timeout>()
  const isIntentionalClose = useRef(false)

  useEffect(() => {
    connect()
    return () => {
      isIntentionalClose.current = true
      disconnect()
    }
  }, [])

  const connect = () => {
    const token = localStorage.getItem('auth_token')
    if (!token) return

    try {
      ws.current = new WebSocket(
        `${import.meta.env.VITE_WS_URL || 'wss://api.lovable.cloud'}/ws?token=${token}`
      )

      ws.current.onopen = () => {
        console.log('[SyncProvider] WebSocket connected')
        setIsConnected(true)
        reconnectAttempts.current = 0
      }

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          handleMessage(message)
          setLastSync(new Date())
        } catch (error) {
          console.error('[SyncProvider] Failed to parse message:', error)
        }
      }

      ws.current.onerror = (error) => {
        console.error('[SyncProvider] WebSocket error:', error)
      }

      ws.current.onclose = (event) => {
        console.log('[SyncProvider] WebSocket closed:', event.code, event.reason)
        setIsConnected(false)

        // Only reconnect if not intentionally closed
        if (!isIntentionalClose.current) {
          scheduleReconnect()
        }
      }
    } catch (error) {
      console.error('[SyncProvider] Failed to create WebSocket:', error)
      scheduleReconnect()
    }
  }

  const scheduleReconnect = () => {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (max)
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
    reconnectAttempts.current++

    console.log(
      `[SyncProvider] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`
    )

    reconnectTimeout.current = setTimeout(() => {
      connect()
    }, delay)
  }

  const handleMessage = (message: WebSocketMessage) => {
    console.log('[SyncProvider] Received message:', message.type)

    switch (message.type) {
      case 'note:created':
        handleNoteCreated(message.data)
        break
      case 'note:updated':
        handleNoteUpdated(message.data)
        break
      case 'note:deleted':
        handleNoteDeleted(message.data)
        break
      case 'sync:conflict':
        handleConflict(message.data)
        break
      default:
        console.warn('[SyncProvider] Unknown message type:', message.type)
    }
  }

  const handleNoteCreated = (note: Note) => {
    useStore.getState().addNote(note)
  }

  const handleNoteUpdated = (serverNote: Note) => {
    const localNote = useStore.getState().notes.get(serverNote.id)

    // Last-Write-Wins: Compare timestamps
    if (!localNote || new Date(serverNote.updatedAt) > new Date(localNote.updatedAt)) {
      useStore.getState().addNote(serverNote)
    } else {
      console.log('[SyncProvider] Local version is newer, keeping local')
    }
  }

  const handleNoteDeleted = (data: { id: string }) => {
    // Remove from optimistic updates if present
    useStore.getState().notes.delete(data.id)
  }

  const handleConflict = (data: {
    noteId: string
    serverVersion: Note
    localVersion: Note
  }) => {
    // For now, always use server version (Last-Write-Wins)
    // In the future, we could show a conflict resolution UI
    console.warn('[SyncProvider] Conflict detected, using server version')
    useStore.getState().addNote(data.serverVersion)
  }

  const sendMessage = (message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message))
    } else {
      console.error('[SyncProvider] WebSocket not connected, cannot send message')
    }
  }

  const disconnect = () => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current)
    }
    if (ws.current) {
      ws.current.close(1000, 'Component unmounted')
      ws.current = null
    }
  }

  return (
    <SyncContext.Provider value={{ isConnected, lastSync, sendMessage }}>
      {children}
    </SyncContext.Provider>
  )
}

export const useSync = () => {
  const context = useContext(SyncContext)
  if (!context) {
    throw new Error('useSync must be used within SyncProvider')
  }
  return context
}

/**
 * Note types and interfaces
 */

export interface Note {
  id: string
  userId: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
  metadata: NoteMetadata
}

export interface NoteMetadata {
  tags?: string[]
  color?: string
  position?: {
    x: number
    y: number
  }
  attribution?: AttributionMetadata
  [key: string]: unknown
}

export interface AttributionMetadata {
  type: 'linked' | 'forked'
  authorDisplayName: string
  authorHandle: string
  publishedNoteId: string
  publishedSlug: string
  attachedAt: string
  versionAttached: number
}

export interface NoteWithLinks extends Note {
  outgoingLinks: Link[]
  incomingLinks: Link[]
}

export interface Link {
  id: string
  sourceNoteId: string
  targetNoteId: string
  createdAt: Date
  context?: string
}

export interface ParsedLink {
  title: string
  start: number
  end: number
}

export interface GraphNode {
  id: string
  title: string
  connections: number
  x?: number
  y?: number
}

export interface GraphEdge {
  source: string
  target: string
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

// API request/response types
export interface CreateNoteRequest {
  title: string
  content?: string
  metadata?: Partial<NoteMetadata>
}

export interface UpdateNoteRequest {
  title?: string
  content?: string
  metadata?: Partial<NoteMetadata>
}

export interface NotesListResponse {
  notes: Note[]
  total: number
  hasMore: boolean
}

export interface SearchResult {
  note: Note
  score: number
  highlights: string[]
}

export interface SearchResponse {
  results: SearchResult[]
}

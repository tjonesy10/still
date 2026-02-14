/**
 * Publishing and versioning types
 */

export interface PublishedNote {
  id: string
  userId: string
  sourceNoteId: string
  slug: string
  visibility: 'public' | 'unlisted'
  allowForks: boolean
  currentVersionId: string
  createdAt: Date
  updatedAt: Date
  viewCount: number
}

export interface PublishedNoteWithUser extends PublishedNote {
  user: {
    displayName: string
    handle: string
  }
  currentVersion: Version
  versions?: VersionSummary[]
}

export interface Version {
  id: string
  publishedNoteId: string
  versionNumber: number
  title: string
  content: string
  links: string[]
  createdAt: Date
  changeLog?: string
}

export interface VersionSummary {
  versionNumber: number
  createdAt: Date
  changeLog?: string
}

export interface Attachment {
  id: string
  userId: string
  publishedNoteId: string
  attachmentType: 'linked' | 'forked'
  localNoteId: string
  attachedVersionId: string
  currentVersionId: string
  createdAt: Date
  lastSyncedAt?: Date
  hasPendingUpdate: boolean
}

export interface AttachmentWithDetails extends Attachment {
  publishedNote: PublishedNote
  localNote: Note
  attachedVersion: Version
  currentVersion: Version
}

// API request/response types
export interface PublishNoteRequest {
  sourceNoteId: string
  slug: string
  visibility: 'public' | 'unlisted'
  allowForks: boolean
}

export interface CreateVersionRequest {
  changeLog?: string
}

export interface CreateAttachmentRequest {
  publishedNoteId: string
  attachmentType: 'linked' | 'forked'
}

export interface UpdateAttachmentRequest {
  attachmentType?: 'linked' | 'forked'
}

# Still - Data Model Specification

## Entity Relationship Diagram (ERD)

```
User 1────────* Note
User 1────────* PublishedNote
Note *────────* Link
Note 1────────* PublishedNote
PublishedNote 1────────* Version
PublishedNote 1────────* Attachment
User 1────────* Attachment
```

## Core Entities

### User

**Purpose:** Represents a registered user account

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique user identifier |
| email | String | UNIQUE, NOT NULL | User email address |
| passwordHash | String | NOT NULL | Bcrypt hashed password |
| displayName | String | NOT NULL | Public display name |
| handle | String | UNIQUE, NOT NULL | URL-safe username (@handle) |
| createdAt | Timestamp | NOT NULL | Account creation timestamp |
| updatedAt | Timestamp | NOT NULL | Last profile update |
| settings | JSON | NOT NULL | User preferences (theme, AI opt-in, etc.) |

**Indexes:**
- `idx_user_email` on `email`
- `idx_user_handle` on `handle`

---

### Note

**Purpose:** Private note belonging to a user

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique note identifier |
| userId | UUID | FK(User.id), NOT NULL | Owner of the note |
| title | String(255) | NOT NULL | Note title |
| content | Text | NOT NULL | Markdown content |
| createdAt | Timestamp | NOT NULL | Note creation timestamp |
| updatedAt | Timestamp | NOT NULL | Last edit timestamp |
| deletedAt | Timestamp | NULLABLE | Soft delete timestamp |
| metadata | JSON | NOT NULL | Custom fields (tags, position, etc.) |

**Indexes:**
- `idx_note_user` on `userId`
- `idx_note_updated` on `updatedAt DESC`
- `idx_note_title_fulltext` full-text on `title`
- `idx_note_content_fulltext` full-text on `content`

**Relations:**
- `user`: Many-to-One with User
- `outgoingLinks`: One-to-Many with Link (as source)
- `incomingLinks`: One-to-Many with Link (as target)
- `publishedVersions`: One-to-Many with PublishedNote

---

### Link

**Purpose:** Represents a connection between two notes (bidirectional index)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique link identifier |
| sourceNoteId | UUID | FK(Note.id), NOT NULL | Note containing the [[link]] |
| targetNoteId | UUID | FK(Note.id), NOT NULL | Note being referenced |
| createdAt | Timestamp | NOT NULL | Link creation timestamp |
| context | String(500) | NULLABLE | Surrounding text for preview |

**Unique Constraint:**
- `unique_link` on `(sourceNoteId, targetNoteId)`

**Indexes:**
- `idx_link_source` on `sourceNoteId`
- `idx_link_target` on `targetNoteId`

**Relations:**
- `sourceNote`: Many-to-One with Note
- `targetNote`: Many-to-One with Note

---

### PublishedNote

**Purpose:** Published version of a note (public/unlisted)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique published note ID |
| userId | UUID | FK(User.id), NOT NULL | Author |
| sourceNoteId | UUID | FK(Note.id), NOT NULL | Original private note |
| slug | String(100) | NOT NULL | URL-friendly identifier |
| visibility | Enum | NOT NULL | 'public', 'unlisted' |
| allowForks | Boolean | NOT NULL | Whether forks are allowed |
| currentVersionId | UUID | FK(Version.id), NULLABLE | Latest published version |
| createdAt | Timestamp | NOT NULL | First publish timestamp |
| updatedAt | Timestamp | NOT NULL | Last version publish timestamp |
| viewCount | Integer | NOT NULL, DEFAULT 0 | Number of views |

**Unique Constraint:**
- `unique_user_slug` on `(userId, slug)`

**Indexes:**
- `idx_published_user` on `userId`
- `idx_published_slug` on `slug`
- `idx_published_visibility` on `visibility`

**Relations:**
- `user`: Many-to-One with User
- `sourceNote`: Many-to-One with Note
- `versions`: One-to-Many with Version
- `currentVersion`: One-to-One with Version
- `attachments`: One-to-Many with Attachment

---

### Version

**Purpose:** Immutable version snapshot of a published note

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique version identifier |
| publishedNoteId | UUID | FK(PublishedNote.id), NOT NULL | Parent published note |
| versionNumber | Integer | NOT NULL | Sequential version (1, 2, 3...) |
| title | String(255) | NOT NULL | Title snapshot |
| content | Text | NOT NULL | Content snapshot |
| links | JSON | NOT NULL | Array of [[links]] at publish time |
| createdAt | Timestamp | NOT NULL | Version publish timestamp |
| changeLog | String(1000) | NULLABLE | Author's change description |

**Unique Constraint:**
- `unique_version_number` on `(publishedNoteId, versionNumber)`

**Indexes:**
- `idx_version_published` on `publishedNoteId`
- `idx_version_number` on `(publishedNoteId, versionNumber DESC)`

**Relations:**
- `publishedNote`: Many-to-One with PublishedNote

---

### Attachment

**Purpose:** Represents a user's attachment/fork of a published note

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique attachment identifier |
| userId | UUID | FK(User.id), NOT NULL | User who attached/forked |
| publishedNoteId | UUID | FK(PublishedNote.id), NOT NULL | Source published note |
| attachmentType | Enum | NOT NULL | 'linked', 'forked' |
| localNoteId | UUID | FK(Note.id), NOT NULL | User's local note reference |
| attachedVersionId | UUID | FK(Version.id), NOT NULL | Version initially attached |
| currentVersionId | UUID | FK(Version.id), NOT NULL | Latest available version |
| createdAt | Timestamp | NOT NULL | Attachment timestamp |
| lastSyncedAt | Timestamp | NULLABLE | Last sync for linked attachments |
| hasPendingUpdate | Boolean | NOT NULL, DEFAULT false | Update available flag |

**Indexes:**
- `idx_attachment_user` on `userId`
- `idx_attachment_published` on `publishedNoteId`
- `idx_attachment_pending` on `(userId, hasPendingUpdate)` WHERE `attachmentType='linked'`

**Relations:**
- `user`: Many-to-One with User
- `publishedNote`: Many-to-One with PublishedNote
- `localNote`: Many-to-One with Note
- `attachedVersion`: Many-to-One with Version
- `currentVersion`: Many-to-One with Version

---

## Data Model Rules

### Link Management
1. When a note title changes, `Link.targetNoteId` remains unchanged (links by ID, not title)
2. Links are created/destroyed based on `[[...]]` parsing in `Note.content`
3. Orphan links (targetNoteId doesn't exist) are allowed and trigger "create note" flow
4. Deleting a note soft-deletes it and marks all links as broken (UI shows differently)

### Publishing Workflow
1. Publishing creates a `PublishedNote` and first `Version` (v1)
2. Re-publishing creates a new `Version` and updates `PublishedNote.currentVersionId`
3. Un-publishing deletes `PublishedNote` (cascade deletes `Versions` and `Attachments`)

### Attachment/Fork Workflow
1. **Linked Attachment:**
   - `attachmentType = 'linked'`
   - `localNoteId` points to a read-only reference note
   - `hasPendingUpdate = true` when `currentVersionId > attachedVersionId`
   - User can pull updates (replaces content, increments `attachedVersionId`)

2. **Forked Copy:**
   - `attachmentType = 'forked'`
   - `localNoteId` points to an editable copy
   - `hasPendingUpdate` always false (independent copy)
   - User can edit freely; no sync

### Attribution
- Every `Attachment.localNote` includes metadata:
  ```json
  {
    "attribution": {
      "author": "User.displayName",
      "authorHandle": "User.handle",
      "publishedNoteId": "PublishedNote.id",
      "publishedSlug": "PublishedNote.slug",
      "attachedAt": "Attachment.createdAt",
      "versionAttached": "Version.versionNumber"
    }
  }
  ```

### Versioning Logic
- Versions are immutable and sequential
- `PublishedNote.currentVersionId` always points to latest
- Deleting a version is not allowed (break references)
- Users attached to old versions can view history and upgrade

---

## Client-Side Data Structures

### TypeScript Interfaces

```typescript
// Note entity
interface Note {
  id: string
  userId: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
  metadata: {
    tags?: string[]
    color?: string
    position?: { x: number; y: number }
  }
  // Computed/joined
  outgoingLinks?: Link[]
  incomingLinks?: Link[]
}

// Link entity
interface Link {
  id: string
  sourceNoteId: string
  targetNoteId: string
  createdAt: Date
  context?: string
  // Computed
  sourceNote?: Note
  targetNote?: Note
}

// Graph node (derived from Note + Links)
interface GraphNode {
  id: string
  title: string
  x?: number
  y?: number
  connections: number // Count of total links
}

interface GraphEdge {
  source: string
  target: string
}

// Published note
interface PublishedNote {
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
  // Computed/joined
  user?: Pick<User, 'displayName' | 'handle'>
  currentVersion?: Version
  versions?: Version[]
}

// Version
interface Version {
  id: string
  publishedNoteId: string
  versionNumber: number
  title: string
  content: string
  links: string[] // Array of [[linked note titles]]
  createdAt: Date
  changeLog?: string
}

// Attachment
interface Attachment {
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
  // Computed/joined
  publishedNote?: PublishedNote
  localNote?: Note
  attachedVersion?: Version
  currentVersion?: Version
}

// User
interface User {
  id: string
  email: string
  displayName: string
  handle: string
  createdAt: Date
  settings: {
    theme?: 'light' | 'dark'
    aiEnabled?: boolean
  }
}
```

---

## Database Migrations Strategy

1. **Migration 001:** Users table
2. **Migration 002:** Notes table
3. **Migration 003:** Links table
4. **Migration 004:** PublishedNotes table
5. **Migration 005:** Versions table
6. **Migration 006:** Attachments table
7. **Migration 007:** Full-text indexes (Note.title, Note.content)
8. **Migration 008:** Cascade delete rules

---

## Performance Considerations

### Query Optimization
- **Graph queries:** Limit depth to 2-3 hops, paginate nodes
- **Backlinks:** Precompute count, lazy-load list
- **Search:** Use full-text indexes, cache frequently accessed notes

### Caching Strategy
- **Client-side:** IndexedDB for offline notes
- **Server-side:** Redis for published note views, user sessions
- **CDN:** Published note public pages

### Scalability
- **Partition:** Notes by `userId` for horizontal scaling
- **Archive:** Soft-deleted notes older than 1 year
- **Limits:** Max 10,000 notes per user, max 100,000 links per user

---

## Data Integrity Constraints

### Foreign Keys
- All FK constraints with `ON DELETE CASCADE` except:
  - `PublishedNote.sourceNoteId`: `ON DELETE SET NULL` (allow publishing of deleted notes)
  - `Attachment.publishedNoteId`: `ON DELETE CASCADE` (clean up when source unpublished)

### Soft Deletes
- Notes use `deletedAt` timestamp
- Queries filter `WHERE deletedAt IS NULL`
- Links to deleted notes show "broken link" UI

### Circular Link Prevention
- Allow circular links (user decision)
- Detect cycles in graph visualization (limit rendering depth)

---

## API Sync Protocol

### Real-time Sync (WebSocket)
- Events: `note.created`, `note.updated`, `note.deleted`, `link.created`, `link.deleted`
- Client subscribes to user-specific channel
- Optimistic UI updates, rollback on conflict

### Conflict Resolution
- **Last-write-wins** with timestamp comparison
- Show conflict UI if local `updatedAt` > server `updatedAt` during sync
- User chooses: Keep local, Keep server, or Manual merge

---

## Security Model

### Row-Level Security (RLS)
- Users can only read/write their own `Note` rows
- Users can read `PublishedNote` if visibility='public' or they have the URL (unlisted)
- Users can read `Attachment` rows where `userId = currentUser.id`

### API Authorization
- All `/api/notes/*` endpoints require auth token
- `/api/published/*` endpoints allow anonymous reads (public notes)
- `/api/users/me` endpoints require auth token

---

## Example Queries

### Get note with backlinks
```sql
SELECT n.*,
       json_agg(json_build_object('id', ln.id, 'sourceNoteId', ln.sourceNoteId, 'context', ln.context)) AS backlinks
FROM notes n
LEFT JOIN links ln ON ln.targetNoteId = n.id
WHERE n.id = ?
  AND n.deletedAt IS NULL
GROUP BY n.id
```

### Get graph for user
```sql
SELECT n.id, n.title,
       COUNT(DISTINCT l_out.id) + COUNT(DISTINCT l_in.id) AS connections
FROM notes n
LEFT JOIN links l_out ON l_out.sourceNoteId = n.id
LEFT JOIN links l_in ON l_in.targetNoteId = n.id
WHERE n.userId = ?
  AND n.deletedAt IS NULL
GROUP BY n.id
```

### Get pending attachment updates
```sql
SELECT a.*, pn.*, v_current.versionNumber AS currentVersionNumber
FROM attachments a
JOIN published_notes pn ON pn.id = a.publishedNoteId
JOIN versions v_current ON v_current.id = a.currentVersionId
WHERE a.userId = ?
  AND a.attachmentType = 'linked'
  AND a.hasPendingUpdate = true
```

---

This data model supports:
- ✅ Core note-taking with [[links]]
- ✅ Bidirectional link index for backlinks
- ✅ Publishing with versioning
- ✅ Forking/attachment with attribution
- ✅ Real-time sync
- ✅ Conflict resolution
- ✅ Privacy controls
- ✅ Performance at scale

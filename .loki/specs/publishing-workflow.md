# Still - Publishing & Forking Workflow

## User Flows

### 1. Publish a Note

**Trigger:** User clicks "Publish" button in EditorPage

**Steps:**
1. Open PublishDialog
2. User configures:
   - Slug (pre-filled with sanitized title, editable)
   - Visibility (public / unlisted)
   - Allow forks toggle (default: true)
3. User clicks "Publish"
4. API call: `POST /published`
5. PublishedNote created with Version v1
6. Redirect to published note page or show success toast
7. "Publish" button changes to "Update"

**Validation:**
- Slug must be unique for this user
- Slug format: lowercase, hyphens, alphanumeric only
- Duplicate slug error: "Slug already in use. Try: {suggestion}"

---

### 2. Update Published Note

**Trigger:** User clicks "Update" button (note already published)

**Steps:**
1. Open PublishDialog (pre-filled with existing settings)
2. User optionally adds change log description
3. User clicks "Update"
4. API call: `POST /published/{id}/versions`
5. New Version created (increments version number)
6. PublishedNote.currentVersionId updated
7. All linked attachments set `hasPendingUpdate = true`
8. Success notification: "Version {n} published"

**Change Log:**
- Optional textarea in PublishDialog
- Shown in version history
- Examples: "Added section on performance", "Fixed typos"

---

### 3. Unpublish Note

**Trigger:** User clicks "Unpublish" in PublishDialog

**Steps:**
1. Confirmation modal: "Are you sure? This will delete all versions and break attachments."
2. User confirms
3. API call: `DELETE /published/{handle}/{slug}`
4. PublishedNote and all Versions deleted
5. All Attachments deleted (cascade)
6. Success notification: "Note unpublished"

**Impact:**
- Users who attached this note see "Source unpublished" in their notes
- Forked copies remain (independent)
- Linked attachments show error

---

### 4. Attach Published Note

**Trigger:** User clicks "Attach to my graph" on PublishedNotePage

**Steps:**
1. Open AttachDialog
2. User chooses mode:
   - **Linked Attachment:** Stays synced with source
   - **Forked Copy:** Independent, editable copy
3. User clicks "Attach"
4. API call: `POST /attachments`
5. New Note created in user's private notes
6. Note content = PublishedNote.currentVersion content
7. Note metadata includes attribution:
   ```json
   {
     "attribution": {
       "type": "linked" | "forked",
       "authorDisplayName": "Jane Doe",
       "authorHandle": "jane",
       "publishedNoteId": "uuid",
       "publishedSlug": "great-idea",
       "attachedAt": "2026-02-14T20:00:00Z",
       "versionAttached": 1
     }
   }
   ```
8. Navigate to new note or show success toast

**Linked vs Forked:**

| Aspect | Linked Attachment | Forked Copy |
|--------|-------------------|-------------|
| Editable | No (read-only reference) | Yes (fully editable) |
| Updates | Pull manually when available | Never updates |
| Attribution | Always visible | Always visible |
| Independence | Depends on source | Fully independent |

---

### 5. Pull Update (Linked Attachment)

**Trigger:** User sees "Update available" indicator on linked note

**Steps:**
1. User clicks "Update available" badge
2. Modal shows diff:
   - Current version: v2
   - Available version: v3
   - Change log: "Added new section"
   - Diff view (side-by-side or inline)
3. User clicks "Pull update"
4. API call: `POST /attachments/{id}/sync`
5. Note content replaced with latest version content
6. Attachment.attachedVersionId = Attachment.currentVersionId
7. Attachment.hasPendingUpdate = false
8. Success notification: "Updated to version {n}"

**Conflict Handling:**
- If user has local edits to linked note (shouldn't happen, read-only)
- Show warning: "This will overwrite your changes"
- Or: Don't allow edits to linked notes (enforce read-only)

**Recommendation:** Enforce read-only for linked attachments

---

### 6. Convert Linked to Forked

**Trigger:** User wants to edit a linked attachment

**Steps:**
1. User clicks "Edit" on linked note
2. Modal: "This note is linked. Convert to editable fork?"
3. User confirms
4. API call: `PATCH /attachments/{id}` with `{ attachmentType: "forked" }`
5. Attachment.attachmentType = "forked"
6. Note becomes editable
7. No further updates from source

---

## UI Components

### PublishDialog

**Location:** `src/components/dialogs/PublishDialog.tsx`

**Props:**
```typescript
interface PublishDialogProps {
  noteId: string
  existingPublish?: PublishedNote
  onClose: () => void
  onSuccess: () => void
}
```

**Form Fields:**
```tsx
<Dialog>
  <DialogHeader>
    <DialogTitle>{existingPublish ? 'Update' : 'Publish'}</DialogTitle>
  </DialogHeader>

  <form onSubmit={handleSubmit}>
    {/* Slug */}
    <Label>URL Slug</Label>
    <Input
      value={slug}
      onChange={handleSlugChange}
      placeholder="my-note-title"
      pattern="^[a-z0-9-]+$"
    />
    <Caption>
      {`will be published at: still.app/@{handle}/{slug}`}
    </Caption>

    {/* Visibility */}
    <RadioGroup value={visibility} onChange={setVisibility}>
      <Radio value="public">Public (discoverable)</Radio>
      <Radio value="unlisted">Unlisted (link only)</Radio>
    </RadioGroup>

    {/* Allow forks */}
    <Toggle
      checked={allowForks}
      onChange={setAllowForks}
      label="Allow others to fork"
    />

    {/* Change log (if updating) */}
    {existingPublish && (
      <>
        <Label>Change Log (optional)</Label>
        <Textarea
          value={changeLog}
          onChange={setChangeLog}
          placeholder="What changed in this version?"
        />
      </>
    )}

    {/* Actions */}
    <DialogFooter>
      <Button variant="ghost" onClick={onClose}>
        Cancel
      </Button>
      {existingPublish && (
        <Button variant="destructive" onClick={handleUnpublish}>
          Unpublish
        </Button>
      )}
      <Button type="submit" variant="default">
        {existingPublish ? 'Update' : 'Publish'}
      </Button>
    </DialogFooter>
  </form>
</Dialog>
```

---

### AttachDialog

**Location:** `src/components/dialogs/AttachDialog.tsx`

**Props:**
```typescript
interface AttachDialogProps {
  publishedNoteId: string
  allowForks: boolean
  onClose: () => void
}
```

**UI:**
```tsx
<Dialog>
  <DialogHeader>
    <DialogTitle>Attach to Your Graph</DialogTitle>
  </DialogHeader>

  <RadioGroup value={mode} onChange={setMode}>
    <Radio value="linked">
      <strong>Linked Attachment</strong>
      <p>Stays synced with updates. Read-only.</p>
    </Radio>
    <Radio value="forked" disabled={!allowForks}>
      <strong>Forked Copy</strong>
      <p>Independent copy you can edit freely.</p>
      {!allowForks && <span>(Author disabled forks)</span>}
    </Radio>
  </RadioGroup>

  <DialogFooter>
    <Button variant="ghost" onClick={onClose}>Cancel</Button>
    <Button onClick={handleAttach}>Attach</Button>
  </DialogFooter>
</Dialog>
```

---

### Update Badge

**Location:** Inline in note list / editor header

**UI:**
```tsx
{attachment.hasPendingUpdate && (
  <button
    onClick={openUpdateModal}
    className="update-badge"
  >
    Update available
  </button>
)}
```

**Styling:**
- Subtle badge (not intrusive)
- Color: `#C7CDD6` (focus color)
- Hover: slightly darker
- Position: Top-right of note title

---

### Attribution Banner

**Location:** Bottom of attached notes (read mode)

**UI:**
```tsx
<div className="attribution-banner">
  <span>
    Originally published by{' '}
    <a href={`/@${attribution.authorHandle}`}>
      @{attribution.authorHandle}
    </a>
  </span>
  <span className="separator">·</span>
  <span>
    <a href={`/@${attribution.authorHandle}/${attribution.publishedSlug}`}>
      View source
    </a>
  </span>
  {attachmentType === 'linked' && (
    <>
      <span className="separator">·</span>
      <span>Version {versionAttached}</span>
    </>
  )}
</div>
```

**Styling:**
- Font size: 13px (caption)
- Color: `#7A7A7A` (secondary)
- Border-top: 1px solid `#E5E7EB`
- Padding: 16px 0

---

## Version History

### VersionHistory Component

**Location:** `src/components/published/VersionHistory.tsx`

**Props:**
```typescript
interface VersionHistoryProps {
  publishedNoteId: string
}
```

**UI:**
```tsx
<Popover>
  <PopoverTrigger>
    <button className="version-selector">
      v{currentVersion.versionNumber} ▼
    </button>
  </PopoverTrigger>

  <PopoverContent>
    <div className="version-list">
      {versions.map(v => (
        <button
          key={v.id}
          onClick={() => selectVersion(v.versionNumber)}
          className={v.versionNumber === currentVersion.versionNumber ? 'active' : ''}
        >
          <span className="version-number">v{v.versionNumber}</span>
          <span className="version-date">
            {formatDate(v.createdAt)}
          </span>
          {v.changeLog && (
            <span className="version-changelog">{v.changeLog}</span>
          )}
        </button>
      ))}
    </div>
  </PopoverContent>
</Popover>
```

**Behavior:**
- Click version → load that version's content (read-only)
- Current version highlighted
- Show change log if available

---

## API Interactions

### Publish Flow

```typescript
async function publishNote(
  noteId: string,
  config: { slug: string, visibility: string, allowForks: boolean }
) {
  const response = await api.post('/published', {
    sourceNoteId: noteId,
    slug: config.slug,
    visibility: config.visibility,
    allowForks: config.allowForks,
  })

  // Add to published store
  usePublishedStore.getState().addPublished(response.data)

  return response.data
}
```

---

### Attach Flow

```typescript
async function attachNote(
  publishedNoteId: string,
  attachmentType: 'linked' | 'forked'
) {
  const response = await api.post('/attachments', {
    publishedNoteId,
    attachmentType,
  })

  // Add to attachments store
  usePublishedStore.getState().addAttachment(response.data)

  // Add to notes store
  useNotesStore.getState().addNote(response.data.localNote)

  return response.data
}
```

---

### Sync Update Flow

```typescript
async function syncAttachment(attachmentId: string) {
  const response = await api.post(`/attachments/${attachmentId}/sync`)

  // Update attachment
  usePublishedStore.getState().updateAttachment(attachmentId, {
    attachedVersionId: response.data.currentVersionId,
    hasPendingUpdate: false,
    lastSyncedAt: new Date(),
  })

  // Update local note content
  useNotesStore.getState().updateNote(
    response.data.localNoteId,
    { content: response.data.newContent }
  )

  return response.data
}
```

---

## Permissions & Privacy

### Publication Permissions

| Visibility | Discoverable | Direct Link | Requires Auth |
|------------|--------------|-------------|---------------|
| Public | Yes (search, feeds) | Yes | No |
| Unlisted | No | Yes | No |

---

### Fork Permissions

| Allow Forks | Linked Attach | Forked Copy |
|-------------|---------------|-------------|
| True | Allowed | Allowed |
| False | Allowed | Blocked |

**Note:** Linked attachments always allowed (doesn't create independent copy)

---

### Attribution Requirements

- **Always required** (cannot be disabled)
- Shown in:
  - Attached note UI (attribution banner)
  - Metadata (for API consumers)
- Includes:
  - Author display name
  - Author handle
  - Source link
  - Timestamp of attachment

---

## Edge Cases

### 1. Source Note Deleted

**Scenario:** User deletes private note that's already published

**Handling:**
- Published note persists (decoupled from source)
- User can still update published note (re-select source or edit directly)
- Or: Set `PublishedNote.sourceNoteId = NULL`

---

### 2. Circular Attachments

**Scenario:** User A publishes Note X, User B attaches it, publishes as Note Y, User A attaches Y

**Handling:**
- Allow (no restriction)
- Attribution chain preserved
- UI shows "Originally published by..." for each level

---

### 3. Unpublish with Active Attachments

**Scenario:** Author unpublishes note, but 100 users have attached it

**Handling:**
- Confirmation dialog: "X users have attached this note. They will lose access."
- Cascade delete Attachments
- Linked attachments show error: "Source unpublished"
- Forked copies remain (independent)

---

### 4. Slug Conflicts

**Scenario:** User tries to publish two notes with slug "ideas"

**Handling:**
- Validation error on submit
- Suggest: "ideas-2", "ideas-2026", "ideas-feb-14"
- Or: Auto-append timestamp

---

### 5. Very Large Notes

**Scenario:** 50,000 character note published

**Handling:**
- Backend validates max content length (e.g., 100,000 chars)
- Show error: "Note too large to publish. Consider splitting."
- Or: Allow but warn about performance

---

## Testing

### Unit Tests

```typescript
test('publish creates PublishedNote and Version', async () => {
  const note = { id: '1', title: 'Test', content: 'Hello' }
  const config = { slug: 'test', visibility: 'public', allowForks: true }

  const result = await publishNote(note.id, config)

  expect(result.slug).toBe('test')
  expect(result.visibility).toBe('public')
  expect(result.currentVersion.versionNumber).toBe(1)
})

test('attach creates Attachment and Note', async () => {
  const publishedNoteId = 'pub-1'
  const attachmentType = 'linked'

  const result = await attachNote(publishedNoteId, attachmentType)

  expect(result.attachmentType).toBe('linked')
  expect(result.localNote).toBeDefined()
  expect(result.localNote.metadata.attribution).toBeDefined()
})
```

---

### Integration Tests

```typescript
test('full publish and attach flow', async () => {
  // User A publishes
  const published = await publishNote('note-1', {
    slug: 'great-idea',
    visibility: 'public',
    allowForks: true,
  })

  // User B attaches
  const attachment = await attachNote(published.id, 'linked')

  // User A updates
  await createVersion(published.id, { changeLog: 'Fixed typo' })

  // User B sees pending update
  const attachments = await getAttachments()
  expect(attachments[0].hasPendingUpdate).toBe(true)

  // User B syncs
  await syncAttachment(attachment.id)

  expect(attachments[0].hasPendingUpdate).toBe(false)
})
```

---

## Future Enhancements

### 1. Subgraph Publishing

Publish a cluster of related notes:
- Select multiple notes
- Publish as a "collection"
- Users can attach entire collection

---

### 2. Collaborative Editing

Allow multiple users to co-author a published note:
- Invite collaborators
- Real-time editing (like Google Docs)
- Version history shows author per change

---

### 3. Comments & Discussions

Add comment threads to published notes:
- Inline comments on specific paragraphs
- Discussion forum below note
- Notification system for authors

---

### 4. License Templates

Pre-defined license options:
- CC BY 4.0
- CC BY-SA 4.0
- MIT
- Custom

---

This publishing & forking workflow:
- ✅ Simple, explicit publish flow
- ✅ Two attachment modes (linked/forked)
- ✅ Versioning with change logs
- ✅ Attribution always preserved
- ✅ Graceful handling of edge cases
- ✅ Clean UI components
- ✅ Testable API interactions

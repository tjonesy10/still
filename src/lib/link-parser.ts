import Fuse from 'fuse.js'
import { LRUCache } from 'lru-cache'
import { Note } from '@/types/note'

const WIKI_LINK_REGEX = /\[\[([^\]]+)\]\]/g

export interface ParsedLink {
  text: string
  start: number
  end: number
  noteId?: string // Resolved note ID
  isOrphan: boolean // No matching note found
}

export class LinkParser {
  private fuse: Fuse<{ id: string; title: string }>
  private cache: LRUCache<string, ParsedLink[]>
  private titleToIdMap: Map<string, string>

  constructor(notes: Map<string, Note>) {
    const notesList = Array.from(notes.values()).map((n) => ({
      id: n.id,
      title: n.title,
    }))

    this.fuse = new Fuse(notesList, {
      keys: ['title'],
      threshold: 0.3,
      ignoreLocation: true,
    })

    this.titleToIdMap = new Map(notesList.map((n) => [n.title.toLowerCase(), n.id]))
    this.cache = new LRUCache({ max: 100 })
  }

  parse(content: string): ParsedLink[] {
    if (this.cache.has(content)) {
      return this.cache.get(content)!
    }

    const links: ParsedLink[] = []
    let match: RegExpMatchArray | null

    WIKI_LINK_REGEX.lastIndex = 0

    while ((match = WIKI_LINK_REGEX.exec(content)) !== null) {
      const linkText = match[1].trim()
      const resolved = this.resolveLink(linkText)

      links.push({
        text: linkText,
        start: match.index!,
        end: match.index! + match[0].length,
        noteId: resolved?.id,
        isOrphan: !resolved,
      })
    }

    this.cache.set(content, links)
    return links
  }

  resolveLink(linkText: string): { id: string } | null {
    const exactMatch = this.titleToIdMap.get(linkText.toLowerCase())
    if (exactMatch) {
      return { id: exactMatch }
    }

    const results = this.fuse.search(linkText, { limit: 1 })
    return results.length > 0 ? { id: results[0].item.id } : null
  }

  autocomplete(query: string, limit = 5): Array<{ id: string; title: string }> {
    if (!query.trim()) return []

    const results = this.fuse.search(query, { limit })
    return results.map((r) => r.item)
  }

  findOrphans(content: string): ParsedLink[] {
    return this.parse(content).filter((link) => link.isOrphan)
  }

  extractLinkTexts(content: string): string[] {
    const links: string[] = []
    let match: RegExpMatchArray | null

    WIKI_LINK_REGEX.lastIndex = 0

    while ((match = WIKI_LINK_REGEX.exec(content)) !== null) {
      links.push(match[1].trim())
    }

    return links
  }

  updateIndex(notes: Map<string, Note>) {
    const notesList = Array.from(notes.values()).map((n) => ({
      id: n.id,
      title: n.title,
    }))

    this.fuse.setCollection(notesList)
    this.titleToIdMap = new Map(notesList.map((n) => [n.title.toLowerCase(), n.id]))
    this.cache.clear()
  }
}

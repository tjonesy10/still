import { useMemo } from 'react'
import { useStore } from '@/stores'
import { LinkParser } from '@/lib/link-parser'

export function useNoteLinks(content: string) {
  const notes = useStore((state) => state.notes)
  
  const parser = useMemo(() => new LinkParser(notes), [notes])
  
  const parsedLinks = useMemo(() => {
    return parser.parse(content)
  }, [content, parser])
  
  return {
    links: parsedLinks,
    parser,
  }
}

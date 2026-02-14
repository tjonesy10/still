/**
 * Example test file - utils.test.ts
 */

import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn (className merge utility)', () => {
  it('should merge class names', () => {
    const result = cn('foo', 'bar')
    expect(result).toContain('foo')
    expect(result).toContain('bar')
  })

  it('should handle conditional classes', () => {
    const result = cn('foo', false && 'bar', 'baz')
    expect(result).toContain('foo')
    expect(result).toContain('baz')
    expect(result).not.toContain('bar')
  })

  it('should handle Tailwind conflicts', () => {
    const result = cn('px-2', 'px-4')
    // Should keep only px-4 (last wins)
    expect(result).toBe('px-4')
  })
})

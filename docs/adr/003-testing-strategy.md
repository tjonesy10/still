# ADR 003: Testing with Vitest + React Testing Library

**Status:** Accepted
**Date:** 2026-02-14
**Deciders:** Loki Mode Autonomous Agent

## Context

Still requires a testing strategy covering unit, integration, and E2E tests. Need to choose test runner, assertion library, and mocking strategy.

## Decision

Use **Vitest** as test runner and **React Testing Library** for component tests.

## Rationale

**Why Vitest:**
- Native Vite integration (same config)
- Fast (parallel execution, watch mode)
- Jest-compatible API (easy migration)
- Built-in coverage (c8/v8)
- TypeScript support out-of-box
- UI mode for debugging

**Why React Testing Library:**
- Encourages testing user behavior (not implementation)
- Accessibility-focused queries
- Industry standard for React
- Good TypeScript support

**Alternatives considered:**
- **Jest:** Slower, requires more config for Vite
- **Enzyme:** Tests implementation details, deprecated
- **Cypress Component Testing:** Heavier, slower

## Testing Layers

1. **Unit Tests** (Domain layer)
   - Pure functions (linkParser, validators)
   - Fast, isolated
   - No mocks needed

2. **Integration Tests** (Application layer)
   - Stores with mocked API
   - Custom hooks
   - Provider interactions

3. **Component Tests** (Presentation layer)
   - User interactions
   - Rendering logic
   - Accessibility

4. **E2E Tests** (Future: Playwright)
   - Full user flows
   - Cross-browser
   - Critical paths only

## Consequences

**Positive:**
- Fast test execution
- Great DX (watch mode, UI)
- Easy to mock (vi.fn())
- Coverage reports built-in

**Negative:**
- Smaller ecosystem than Jest
- Some libraries expect Jest globals

## Example

```typescript
import { renderWithProviders, createMockNote } from '@/test/utils'

test('renders note title', () => {
  const note = createMockNote({ title: 'Test Note' })
  const { getByText } = renderWithProviders(<NoteCard note={note} />)

  expect(getByText('Test Note')).toBeInTheDocument()
})
```

## References

- Vitest: https://vitest.dev
- React Testing Library: https://testing-library.com/react
- Test utilities: `src/test/utils.tsx`

/**
 * Test utilities and helpers
 */

import { render, type RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'

/**
 * Custom render function with providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: any
}

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const Wrapper = ({ children }: { children: ReactNode }) => {
    // Add providers here when implemented (AuthProvider, etc.)
    return <>{children}</>
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

/**
 * Wait for async updates
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

/**
 * Mock note factory
 */
export const createMockNote = (overrides = {}) => ({
  id: '1',
  userId: 'user1',
  title: 'Test Note',
  content: 'Test content',
  createdAt: new Date(),
  updatedAt: new Date(),
  metadata: {},
  ...overrides,
})

/**
 * Mock user factory
 */
export const createMockUser = (overrides = {}) => ({
  id: 'user1',
  email: 'test@example.com',
  displayName: 'Test User',
  handle: 'testuser',
  createdAt: new Date(),
  settings: {},
  ...overrides,
})

// Re-export everything from @testing-library/react
export * from '@testing-library/react'

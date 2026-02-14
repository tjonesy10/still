/**
 * Mock API client for testing
 */

import { vi } from 'vitest'
import type { AxiosInstance } from 'axios'

export const createMockApi = (): AxiosInstance => {
  return {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
    request: vi.fn(),
    interceptors: {
      request: {
        use: vi.fn(),
        eject: vi.fn(),
        clear: vi.fn(),
      },
      response: {
        use: vi.fn(),
        eject: vi.fn(),
        clear: vi.fn(),
      },
    },
  } as any
}

export const mockApiResponses = {
  notes: {
    list: {
      notes: [
        { id: '1', title: 'Test Note 1', content: 'Content 1', userId: 'user1', createdAt: new Date(), updatedAt: new Date(), metadata: {} },
        { id: '2', title: 'Test Note 2', content: 'Content 2', userId: 'user1', createdAt: new Date(), updatedAt: new Date(), metadata: {} },
      ],
      total: 2,
      hasMore: false,
    },
    single: {
      id: '1',
      title: 'Test Note',
      content: 'Test content',
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {},
    },
  },
  auth: {
    login: {
      user: {
        id: 'user1',
        email: 'test@example.com',
        displayName: 'Test User',
        handle: 'testuser',
        createdAt: new Date(),
        settings: {},
      },
      token: 'mock-token-12345',
      expiresAt: new Date(Date.now() + 86400000), // 24 hours
    },
  },
}

/**
 * API client types and utilities
 */

import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'

export interface ApiError {
  error: string
  message: string
  details?: Record<string, unknown>
}

export interface ApiResponse<T = unknown> {
  data: T
  status: number
  message?: string
}

export interface PaginationParams {
  limit?: number
  offset?: number
  sortBy?: string
  order?: 'asc' | 'desc'
}

export interface ApiClientConfig extends AxiosRequestConfig {
  baseURL: string
  timeout: number
}

export type ApiErrorHandler = (error: AxiosError<ApiError>) => void

export type ApiResponseTransform<T> = (response: AxiosResponse<T>) => T

// WebSocket message types
export interface WebSocketMessage {
  type: WebSocketEventType
  data: unknown
}

export type WebSocketEventType =
  | 'note.created'
  | 'note.updated'
  | 'note.deleted'
  | 'link.created'
  | 'link.deleted'
  | 'published.created'
  | 'published.updated'
  | 'published.deleted'

export interface NoteEventData {
  id: string
  userId: string
  title?: string
  content?: string
  updatedAt?: Date
}

export interface LinkEventData {
  id: string
  sourceNoteId: string
  targetNoteId: string
}

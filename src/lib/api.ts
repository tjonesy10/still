/**
 * API client with auth interceptors and error handling
 */

import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import type { ApiError } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/v1'
const API_TIMEOUT = 10000

/**
 * Axios instance with interceptors
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor - add auth token
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('still_token')

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor - handle errors
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const apiError: ApiError = error.response.data

      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem('still_token')

        // Only redirect if not already on auth pages
        if (!window.location.pathname.startsWith('/login') &&
            !window.location.pathname.startsWith('/register')) {
          window.location.href = '/login'
        }
      }

      // Log error for debugging
      if (import.meta.env.DEV) {
        console.error('API Error:', {
          status: error.response.status,
          message: apiError.message,
          details: apiError.details,
        })
      }
    }

    return Promise.reject(error)
  }
)

/**
 * API helper functions
 */
export const apiHelpers = {
  /**
   * Get auth token from localStorage
   */
  getToken: (): string | null => {
    return localStorage.getItem('still_token')
  },

  /**
   * Set auth token in localStorage
   */
  setToken: (token: string): void => {
    localStorage.setItem('still_token', token)
  },

  /**
   * Clear auth token
   */
  clearToken: (): void => {
    localStorage.removeItem('still_token')
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('still_token')
  },
}

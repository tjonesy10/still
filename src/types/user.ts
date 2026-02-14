/**
 * User and authentication types
 */

export interface User {
  id: string
  email: string
  displayName: string
  handle: string
  createdAt: Date
  settings: UserSettings
}

export interface UserSettings {
  theme?: 'light' | 'dark'
  aiEnabled?: boolean
  [key: string]: unknown
}

export interface RegisterData {
  email: string
  password: string
  displayName: string
  handle: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
  expiresAt: Date
}

export interface UpdateProfileRequest {
  displayName?: string
  settings?: Partial<UserSettings>
}

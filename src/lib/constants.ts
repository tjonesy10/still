/**
 * Design system constants and tokens
 */

export const COLORS = {
  background: '#FAFAF8',
  surface: '#FFFFFF',
  text: '#1C1C1C',
  secondary: '#7A7A7A',
  divider: '#E5E7EB',
  focus: '#C7CDD6',
} as const

export const TYPOGRAPHY = {
  title: '26px',
  body: '16px',
  caption: '13px',
  lineHeight: '1.65',
} as const

export const LAYOUT = {
  maxWritingWidth: '680px',
  sidebarWidth: '280px',
  gridBase: '8px',
} as const

export const MOTION = {
  fadeDuration: '180ms',
  hoverDuration: '220ms',
  easing: 'ease-out',
} as const

export const KEYBOARD_SHORTCUTS = {
  commandPalette: 'mod+k',
  toggleSidebar: 'mod+b',
  navigateGraph: 'mod+g',
  createNote: 'mod+n',
  save: 'mod+s',
} as const

export const API_DEFAULTS = {
  debounceDelay: 500,
  searchDebounce: 200,
  autoSaveDelay: 500,
  maxNotesPerPage: 50,
  maxSearchResults: 20,
} as const

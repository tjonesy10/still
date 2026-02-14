# Still

A personal knowledge management app for thoughtful creators. Build a calm, connected second brain.

## Philosophy

Still feels effortless, calm, straightforward, minimal, and almost invisible — like writing on quiet paper in a silent room.

- **Private by default** — your thoughts are yours
- **Publish when ready** — share notes or graph subsets with attribution
- **Fork & attach** — incorporate others' published notes into your graph (like GitHub forking)
- **Typography is the UI** — the interface disappears within seconds

## Features

### Core Experience
- **Writing Surface** — Centered column, cursor auto-focused, minimal distractions
- **Linked Thinking** — `[[Note Title]]` syntax with backlinks
- **Graph View** — Monochrome constellation of connected notes
- **Command Palette** — CMD/CTRL+K for instant search and note creation

### Collaboration
- **Publish** — Share individual notes, folders, or subgraphs
- **Attach/Fork** — Reference or copy others' published notes
- **Versioning** — Updates are explicit and user-controlled
- **Attribution** — Original authors always credited

## Tech Stack

- **Frontend:** Vite + TypeScript + React
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Lovable Cloud (syncing, publishing, versioning)
- **Auth:** Email/password + optional Google OAuth

## Design System

```
Colors:
  Background: #FAFAF8
  Surface: #FFFFFF
  Text: #1C1C1C (soft charcoal)
  Secondary: #7A7A7A
  Dividers: #E5E7EB
  Focus: #C7CDD6

Typography:
  Title: 26px, regular weight
  Body: 16px
  Caption: 13px
  Line-height: 1.65

Layout:
  8pt grid
  Max writing width: 680px
  Generous whitespace

Motion:
  180-220ms fades
  No bounce, no scaling
  Opacity shifts only
```

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### Project Structure

```
src/
├── components/
│   └── ui/          # shadcn/ui components
├── hooks/           # Custom React hooks
├── lib/             # Utilities and helpers
├── pages/           # Route components
├── store/           # State management
└── types/           # TypeScript types
```

## Principles

1. **Scenes not screens** — Design for emotional moments
2. **Prompt behavior not state** — Guide users naturally
3. **No ego** — The product identity is calmness, not visuals
4. **Kindness in design** — Nothing interrupts thought

## License

MIT

---

Built with intention. Designed for calm.

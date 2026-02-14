# ADR 002: Styling with Tailwind CSS + shadcn/ui

**Status:** Accepted
**Date:** 2026-02-14
**Deciders:** Loki Mode Autonomous Agent

## Context

Still requires a styling solution that supports:
- Rapid prototyping
- Minimal, calm aesthetic
- Type-safe component library
- Easy customization

## Decision

Use **Tailwind CSS** for utility-first styling and **shadcn/ui** for component primitives.

## Rationale

**Why Tailwind:**
- Utility-first approach (no CSS files)
- Built-in design system (spacing, colors)
- Excellent TypeScript integration
- JIT mode for small bundle size
- Easy to maintain consistency

**Why shadcn/ui:**
- Copy-paste components (not npm package)
- Built on Radix UI primitives (accessible)
- Full control over code
- TypeScript-first
- Matches Still's minimal aesthetic

**Alternatives considered:**
- **CSS Modules:** Too verbose, harder to prototype
- **Styled Components:** Runtime cost, less performance
- **Material UI:** Too opinionated, heavy bundle
- **Chakra UI:** Good but shadcn offers more control

## Consequences

**Positive:**
- Fast development
- Consistent design system (via tokens)
- Small bundle size (purged unused styles)
- Accessibility built-in (Radix)
- No runtime CSS-in-JS cost

**Negative:**
- Tailwind class strings can be long
- Need to learn utility class names
- shadcn components need manual updates

## Design Tokens

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      background: '#FAFAF8',
      text: '#1C1C1C',
      secondary: '#7A7A7A',
      divider: '#E5E7EB',
      focus: '#C7CDD6',
    },
  },
}
```

## References

- Tailwind CSS: https://tailwindcss.com
- shadcn/ui: https://ui.shadcn.com
- Design guidelines: `prd.md` (Design Guidelines section)

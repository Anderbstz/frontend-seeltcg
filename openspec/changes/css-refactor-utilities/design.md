# Design: CSS Refactor — Utility Classes

## Technical Approach

Define 18 `@utility` classes in `globals.css` using Tailwind v4 syntax (`@apply` + custom CSS), then refactor 14 component/page files to replace inline `style={{}}` props and repeated className combos. Zero-behavioral-change refactor — visual parity is the metric.

## Architecture Decisions

| Decision | Options | Tradeoff | Chosen |
|----------|---------|----------|--------|
| Utility mechanism | `@utility` vs `@layer components` vs inline | `@utility` integrates with v4 variants (hover:, disabled:) and is tree-shakable; `@layer` is legacy patterns | `@utility` |
| Hover states | Nested CSS vs `@apply hover:` | v4's `@apply` supports variant prefixes directly — no nesting needed | `@apply hover:...` |
| Color values | CSS vars (`var(--accent)`) vs hardcoded | Vars enable theming but aren't needed yet; hardcoded = explicit, one less indirection | Hardcoded (matches existing inline `#d83000`) |
| `card` variants | Separate utilities vs compound class approach | Separate utilities (`card`, `card-lg`) are explicit, no selector magic | Separate `@utility` per variant |

## Utility Classes — Exact CSS

```css
/* Buttons */
@utility btn-primary {
  @apply py-2.5 px-5 rounded-[18px] font-bold uppercase cursor-pointer border-[3px] border-black text-white transition-transform duration-200 hover:-translate-y-0.5;
  background: #d83000;
}
@utility btn-primary-sm {
  @apply btn-primary py-2 px-4 text-sm;
}
@utility btn-primary-lg {
  @apply btn-primary py-4 px-8 text-lg;
}
@utility btn-outline {
  @apply px-5 py-2.5 rounded-full font-semibold cursor-pointer border-2 border-black bg-white transition-colors duration-200 hover:bg-[#d83000] hover:text-white;
}
@utility btn-danger {
  @apply btn-primary;
  background: #ff4d4f;
}
@utility btn-danger-outline {
  @apply px-5 py-2.5 rounded-full font-semibold cursor-pointer border-2 bg-white transition-colors duration-200 hover:bg-[#d83000] hover:text-white;
  border-color: #d83000;
  color: #d83000;
}

/* Cards */
@utility card {
  @apply bg-white border-[3px] border-black rounded-[24px];
}
@utility card-sm {
  @apply card rounded-[20px] p-5;
}
@utility card-lg {
  @apply card rounded-[28px] p-8;
}

/* Typography */
@utility text-muted {
  color: #7a4a1b;
}
@utility text-accent {
  color: #d83000;
}

/* Backgrounds */
@utility bg-card {
  background: #fef7e7;
}
@utility bg-filter {
  background: #fff1c7;
}

/* Forms */
@utility input-field {
  @apply border-2 border-black rounded-lg p-3 text-base;
  font-family: var(--font-sans);
}

/* Layout */
@utility page-container {
  @apply px-[5vw] py-8 max-w-[1200px] mx-auto;
}
@utility grid-cards {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}
@utility status-msg {
  @apply py-8 font-semibold text-center;
}
@utility total-bar {
  @apply flex justify-between items-center text-white border-[3px] border-black rounded-[16px] px-4 py-2.5;
  background: #d83000;
}
```

## File Changes

| File | Action | Utilities Applied |
|------|--------|-------------------|
| `src/app/globals.css` | Modify | Add all 18 `@utility` blocks after `body` styles |
| `src/app/page.tsx` | Modify | `btn-primary`, `btn-primary-lg`, `btn-outline`, `card`, `text-muted`, `text-accent`, `bg-filter`, `status-msg`, `page-container`, `grid-cards` |
| `src/app/search/page.tsx` | Modify | `btn-primary`, `card`, `input-field`, `text-muted`, `status-msg`, `page-container` |
| `src/app/card/[id]/page.tsx` | Modify | `btn-primary-lg`, `card`, `card-lg`, `text-muted`, `text-accent`, `bg-card`, `status-msg`, `page-container` |
| `src/app/offer/[slug]/page.tsx` | Modify | `btn-primary`, `btn-outline`, `card`, `text-muted`, `text-accent`, `total-bar`, `status-msg`, `page-container` |
| `src/app/cart/page.tsx` | Modify | `btn-primary`, `btn-primary-lg`, `btn-outline`, `btn-danger-outline`, `card`, `card-sm`, `text-muted`, `text-accent`, `bg-card`, `total-bar`, `page-container` |
| `src/app/login/page.tsx` | Modify | `btn-primary-lg`, `card`, `input-field`, `text-muted`, `page-container` |
| `src/app/profile/page.tsx` | Modify | `btn-primary`, `btn-primary-lg`, `btn-danger`, `btn-outline`, `card`, `input-field`, `text-muted`, `status-msg`, `page-container` |
| `src/app/history/page.tsx` | Modify | `btn-primary`, `btn-outline`, `card`, `text-muted`, `bg-card`, `total-bar`, `status-msg`, `page-container` |
| `src/app/cancel/page.tsx` | Modify | `btn-primary-lg`, `btn-outline`, `card`, `text-muted`, `page-container` |
| `src/app/success/page.tsx` | Modify | `btn-primary-lg`, `btn-outline`, `card`, `text-muted`, `page-container` |
| `src/app/layout-client.tsx` | Modify | `text-muted` |
| `src/components/Navbar.tsx` | Modify | `text-muted`, `text-accent`, `bg-filter`, `btn-primary` |
| `src/components/Card.tsx` | Modify | `btn-primary`, `card`, `text-muted`, `text-accent`, `bg-card` |
| `src/components/ChatBubble.tsx` | Modify | `text-muted` (minimal — gradient styles stay inline) |

## Testing Strategy

| Layer | What | How |
|-------|------|-----|
| Lint | All changed files | `npm run lint` — 0 warnings |
| Types | All changed files | `npx tsc --noEmit` — 0 errors |
| Visual | 12 routes | Manual visual parity check per route |
| Inline | Static `style={{}}` | `grep 'style={{' src/app/ src/components/` — only dynamic values remain |

## Migration / Rollout

No migration required. Pure CSS+TSX changes: add utilities first, then refactor files one-by-one. Full revert via `git checkout` per file or `git revert` of the commit.

## Open Questions

None. All decisions resolved by spec and codebase audit.

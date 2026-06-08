# Proposal: CSS Refactor — Utility Classes

## Intent

Eliminate ~90 inline style props and ~80 repeated className combinations across 14 files by creating reusable `@utility` classes in Tailwind CSS v4. Reduces visual inconsistency, improves maintainability, and cuts CSS-related noise from component code.

## Scope

### In Scope
- Define `@utility` classes in `globals.css` for the 9 repeated patterns documented below
- Add variants where useful (e.g., `btn-primary-lg`, `btn-primary-sm`)
- Refactor all 14 component/page files to use the new utilities
- Remove or restrict inline `style={{...}}` props (colors, fontFamily)

### Out of Scope
- Grid/hero layout rework (only class dedup)
- Color palette changes (use existing CSS vars)
- Responsive re-design beyond existing breakpoints
- Component structure or behavior refactors

## Capabilities

> Pure UI refactor — no behavioral spec changes.

### New Capabilities
None

### Modified Capabilities
None

## Approach

Phase 1 — **Utilities** (globals.css only): Define `@utility` classes per pattern below, using Tailwind CSS v4 `@utility` syntax. Leverage existing CSS custom properties (`--accent`, `--text-muted`, `--beige`).

Phase 2 — **Refactor** (14 files): Replace inline style props with utility classes. Replace long className combinations with single utilities. Commit per page group (auth/pages, search/catalog, checkout/cart).

Phase 3 — **Verify**: `npm run lint && npx tsc --noEmit`. Visual check of all 12 routes.

### Utility Map

| Utility | Patterns Replaced | Occurrences |
|---------|------------------|-------------|
| `btn-primary` | Primary button + bg-accent + hover | ~25 |
| `btn-primary-lg` | Large variant (py-4 px-8 text-lg) | ~5 |
| `btn-outline` | Secondary outline + hover | ~12 |
| `btn-remove` | Remove button outline (#d83000) | ~3 |
| `card` | Container `bg-white border-[3px] border-black rounded-[24px]` | ~12 |
| `card-grid` | `grid gap-6 + repeat(auto-fill, minmax(240px, 1fr))` | ~2 |
| `page-wrap` | `px-[5vw] py-8 max-w-[1200px] mx-auto` | ~5 |
| `state-msg` | `py-8 font-semibold text-center` | ~8 |
| `checkout-bar` | Flex bar bg-accent + rounded-[16px] | ~3 |
| `text-muted` | `color: #7a4a1b` | ~30 |
| `bg-filter` | `background: #fff1c7` | ~10 |
| `bg-card-img` | `background: #fef7e7` | ~7 |

## Approach

Define each as `@utility btn-primary { ... }` in `globals.css`. Use `@apply` for Tailwind atoms and plain CSS for custom values (rounded-[18px]). Add `.btn-primary\:lg` variant using `&:is(.btn-primary-lg)` or Tailwind v4 variant syntax. Refactor files file-by-file from leaf pages inward.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/globals.css` | Modified | Add ~12 `@utility` blocks |
| `src/components/Card.tsx` | Modified | Replace 3 inline styles + 2 class combos |
| `src/components/Navbar.tsx` | Modified | Replace 7 inline styles + 4 class combos |
| `src/app/page.tsx` | Modified | Replace 18 inline styles + 6 class combos |
| `src/app/search/page.tsx` | Modified | Replace 5 inline styles + 5 class combos |
| `src/app/card/[id]/page.tsx` | Modified | Replace 4 inline styles + 4 class combos |
| `src/app/cart/page.tsx` | Modified | Replace 7 inline styles + 5 class combos |
| `src/app/login/page.tsx` | Modified | Replace 5 inline styles + 4 class combos |
| `src/app/profile/page.tsx` | Modified | Replace 6 inline styles + 5 class combos |
| `src/app/history/page.tsx` | Modified | Replace 6 inline styles + 5 class combos |
| `src/app/offer/[slug]/page.tsx` | Modified | Replace 4 inline styles + 4 class combos |
| `src/app/cancel/page.tsx` | Modified | Replace 2 inline styles + 3 class combos |
| `src/app/success/page.tsx` | Modified | Replace 2 inline styles + 3 class combos |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Missed inline style override | Low | `grep 'style={{' src/app/ src/components/` after refactor |
| Broken hover states | Low | Visual check of all interactive elements per route |
| Wrong utility applied | Low | TypeScript won't catch — visual review per page |

## Rollback Plan

Pure CSS + className change — no logic altered. Revert per file via `git checkout <file>` or full `git revert` of the commit.

## Dependencies

None. Pure CSS + TSX changes, no package installs.

## Success Criteria

- [ ] Zero `style={{` props in all changed files (except dynamic values like `opacity` based on state)
- [ ] All 12 `@utility` classes defined in `globals.css`
- [ ] `npm run lint` passes with 0 warnings
- [ ] `npx tsc --noEmit` passes with 0 errors
- [ ] Visual parity on all 12 routes (no styling regressions)

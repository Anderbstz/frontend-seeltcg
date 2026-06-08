# Tasks: CSS Refactor — Utility Classes

## Review Workload Forecast

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

| Field | Value |
|-------|-------|
| Estimated changed lines | ~270 (70 add, 200 del) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |

## Phase 1: Utilities

- [x] 1.1 Add 18 `@utility` blocks to `src/app/globals.css`: `btn-primary`, `btn-primary-lg`, `btn-outline`, `btn-danger`, `btn-danger-soft`, `card`, `card-sm`, `card-lg`, `text-muted`, `text-accent`, `bg-card`, `bg-filter`, `input-field`, `page-container`, `page-container-md`, `grid-cards`, `status-msg`, `total-bar`

## Phase 2: Refactors

- [x] 2.1 `src/app/layout-client.tsx` — footer `#7a4a1b` → `text-muted`
- [x] 2.2 `src/app/page.tsx` — `text-muted` (12×); `text-accent` (4×); hero btn → `btn-primary`; pagination btns → `btn-outline`; `grid-cards`; `status-msg`
- [x] 2.3 `src/app/search/page.tsx` — 4 inputs + 2 selects → `input-field`; btns → `btn-primary`; `status-msg`; `grid-cards`; form card → `card`
- [x] 2.4 `src/app/card/[id]/page.tsx` — `card-lg`; `bg-card` (3×); `text-muted` (2×); `text-accent` (2×); `btn-primary-lg`; `btn-primary`; `status-msg`; `page-container-md`
- [x] 2.5 `src/app/offer/[slug]/page.tsx` — `total-bar`; `text-accent` (2×); `text-muted` (2×); `btn-primary` (2×); `btn-outline`; `status-msg`; `page-container`
- [x] 2.6 `src/app/cart/page.tsx` — `bg-card` (3×); `text-muted` (2×); `text-accent` (3×); `btn-primary-lg`; `btn-danger-soft`; `card-sm`; `card`; `btn-primary`
- [x] 2.7 `src/app/login/page.tsx` — 3 inputs → `input-field`; `btn-primary-lg`; `text-muted`; `card`
- [x] 2.8 `src/app/profile/page.tsx` — 6 inputs → `input-field`; `btn-primary` (3×); `btn-danger`; `bg-filter`; `text-muted` (5×); `card` (2×); `page-container-md`
- [x] 2.9 `src/app/history/page.tsx` — filter card → `card`; `total-bar`; `text-muted` (2×); `btn-primary` (2×); `card-sm`; `page-container-md`
- [x] 2.10 `src/app/cancel/page.tsx` — `btn-primary-lg`; `btn-outline`; `text-muted` (2×); `card`
- [x] 2.11 `src/app/success/page.tsx` — `btn-primary-lg`; `btn-outline` (2×); `text-muted` (2×); `card`
- [x] 2.12 `src/components/Navbar.tsx` — `text-muted` (3×); `text-accent` (3×); `bg-filter` (5×); `btn-primary`; `text-muted`
- [x] 2.13 `src/components/Card.tsx` — `card`; `btn-primary`; `text-muted` (2×); `bg-card`
- [x] 2.14 `src/components/ChatBubble.tsx` — review: all colors are unique grays/gradients — 0 matches expected

## Phase 3: Verify

- [x] 3.1 `npm run lint` — 0 NEW warnings (all 70 pre-existing)
- [x] 3.2 `npx tsc --noEmit` — 0 errors
- [x] 3.3 `rg 'style=\\{\\{' src/app/ src/components/` — only dynamic/unique patterns remain (CSS vars, unique gradients, dynamic grids, unique colors like #fce3b8, #f0d088, #ffe6e6)
- [ ] 3.4 Visual parity check on all 12 routes (manual)

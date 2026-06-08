# Tasks: Admin Section

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~550-650 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Auth guard + layout + Navbar link | PR 1 | Base: main. Extends User, creates AdminGuard, layout, dashboard page. |
| 2 | Card CRUD components + pages | PR 2 | Base: main (independent types, depends on PR1 for nav/guard context). API client, CardTable, CardForm, ModalConfirm, CRUD pages. |

## Phase 1: Foundation — Auth & Layout

- [x] 1.1 `src/contexts/AuthContext.tsx` — Add `role?: string` to User interface
- [x] 1.2 `src/lib/api-admin.ts` — Create admin API client (`getCards`, `createCard`, `updateCard`, `deleteCard`)
- [x] 1.3 `src/components/admin/AdminGuard.tsx` — Create guard: redirects unauthenticated → `/login`, non-admin → `/`
- [x] 1.4 `src/app/admin/layout.tsx` — Create layout wrapping AdminGuard with sidebar + header
- [x] 1.5 `src/app/admin/page.tsx` — Create dashboard with welcome card + quick links
- [x] 1.6 `src/components/Navbar.tsx` — Add "Admin" link, shows only when `role === 'ROLE_ADMIN'`

## Phase 2: Card CRUD — Components & Pages

- [x] 2.1 `src/components/admin/ModalConfirm.tsx` — Create generic modal: overlay + centered card with `btn-danger`/`btn-outline`
- [x] 2.2 `src/components/admin/CardTable.tsx` — Create responsive table: Image, Name, Set, Type, Rarity, Price, Actions
- [x] 2.3 `src/components/admin/CardForm.tsx` — Create form: name/set/types/rarity/hp/artist/price/image_url with `input-field`
- [x] 2.4 `src/app/admin/cards/page.tsx` — Card list page: fetches via API, renders CardTable, "Create Card" button
- [x] 2.5 `src/app/admin/cards/[id]/edit/page.tsx` — Edit page: fetches card by ID, renders CardForm with `initialData`
- [x] 2.6 `src/app/admin/cards/new/page.tsx` — Create page: renders CardForm without `initialData`, calls `createCard`

## Phase 3: Verification

- [x] 3.1 Verify build: `npx tsc --noEmit` compiles without type errors
- [ ] 3.2 Verify admin guard: unauthenticated → `/login`, non-admin → `/`, admin → renders
- [ ] 3.3 Verify CRUD flow: create card → list shows it → edit saves → delete removes

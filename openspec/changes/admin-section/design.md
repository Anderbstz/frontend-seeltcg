# Design: Admin Section

## Technical Approach

Client-side role guarding using the existing AuthContext. The backend already returns `role` in the auth response — extend the `User` type to consume it, wrap admin routes with an `AdminGuard`, and build CRUD UI reusing existing Tailwind v4 `@utility` classes (`card`, `btn-primary`, `btn-outline`, `btn-danger`, `input-field`).

Two capability groups: **admin-auth** (guard + layout + navbar link) and **admin-card-crud** (table + form + modal + API client).

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|-------------|-----------|
| Guard strategy | Client-side `<AdminGuard>` in layout | Next.js middleware | Role lives in client auth state (JWT in localStorage), not in a server-readable cookie. Middleware can't access it without an extra API call. |
| Component namespace | `src/components/admin/` subdirectory | Flat `components/` | Clean separation — 4 new components. Easy to find, easy to delete if admin is deprecated. |
| CardForm reusability | Single form with optional `initialData` prop | Separate create/edit forms | Fields are identical; only the submit URL and prefill differ. A single `initialData?` prop dispatches to create vs update. |
| ModalConfirm | Standalone generic modal | Inline confirm dialogs | Reusable for any admin delete action (cards, later orders/users). Uses `btn-danger` utility. |
| API client | Function-module `lib/api-admin.ts` | Class instance | Simpler tree-shaking, no instantiation overhead. Each function receives `getHeaders` (from AuthContext) to attach the bearer token. |

## Data Flow

```
User logs in → AuthContext stores { user: { ..., role }, token, refresh }

Navbar check: auth.user?.role === 'ROLE_ADMIN' → show "Admin" link

User navigates to /admin/*
  → layout.tsx renders AdminGuard
  → AdminGuard reads auth.user.role
  → role !== 'ROLE_ADMIN' → router.push('/') + return null
  → role === 'ROLE_ADMIN' → render sidebar + children

/api/admin/cards/ CRUD:
  → api-admin.ts calls fetch(URL, { headers: { Authorization: Bearer ..., ... } })
  → On delete: ModalConfirm opens → user confirms → api-admin deletes → refresh list
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/contexts/AuthContext.tsx` | Modify | Add `role?: string` to `User` interface |
| `src/components/Navbar.tsx` | Modify | Add conditional "Admin" link after profile section |
| `src/lib/config.ts` | Modify | Add `ADMIN_URL = \`${API_BASE_URL}/api/admin\`` |
| `src/components/admin/AdminGuard.tsx` | Create | Client guard: redirects non-admins |
| `src/app/admin/layout.tsx` | Create | AdminGuard wrapper + sidebar layout |
| `src/app/admin/page.tsx` | Create | Dashboard with welcome card + quick links |
| `src/app/admin/cards/page.tsx` | Create | Card list with CardTable |
| `src/app/admin/cards/[id]/edit/page.tsx` | Create | Card edit with CardForm |
| `src/components/admin/CardTable.tsx` | Create | Responsive card table |
| `src/components/admin/CardForm.tsx` | Create | Create/edit card form |
| `src/components/admin/ModalConfirm.tsx` | Create | Delete confirmation modal |
| `src/lib/api-admin.ts` | Create | Admin API client functions |

## Interfaces / Contracts

```typescript
// Extended in AuthContext
interface User {
  username: string
  email?: string
  first_name?: string
  last_name?: string
  avatar?: string
  role?: string  // ← ADD THIS
}

// CardTable
interface CardTableProps {
  cards: CardData[]
  onDelete: (id: number) => void
}

// CardForm
interface CardFormData {
  name: string
  set_name?: string
  types?: string
  rarity?: string
  hp?: string
  artist?: string
  price: number
  image_url?: string
}
interface CardFormProps {
  initialData?: CardFormData  // omit for create, provide for edit
  onSubmit: (data: CardFormData) => Promise<void>
  loading?: boolean
}

// ModalConfirm
interface ModalConfirmProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

// API client functions
const getCards: (getHeaders: () => Record<string, string>) => Promise<CardData[]>
const createCard: (data: CardFormData, getHeaders: () => Record<string, string>) => Promise<CardData>
const updateCard: (id: number, data: CardFormData, getHeaders: () => Record<string, string>) => Promise<CardData>
const deleteCard: (id: number, getHeaders: () => Record<string, string>) => Promise<void>
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | AdminGuard redirect logic | Mock `useAuth` + `useRouter`, render with different roles |
| Unit | CardForm validation | Render, submit empty — assert error shown. Fill fields — assert submit fires |
| Unit | ModalConfirm callbacks | Click confirm → `onConfirm` called. Click cancel → `onCancel` called |
| Integration | Card list → delete flow | Render CardTable + ModalConfirm, click delete, confirm — assert `onDelete` called |
| E2E | Full CRUD cycle | Login as admin, navigate, create card, edit card, delete card |

## Migration / Rollout

No migration required. The `role` field is additive to the `User` interface — existing code accessing `user.username` etc. is unaffected. Admin routes are new files; no existing routes change.

## Open Questions

- [ ] Backend endpoint: confirm `/api/admin/cards/` CRUD paths match Django REST framework conventions (trailing slash, pk format)

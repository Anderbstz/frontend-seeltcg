# Proposal: Admin Section

## Intent

Add role-based admin section for card management. Backend already exposes `role` in AuthResponse — frontend needs to consume it for access control.

## Scope

### In Scope
- Role-aware Navbar showing "Admin" link for `ROLE_ADMIN` users
- AdminGuard component redirecting non-admins to `/`
- Admin layout with sidebar nav + header
- Dashboard page (`/admin`) with summary
- Card list (`/admin/cards`) with CRUD table
- Card edit (`/admin/cards/[id]/edit`) with form
- Reusable CardTable, CardForm, ModalConfirm
- Admin API client (`lib/api-admin.ts`)
- Extend `User` type with `role` field in AuthContext

### Out of Scope
- User/order management admin pages
- Analytics or RBAC UI
- Backend changes (API already ready)

## Capabilities

> `openspec/specs/` is empty — all capabilities are new.

### New Capabilities
- `admin-auth`: Role-based guard, Navbar conditional link, layout protection
- `admin-card-crud`: Card CRUD API client, CardTable, CardForm, ModalConfirm

### Modified Capabilities
None.

## Approach

1. Extend `User` in AuthContext with `role?: string`
2. Navbar: conditional "Admin" link via `auth.user?.role === 'ROLE_ADMIN'`
3. AdminGuard reads `auth.user.role`, redirects to `/` on mismatch
4. Admin route layout wraps guard + sidebar structure
5. API client (`lib/api-admin.ts`) wraps endpoints with `getAuthHeaders()`
6. CardTable renders card rows with edit/delete actions
7. CardForm is a controlled form shared by create (inline) and edit (route)
8. ModalConfirm renders on delete click, calls API on confirm

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/contexts/AuthContext.tsx` | Modified | Add `role` to User interface |
| `src/components/Navbar.tsx` | Modified | Conditional "Admin" link |
| `src/components/admin/AdminGuard.tsx` | New | Route protection |
| `src/components/admin/AdminLayout.tsx` | New | Sidebar + header |
| `src/components/admin/CardTable.tsx` | New | Table with actions |
| `src/components/admin/CardForm.tsx` | New | Create/edit form |
| `src/components/admin/ModalConfirm.tsx` | New | Delete confirmation |
| `src/lib/api-admin.ts` | New | Admin API client |
| `src/app/admin/layout.tsx` | New | Admin route layout |
| `src/app/admin/page.tsx` | New | Dashboard page |
| `src/app/admin/cards/page.tsx` | New | Card list page |
| `src/app/admin/cards/[id]/edit/page.tsx` | New | Card edit page |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Role field missing from API | Low | Guard treats missing role as non-admin |
| Token expires mid-session | Med | `isAuthenticated()` handles expiry; guard re-checks on mount |
| Large card list performance | Low | Start client-side; paginate server-side later if needed |

## Rollback Plan

Revert Navbar and AuthContext changes. Delete `src/components/admin/`, `src/lib/api-admin.ts`, and `src/app/admin/`. No migrations or DB changes required.

## Dependencies

- Backend exposes `role` in AuthResponse — no API changes needed
- AuthContext provides `auth`, `isAuthenticated()`, `getAuthHeaders()`

## Success Criteria

- [ ] Navbar shows "Admin" link only for `ROLE_ADMIN` users
- [ ] Non-admins redirected from `/admin/*` to `/`
- [ ] `/admin/cards` loads and displays card list
- [ ] Create, edit, and delete operations succeed with auth headers
- [ ] All components compile without type errors

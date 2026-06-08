# Styling Utilities Specification

## Purpose

Define reusable Tailwind CSS v4 `@utility` classes in `globals.css` and refactor 14 component/page files to use them, replacing inline `style={{...}}` props and repeated class name combinations. No behavioral changes — visual parity MUST be maintained.

## Requirements

### R1: Utility Classes Defined in globals.css

The system MUST define these `@utility` classes in `src/app/globals.css`:

| Utility | Tailwind `@apply` / CSS | Replaces |
|---------|------------------------|----------|
| `btn-primary` | `@apply py-2.5 px-5 rounded-[18px] font-bold uppercase cursor-pointer border-[3px] border-black text-white transition-transform duration-200 hover:-translate-y-0.5`; `background: #d83000` | ~25 primary button instances |
| `btn-primary-sm` | `@apply btn-primary py-2 px-4`; no text-lg | Small primary buttons |
| `btn-primary-lg` | `@apply btn-primary py-4 px-8 text-lg` | ~5 large primary buttons |
| `btn-outline` | `@apply px-5 py-2.5 rounded-full font-semibold cursor-pointer border-2 border-black bg-white hover:bg-[#d83000] hover:text-white transition-colors duration-200` | ~12 outline buttons |
| `btn-danger` | `@apply btn-primary`; `background: #ff4d4f` | Profile "Eliminar cuenta" |
| `btn-danger-outline` | `@apply px-5 py-2.5 rounded-full font-semibold cursor-pointer border-2 border-[#d83000] bg-white hover:bg-[#d83000] hover:text-white transition-colors duration-200` | Cart "Eliminar" button |
| `card` | `@apply bg-white border-[3px] border-black rounded-[24px]` | ~12 container wrappers |
| `card-sm` | `@apply card rounded-[20px] p-5` | Small cards |
| `card-lg` | `@apply card rounded-[28px] p-8` | Large cards |
| `text-muted` | `color: #7a4a1b` | ~30 muted text instances |
| `text-accent` | `color: #d83000` | Accent text |
| `bg-card` | `background: #fef7e7` | ~7 card image backgrounds |
| `bg-filter` | `background: #fff1c7` | ~10 filter/section backgrounds |
| `input-field` | `@apply border-2 border-black rounded-lg p-3 text-base`; `font-family: var(--font-sans)` | Input + inline fontFamily style |
| `status-msg` | `@apply py-8 font-semibold text-center` | ~8 loading/error/empty states |
| `page-container` | `@apply px-[5vw] py-8 max-w-[1200px] mx-auto` | ~5 page layout wrappers |
| `grid-cards` | `display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))` | ~2 card grid layouts |
| `total-bar` | `@apply flex justify-between items-center text-white border-[3px] border-black rounded-[16px] px-4 py-2.5`; `background: #d83000` | ~3 checkout total bars |

#### Scenario: Utility class applies correct styles

- GIVEN a component uses `class="card"`
- WHEN the page renders
- THEN the element has white background, 3px black border, and 24px border-radius
- AND it appears identical to the pre-refactor element

#### Scenario: Variant preserves base styles

- GIVEN a component uses `btn-primary-lg`
- WHEN the page renders
- THEN the button has large padding (py-4 px-8) and text-lg
- AND all btn-primary base styles (uppercase, bold, border, hover) are also applied

### R2: Components Refactored to Use Utilities

The system MUST refactor these files to replace inline styles and repeated class combos with the utility classes above:

| File | Utilities Applied |
|------|-------------------|
| `src/components/Navbar.tsx` | `text-muted`, `text-accent`, `bg-card` |
| `src/components/Card.tsx` | `card`, `text-muted`, `text-accent` |
| `src/components/ChatBubble.tsx` | `card`, `text-muted` |
| `src/app/page.tsx` | `btn-primary`, `btn-primary-lg`, `card`, `text-muted`, `bg-filter`, `page-container`, `grid-cards` |
| `src/app/search/page.tsx` | `btn-primary`, `card`, `input-field`, `text-muted`, `page-container` |
| `src/app/card/[id]/page.tsx` | `btn-primary`, `card`, `text-muted`, `text-accent`, `page-container` |
| `src/app/offer/[slug]/page.tsx` | `btn-primary`, `card`, `text-muted`, `page-container` |
| `src/app/cart/page.tsx` | `btn-outline`, `btn-danger-outline`, `card`, `total-bar`, `text-muted`, `page-container` |
| `src/app/login/page.tsx` | `btn-primary`, `input-field`, `card`, `page-container` |
| `src/app/profile/page.tsx` | `btn-primary`, `btn-danger`, `card`, `input-field`, `text-muted`, `page-container` |
| `src/app/history/page.tsx` | `btn-primary`, `card`, `text-muted`, `status-msg`, `page-container` |
| `src/app/cancel/page.tsx` | `card`, `status-msg`, `page-container` |
| `src/app/success/page.tsx` | `card`, `status-msg`, `page-container` |
| `src/app/layout-client.tsx` | `text-muted`, `bg-card`, `page-container` |

#### Scenario: All refactored files compile

- GIVEN the refactored source files
- WHEN `npx tsc --noEmit` runs
- THEN it exits with code 0
- AND no type errors are reported

#### Scenario: Linter passes without warnings

- GIVEN the refactored source files
- WHEN `npm run lint` runs
- THEN it exits with code 0
- AND no warnings or errors are reported

### R3: Zero Static Inline Styles

After refactoring, the system MUST NOT contain `style={{...}}` props in any changed file, except for dynamic values depending on application state (e.g., computed opacity based on loading, not static colors or fonts).

#### Scenario: Grep finds no static inline styles

- GIVEN the 14 refactored files
- WHEN searching for `style={{` in all changed files
- THEN only dynamic state-dependent style props remain
- AND all static color, font, and layout values use utility classes

### R4: Visual Parity Maintained

The system MUST maintain visual parity — all 12 routes MUST appear visually identical to their pre-refactor state.

#### Scenario: All routes render with correct styles

- GIVEN the app is running
- WHEN navigating to each route (home, search, card detail, offer, cart, login, profile, history, cancel, success)
- THEN all elements display correct colors, spacing, borders, and layout
- AND hover/transition states function correctly on all interactive elements

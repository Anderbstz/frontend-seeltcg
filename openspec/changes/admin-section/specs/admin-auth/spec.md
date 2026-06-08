# Admin Auth Specification

## Purpose

Role-based access control for admin routes. Protects all `/admin/*` pages from unauthorized access and conditionally exposes admin navigation in the Navbar.

## Requirements

### Requirement: Conditional Navbar Link

The Navbar MUST render an "Admin" link when `auth.user?.role === 'ROLE_ADMIN'`, and MUST NOT render it otherwise.

#### Scenario: Admin user sees link

- GIVEN a user authenticated with role `ROLE_ADMIN`
- WHEN the Navbar renders
- THEN an "Admin" link is visible pointing to `/admin`
- AND the link style matches existing Navbar items

#### Scenario: Non-admin user does not see link

- GIVEN a user authenticated with role `user` or no role
- WHEN the Navbar renders
- THEN no "Admin" link is shown

### Requirement: Admin Guard

The AdminGuard MUST redirect unauthenticated users to `/login` and non-admin users to `/`. It MUST render nothing while auth state is loading.

#### Scenario: Unauthenticated user redirected to login

- GIVEN no authenticated session
- WHEN AdminGuard renders
- THEN the user is redirected to `/login`

#### Scenario: Non-admin user redirected to home

- GIVEN a user authenticated with role `user`
- WHEN AdminGuard renders
- THEN the user is redirected to `/`

#### Scenario: Loading state returns null

- GIVEN auth state is still loading
- WHEN AdminGuard renders
- THEN nothing is displayed

### Requirement: Admin Layout

The admin layout MUST wrap all routes with AdminGuard and provide a sidebar navigation with links to Dashboard and Cartas, plus a header showing the username and role. The sidebar SHOULD collapse on mobile.

#### Scenario: Admin sees sidebar and header

- GIVEN an admin user with role `ROLE_ADMIN`
- WHEN navigating to any `/admin/*` route
- THEN the layout shows a sidebar with Dashboard and Cartas links, and a header displaying the username and role

#### Scenario: Mobile layout collapses sidebar

- GIVEN a viewport width below 768px
- WHEN the admin layout renders
- THEN the sidebar collapses into a toggleable hamburger menu

# Admin Card CRUD Specification

## Purpose

Admin card management — list, create, edit, and delete cards via an authenticated API client and reusable UI components.

## Requirements

### Requirement: Admin API Client

The system MUST provide an `api-admin.ts` module exposing `getCards()`, `createCard(data)`, `updateCard(id, data)`, and `deleteCard(id)`. Each function MUST include `Authorization` headers from `getAuthHeaders()` and target endpoints under `API_URL` + `/admin/cards`.

#### Scenario: Fetch cards successfully

- GIVEN a valid admin auth token
- WHEN `getCards()` is called
- THEN it returns card data from `GET /api/admin/cards`

#### Scenario: Expired token returns error

- GIVEN an expired auth token
- WHEN any API function is called
- THEN it returns an auth error

### Requirement: Card Table

The CardTable component MUST render a table with columns: Image, Name, Set, Type, Rarity, Price, and Actions (Edit link, Delete button).

#### Scenario: Cards displayed in table

- GIVEN a non-empty card list
- WHEN CardTable renders
- THEN each row shows image thumbnail, name, set, type, rarity, price, and action buttons

#### Scenario: Empty card list

- GIVEN an empty card list
- WHEN CardTable renders
- THEN it shows a "No cards found" empty state

### Requirement: Card Form

The CardForm component MUST render a form with fields for name, set, type(s), rarity, hp, artist, price, and image URL. It MUST validate required fields before submission and provide success/error feedback.

#### Scenario: Create card successfully

- GIVEN the form in create mode with all required fields filled
- WHEN the form is submitted
- THEN `createCard(data)` is called and success feedback is shown

#### Scenario: Validation prevents incomplete submit

- GIVEN the form with empty required fields
- WHEN the form is submitted
- THEN an error message is displayed and no API call is made

#### Scenario: Edit card pre-fills form

- GIVEN the form in edit mode with existing card data
- WHEN the form renders
- THEN all fields are pre-filled with the card's current values

### Requirement: Modal Confirm

The ModalConfirm component MUST render a generic confirmation dialog with configurable `title`, `message`, `onConfirm`, `onCancel`, `confirmText`, and `cancelText` props.

#### Scenario: Confirm deletion

- GIVEN ModalConfirm is open with delete context
- WHEN the user clicks the confirm button
- THEN `onConfirm` is invoked and the modal closes

#### Scenario: Cancel deletion

- GIVEN ModalConfirm is open
- WHEN the user clicks the cancel button or the backdrop
- THEN `onCancel` is invoked and the modal closes

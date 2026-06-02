# TalentHub — AI Agent Instructions

This file is the project constitution. Every AI coding agent (Claude Code, Cursor, etc.)
must follow these rules when working on this repository.

---

## Project Overview

TalentHub is a MERN job platform with two user roles: **candidate** and **recruiter**.
Frontend is Next.js + Redux Toolkit + Tailwind. Backend is Express + MongoDB.

Shared contract: `frontend/src/types/index.ts` defines all entity shapes.
Backend Mongoose schemas mirror these field names 1:1.

---

## Architecture Rules

### Frontend — Feature-based structure only

```
frontend/src/features/<feature>/
├── services/  ← typed API client wrappers (apiClient)
├── store/     ← Redux slice with createAsyncThunk
└── (pages live in app/ route folders, not inside features)
```

No flat `services/` or `controllers/` folders. Every feature owns its own service + slice.

### Backend — Feature-based structure only

```
backend/src/features/<feature>/
├── <feature>.model.ts       ← Mongoose schema
├── <feature>.types.ts       ← internal DTOs (create, update, filter)
├── <feature>.validator.ts   ← sync validation middleware
├── <feature>.service.ts     ← business logic, throws AppError
├── <feature>.controller.ts  ← asyncHandler wrapped
└── <feature>.routes.ts      ← route definitions
```

Every feature has exactly 6 files. No shared `controllers/` or `models/` folders.

### Never mix layers

- Service layer has zero HTTP knowledge (no `res.status()`, no `req.body`)
- Controller handles only HTTP concerns (extract, respond)
- Validators are pure sync middleware (no async, no file I/O)

---

## Non-Negotiable Patterns

### 1. Response shape — Approach 1 (required for all API endpoints)

```json
{ "success": true, "statusCode": 200, "data": { ... }, "message": "OK" }
```

- `success` = `statusCode < 400`
- `data` carries the actual payload
- `message` is human-readable (empty string on success)
- Frontend `apiClient` unwraps this — components receive `data` directly

### 2. asyncHandler (backend controllers)

Every controller function MUST be wrapped:

```typescript
export const create = asyncHandler(async (req, res) => {
  const result = await featureService.create(req.body);
  res.status(201).json(new ApiResponse(201, result, "Created successfully"));
});
```

No try/catch in any controller or service. `asyncHandler` catches and passes to `errorHandler`.

### 3. AppError + errorHandler (backend)

- Throw `new AppError(statusCode, message)` on every failure
- Global `errorHandler` normalizes all errors into the standard `ApiResponse` shape
- Handles: Mongoose ValidationError, CastError, duplicate key (11000), JWT errors, generic 500

### 4. createAsyncThunk (frontend Redux)

All async actions use `createAsyncThunk` with `rejectWithValue`:

```typescript
export const fetchItems = createAsyncThunk(
  "feature/fetchItems",
  async (_void, { rejectWithValue }) => {
    try { return await featureService.getAll(); }
    catch (err: any) { return rejectWithValue(err.message); }
  }
);
```

State: `{ items, current, isLoading, error }`. Reducers: `clearError`, `clearCurrent`.
No `isAuthenticated` in feature slices — auth is in `s.auth`.

### 5. apiClient (frontend HTTP layer)

All API calls go through `frontend/src/shared/lib/apiClient.ts`:

```typescript
const data = await apiClient.get<Item[]>("/api/items");
const item = await apiClient.post<Item>("/api/items", body);
const updated = await apiClient.put<Item>("/api/items/id", body);
await apiClient.delete<void>("/api/items/id");
```

Never use `fetch()` directly in services or components.

### 6. Cookie-based JWT

- Backend sets `token` as httpOnly cookie on login/register
- Frontend `apiClient` reads `token` cookie, attaches `Authorization: Bearer <token>` header
- On 401, `apiClient` calls the registered handler → dispatches Redux `logout()` → clears state + cookie
- Backend `authenticate` middleware reads `Authorization` header, verifies JWT

### 7. 401 auto-logout wiring

One-time setup in `frontend/src/app/providers.tsx`:
```typescript
setup401Handler(); // wires 401 → logout
```

This is already done. Don't add it again.

---

## Skill System

The project has two scaffolding skills. Use them for new features.

### Frontend skill: `/feature-scaffold <name> [operations]`

Generates: `features/<feature>/services/<feature>.service.ts` + `features/<feature>/store/<feature>Slice.ts`

### Backend skill: `/backend-feature <name> [operations]`

Generates: all 6 backend files + wires route into `backend/src/index.ts`

### Collaboration rule

Both skills read `frontend/src/types/index.ts` as the shared contract.
- Frontend skill: reads types, generates service + slice
- Backend skill: reads types, generates schema (mirrors field names)
- Neither modifies the other's files
- If a type doesn't exist in `types/index.ts`, the backend skill must warn and stop — never create frontend types

### When NOT to use skills

- Fixing bugs in existing feature code
- Modifying pages or components
- Changing auth flow
- Any task that targets a specific existing file

---

## Implementation Order

Build feature by feature, in this order:

```
1. Auth        ← DONE (both frontend + backend)
2. Jobs        ← frontend scaffolded, backend pending
3. Applications
4. Companies
5. Messages
6. Notifications
7. Settings
```

For each feature:
1. Run `/feature-scaffold <feature> crud` (frontend service + slice)
2. Run `/backend-feature <feature>` (backend 6 files + route mount)
3. Wire the reducer into `frontend/src/store/index.ts`
4. Migrate page from `pageFiles/` to use Redux + apiClient

---

## File Ownership

| File/Folder | Created by | Modified by |
|---|---|---|
| `frontend/src/types/index.ts` | User (types-first) | Feature scaffolds (read only) |
| `frontend/src/lib/mockData.ts` | User (reference data) | Never modify |
| `frontend/src/features/*` | Skills | Skills |
| `frontend/src/pageFiles/*` | User | Manual migration to features |
| `backend/src/utils/*` | User | Never modify |
| `backend/src/middleware/*` | User | Never modify |
| `backend/src/features/*` | Skills | Skills |
| `backend/src/index.ts` | User + skills | Backend skill adds imports |

---

## Red Flags — Do Not Do This

- No `return res.status().json()` in controllers (use side-effect, no return)
- No `schema.index()` when `unique: true` is already set
- No `fetch()` outside `apiClient.ts`
- No exposing `toApi()` helper in service exports
- No async validators (validators are sync middleware only)
- No `import { setUser } from "@/store/slices/authSlice"` in new code (the legacy path exists only for demo fallback)

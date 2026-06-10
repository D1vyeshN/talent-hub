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

### Never mix layers
### Backend — Module-based structure only

```
backend/src/modules/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.routes.ts
│   ├── auth.service.ts
│   └── auth.validator.ts
├── job/
│   ├── job.controller.ts
│   ├── job.routes.ts
│   ├── job.service.ts
│   └── job.validation.ts
├── ... (other feature modules)
```

Each module contains controller, routes, service, validator, and model files organized by feature rather than a shared features/ structure.

Every feature has exactly 5 files (controller, routes, service, validator, model). No shared `controllers/` or `models/` folders.

- Service layer has zero HTTP knowledge (no `res.status()`, no `req.body`)
- Controller handles only HTTP concerns (extract, respond)
- Validators are pure sync middleware (no async, no file I/O)

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

---

---
## Implementation Order

Build feature by feature, with current progress:

```
1. Auth        ← DONE (both frontend + backend)
2. Jobs        ← DONE (frontend has jobs service, backend has job module)
3. Applications← BACKEND DONE, frontend needs to create applications feature
4. Companies   ← DONE (both frontend + backend)
5. Messages    ← BACKEND DONE, frontend has MessagesPage in pageFiles (needs to create messages feature)
6. Notifications← BACKEND DONE, frontend needs to create notifications feature
7. Settings    ← BACKEND settings may be in users module, frontend has SettingsPage in pageFiles (needs to create settings feature)
```

For each feature:
1. Ensure backend module is complete (controller, routes, service, validator, model)
2. Create frontend feature structure if needed (services/ + store/)
3. Migrate page from pageFiles/ to use Redux + apiClient (if applicable)
4. Wire reducer into frontend/src/store/index.ts (if applicable)




## File Ownership

| File/Folder | Created by | Modified by |
|---|---|---|
| `frontend/src/types/index.ts` | User (types-first) | Manual updates (not skills) |
| `frontend/src/lib/mockData.ts` | User (reference data) | Never modify |
| `frontend/src/features/*` | Manual implementation | Manual implementation |
| `frontend/src/pageFiles/*` | User | Manual migration to features (when applicable) |
| `backend/src/utils/*` | User | Never modify |

## Red Flags — Do Not Do This

| `backend/src/middleware/*` | User | Never modify |
| `backend/src/modules/*` | Manual implementation | Manual implementation |
| `backend/src/index.ts` | User + manual updates | Manual route imports |

- No `return res.status().json()` in controllers (use side-effect, no return)
- No `schema.index()` when `unique: true` is already set
- No `fetch()` outside `apiClient.ts`
- No exposing `toApi()` helper in service exports
- No async validators (validators are sync middleware only)
- No `import { setUser } from "@/features/auth/store/authSlice"` in new code (the legacy path exists only for demo fallback)

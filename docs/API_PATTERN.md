# Backend Feature Development SOP

> Canonical reference for adding any new feature to the Express + MongoDB backend.
> Follow this file exactly — patterns, file layouts, and response shapes are all defined here.

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [Folder Structure](#folder-structure)
3. [Shared Types](#shared-types)
4. [Feature Files](#feature-files)
5. [Wiring Up](#wiring-up)
6. [Smoke Test](#smoke-test)
7. [Quick Reference Checklist](#quick-reference-checklist)
8. [Common Issues](#common-issues)

---

## Core Principles

| Principle | Rule |
|-----------|------|
| **Feature-based** | Every feature owns its model, types, validator, service, controller, and routes. No shared `controllers/` or `models/` folders. |
| **No try/catch** | Controllers and services throw `AppError` on failure. `asyncHandler` wraps all route handlers and catches errors for the global handler. |
| **Single response shape** | Every endpoint returns `{ success, statusCode, data, message }` via `new ApiResponse(...)`. Frontend unwraps to `data` directly. |
| **Types sync** | Frontend `src/types/` and backend `src/shared/types/` are the API contract — both sides must use matching shapes. |
| **Feature-internal types only** | Types in `features/<f>/<f>.types.ts` are private to that feature — never import them from another feature. |
| **1:1 with frontend** | Backend Mongoose schemas mirror the frontend type field names exactly. No translation layer. |

---

## Folder Structure

```
backend/src/
├── config/
│   └── database.ts          # mongoose.connect() + event listeners
├── middleware/
│   ├── auth.middleware.ts   # authenticate, authorize (role guard)
│   └── error.middleware.ts  # global error handler + AppError class
├── utils/
│   ├── ApiResponse.ts       # { success, statusCode, data, message }
│   ├── asyncHandler.ts      # (req, res, next) ⇒ Promise wrapper
│   ├── logger.ts            # info / warn / error / http levels
│   └── jwt.ts               # JWT helpers (sign, verify)
├── shared/
│   └── types/
│       └── user.ts          # cross-app types (User, AuthRequest, etc.)
├── features/
│   └── auth/ ← existing
│   ├── auth.model.ts
│   ├── auth.types.ts
│   ├── auth.validator.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   └── auth.routes.ts
│   └── <feature>/ ← new features go here (job, company, …)
│       ├── <feature>.model.ts
│       ├── <feature>.types.ts
│       ├── <feature>.validator.ts
│       ├── <feature>.service.ts
│       ├── <feature>.controller.ts
│       └── <feature>.routes.ts
└── index.ts                  # express app: middleware → routes → error handler
```

---

## Step 0 — Prerequisites

Before creating a new feature, confirm these exist:

- [ ] Frontend service file at `frontend/src/features/<feature>/services/<feature>.service.ts`
- [ ] Frontend Redux slice at `frontend/src/features/<feature>/store/<feature>Slice.ts`
- [ ] Frontend types defined at `frontend/src/types/index.ts` (or a feature-specific types file)
- [ ] Frontend page files import from the feature service (not from mock data)

Do **not** add new shared types across apps unless the feature introduces genuinely new request/response shapes.

---

## Step 1 — Shared Types (only if needed)

Only create `backend/src/shared/types/<feature>.ts` when the feature has request/response interfaces that don't belong in `shared/types/user.ts`.

```ts
// backend/src/shared/types/<feature>.ts

export interface CreateJobRequest {
  title: string;
  companyId: string;
  // ...
}

export interface JobResponse {
  id: string;
  title: string;
  // ...
}
```

Update `backend/src/shared/types/index.ts` to re-export.

**Rule**: Shared types are the API contract. Frontend and backend MUST keep these in sync.

---

## Step 2 — Feature Folder

Create the folder and all 6 files:

```
backend/src/features/<feature>/
├── <feature>.model.ts
├── <feature>.types.ts
├── <feature>.validator.ts
├── <feature>.service.ts
├── <feature>.controller.ts
└── <feature>.routes.ts
```

---

## Step 3 — Model (`<feature>.model.ts`)

```ts
import mongoose, { Document, Schema } from "mongoose";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface I<Feature> extends Document {
  // All DB fields — match frontend type field names 1:1
  // _id is inherited from Document
  // createdAt / updatedAt come from { timestamps: true }
  // Add instance methods here
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = new Schema<I<Feature>>(
  {
    fieldName: {
      type: String,
      required: true,
      unique: true, // creates index automatically — don't also call schema.index()
      lowercase: true,
      trim: true,
      maxlength: 100,
      match: [/regex/, "error message"],
    },
    numberField: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    enumField: {
      type: String,
      enum: ["option1", "option2"],
      default: "option1",
    },
    refField: {
      type: Schema.Types.ObjectId,
      ref: "OtherModel", // for population
    },
    arrayField: [{ type: String }],
    sensitiveField: {
      type: String,
      required: true,
      select: false, // excluded from queries by default
    },
  },
  { timestamps: true } // auto-manages createdAt, updatedAt
);

// ─── Export ───────────────────────────────────────────────────────────────────

export const <Feature> = mongoose.model("<Feature>", schema);
```

**Rules**:
- Field names match frontend types 1:1
- `select: false` on sensitive fields (passwords, tokens)
- `timestamps: true` for `createdAt` / `updatedAt`
- `unique: true` auto-creates an index — do NOT also call `schema.index()` for the same field

---

## Step 4 — Feature Types (`<feature>.types.ts`)

Internal types — used only within the feature. Not shared with frontend.

```ts
// backend/src/features/<feature>/<feature>.types.ts

export interface CreateDTO {
  // Fields for POST/PUT requests
}

export interface UpdateDTO {
  // Fields for PATCH/PUT (all optional)
}

export interface FilterQuery {
  // Query params for GET list
  page?: number;
  limit?: number;
  search?: string;
}
```

**Rule**: Never export these outside the feature folder. Each other feature defines its own DTOs.

---

## Step 5 — Validator (`<feature>.validator.ts`)

```ts
import { Request, Response, NextFunction } from "express";
import { CreateDTO } from "./<feature>.types";

// Validators are SYNC middleware — no asyncHandler wrapper.
// They either send a 400 response or call next().

export const createValidation = (req: Request, res: Response, next: NextFunction) => {
  const body = req.body as Partial<CreateDTO>;

  if (!body.requiredField || body.requiredField.trim().length < 2) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      data: null,
      message: "Field must be at least 2 characters",
    });
  }

  // More validations...

  next();
};
```

**Rules**:
- No `asyncHandler` wrapper — validators are synchronous middleware
- Return `res.status(4xx).json({ success: false, statusCode, data: null, message })` on failure
- Call `next()` on success

---

## Step 6 — Service (`<feature>.service.ts`)

```ts
import { <Feature>, I<Feature> } from "./<feature>.model";
import { AppError } from "@/middleware/error.middleware";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toApi(doc: I<Feature>) {
  return {
    id: doc._id.toString(),
    // Map all fields from the document
  };
}

// ─── Service Object ───────────────────────────────────────────────────────────

export const <feature>Service = {
  async create(dto: CreateDTO) {
    const doc = await <Feature>.create(dto);
    return toApi(doc);
  },

  async findById(id: string) {
    const doc = await <Feature>.findById(id);
    if (!doc) throw new AppError(404, "<Feature> not found");
    return toApi(doc);
  },

  async findAll(filter: FilterQuery) {
    return await <Feature>.find({}).lean();
  },

  async update(id: string, dto: UpdateDTO) {
    const doc = await <Feature>.findByIdAndUpdate(id, dto, { new: true });
    if (!doc) throw new AppError(404, "<Feature> not found");
    return toApi(doc);
  },

  async delete(id: string) {
    const result = await <Feature>.findByIdAndDelete(id);
    if (!result) throw new AppError(404, "<Feature> not found");
  },
};
```

**Rules**:
- All errors throw `new AppError(statusCode, message)` — never return error objects
- All success paths return clean API-shaped objects via `toApi()` — never raw Mongoose docs
- No `res.status()` or `res.json()` here — service layer has no HTTP knowledge

---

## Step 7 — Controller (`<feature>.controller.ts`)

```ts
import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { <feature>Service } from "./<feature>.service";
import { ApiResponse } from "@/utils/ApiResponse";

// CRITICAL: no `return` before res.status().json().
// asyncHandler expects Promise<void> — Express sends response as side-effect.

export const create = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await <feature>Service.create(req.body);
    res.status(201).json(new ApiResponse(201, result, "Created successfully"));
  }
);

export const getAll = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await <feature>Service.findAll(req.query);
    res.status(200).json(new ApiResponse(200, result));
  }
);

export const getById = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await <feature>Service.findById(req.params.id);
    res.status(200).json(new ApiResponse(200, result));
  }
);

export const update = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await <feature>Service.update(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, result, "Updated successfully"));
  }
);

export const remove = asyncHandler(
  async (_req: Request, res: Response) => {
    await <feature>Service.delete(_req.params.id);
    res.status(200).json(new ApiResponse(200, null, "Deleted successfully"));
  }
);
```

**Rules**:
- Every function wrapped with `asyncHandler`
- Extract data from `req.body`, `req.params`, `req.query` only
- Use `res.status(code).json(new ApiResponse(code, data, message))`
- **No `return res.status().json()`** — remove the `return`, let the function resolve to void
- No try/catch — `asyncHandler` handles all errors

---

## Step 8 — Routes (`<feature>.routes.ts`)

```ts
import { Router } from "express";
import { create, getAll, getById, update, remove } from "./<feature>.controller";
import { createValidation, updateValidation } from "./<feature>.validator";
import { authenticate, authorize } from "@/middleware/auth.middleware";

const router = Router();

// ─── Protected Routes ─────────────────────────────────────────────────────────
router.use(authenticate);

// Optional: role guard
// router.post("/", authorize("recruiter", "admin"), createValidation, create);

router.get("/", getAll);
router.get("/:id", getById);
router.post("/", createValidation, create);
router.put("/:id", updateValidation, update);
router.delete("/:id", remove);

export default router;
```

**Rules**:
- `authenticate` middleware required for any route that needs a logged-in user
- `authorize("role1", "role2")` for role-restricted routes (must come after `authenticate`)
- Validators run before their controller
- Keep routes RESTful: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`

---

## Step 9 — Wire Up (`index.ts`)

Add two lines to `backend/src/index.ts`:

```ts
// 1. Add to imports (top of file)
import <feature>Routes from "@/features/<feature>/<feature>.routes";

// 2. Mount route (after existing routes, before error handler)
app.use("/api/<feature>", <feature>Routes);
```

Mount order matters: more specific routes first, catch-all last.

---

## Step 10 — TypeScript Check

Before running the server:

```bash
cd backend
npx tsc --noEmit
```

Must return zero errors. If any errors, fix them before proceeding to testing.

---

## Step 11 — Run & Smoke Test

```bash
cd backend
npm run dev
```

You should see:

```
✅ MongoDB connected successfully
🚀 Server running on http://localhost:8080
📋 Environment: development
```

Then hit each new endpoint with a single curl call. Verify:
- Correct HTTP status code
- Response body matches `{ success, statusCode, data, message }` shape
- `success` is `true` for 2xx, `false` for 4xx/5xx

---

## Quick Reference Checklist

Use this when building any feature:

```
[ ] Frontend types exist and match desired API contract
[ ] backend/src/shared/types/<feature>.ts created (if needed)
[ ] backend/src/features/<feature>/ folder with 6 files created
[ ] Model: schema fields match frontend types 1:1
[ ] Model: timestamps: true, sensitive fields have select: false
[ ] Model: no duplicate index declarations
[ ] Validator: sync middleware, sends ApiResponse shape on error
[ ] Service: throws AppError on failure, returns clean objects
[ ] Service: I<Feature> import for types, <Feature> for queries
[ ] Controller: wrapped in asyncHandler, no return before res.json()
[ ] Controller: res.status().json(new ApiResponse(code, data, message))
[ ] Routes: auth middleware applied, validators before controllers
[ ] index.ts: route imported and mounted
[ ] npx tsc --noEmit → zero errors
[ ] npm run dev → server starts clean
[ ] Each endpoint returns correct status code and ApiResponse shape
```

---

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| `Cannot find module '@/features/...'` | `@` alias not resolved at runtime | Use `ts-node -r tsconfig-paths/register` or `ts-node-dev` |
| `Cannot read properties of undefined (reading 'findOne')` | Model import resolves to `undefined` | Check export: must be `export const Model = mongoose.model(...)` (named export) |
| `Argument of type 'X' is not assignable to Promise<void>` | Controller has `return res.status().json(...)` | Remove `return` — just `res.status().json(...)` |
| `Property 'X' does not exist on type 'User'` | Spreading role-specific fields on shared `User` type | Cast to `as Candidate` / `as Recruiter` / `as Admin` after spread |
| `Duplicate schema index` | Declared both `unique: true` and `schema.index()` for same field | Remove the `schema.index()` call |
| `EADDRINUSE: :::8080` | Old server process still running | Kill old process: `taskkill //F //PID <pid>` |

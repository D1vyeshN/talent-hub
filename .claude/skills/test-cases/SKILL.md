# Test Cases Skill

Generate feature-wise test files for backend integration and frontend unit tests.
Invoked as:

```
/test-cases <feature> [scope]
```

## Parameters

| Param | Required | Default | Description |
|-------|----------|---------|-------------|
| `feature` | yes | — | Singular or plural kebab-case (e.g. `auth`, `jobs`, `applications`) |
| `scope` | no | `integration` | `integration` (backend only), `unit` (frontend only), `both` (all) |

## Pre-flight checks

1. **Feature must exist.** Check for `backend/src/features/<feature>/` and `frontend/src/features/<feature>/`.
   If neither exists, stop and report:
   > "No feature found for '<feature>'. Run `/backend-feature <feature>` and `/feature-scaffold <feature>` first."

2. **Check for existing tests.** Grep `backend/src/tests/` and `frontend/src/tests/` for any file matching `*<feature>*`.
   - If found, note it in the report but **do not overwrite** — generate with a `.new` suffix or append describe blocks.

## Step 1 — Explore source files

Spawn an `Explore` sub-agent (breadth: `medium`) to read the feature's source files and extract:

| Source file | Extract |
|---|---|
| `backend/src/features/<feature>/<feature>.routes.ts` | Route paths, HTTP methods, which use `authenticate` middleware |
| `backend/src/features/<feature>/<feature>.validator.ts` | Validation rule names, error messages, which fields are required |
| `backend/src/features/<feature>/<feature>.controller.ts` | Controller function names, which are exported |
| `backend/src/features/<feature>/<feature>.service.ts` | Service method names, AppError status codes + messages |
| `backend/src/shared/types/<feature>.ts` | Request/response type names (CreateRequest, UpdateRequest, Filter, etc.) |
| `frontend/src/features/<feature>/services/<feature>.service.ts` | API method names, endpoints, payload shapes |
| `frontend/src/features/<feature>/store/<feature>Slice.ts` | Thunk names, reducer names, initial state shape |

Also read `backend/src/app.ts` to confirm the app export path.

## Step 2 — Generate backend integration test

Create `backend/src/tests/<feature>.test.ts` using this template.
Fill in `< >` placeholders from the Explore results.

```typescript
// ─── Imports ──────────────────────────────────────────────────────────────────
import request from "supertest";
import app from "@/app";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer: MongoMemoryServer;

// ─── Setup ────────────────────────────────────────────────────────────────────
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

// ─── Test Data ────────────────────────────────────────────────────────────────
const validPayload = {
  // Fill from the feature's CreateRequest type
};

const validPayload2 = {
  // Second item for tests that need multiple records
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("POST /api/<feature> — create", () => {
  it("should create a new <feature> successfully", async () => {
    const res = await request(app)
      .post("/api/<feature>")
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("id");
  });

  it("should fail with validation errors for missing required fields", async () => {
    const res = await request(app)
      .post("/api/<feature>")
      .send({});

    expect([400, 422]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });
});

describe("GET /api/<feature> — list all", () => {
  it("should return empty list when no records exist", async () => {
    const res = await request(app)
      .get("/api/<feature>");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should return list after creating records", async () => {
    await request(app).post("/api/<feature>").send(validPayload);
    await request(app).post("/api/<feature>").send(validPayload2);

    const res = await request(app)
      .get("/api/<feature>");

    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });
});

describe("GET /api/<feature>/:id — get one", () => {
  it("should return the correct record by id", async () => {
    const created = await request(app)
      .post("/api/<feature>")
      .send(validPayload);
    const id = created.body.data.id;

    const res = await request(app)
      .get(`/api/<feature>/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
  });

  it("should return 404 for non-existent id", async () => {
    const fakeId = new mongoose.Types.ObjectId().toHexString();
    const res = await request(app)
      .get(`/api/<feature>/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe("PUT /api/<feature>/:id — update", () => {
  it("should update an existing record", async () => {
    const created = await request(app)
      .post("/api/<feature>")
      .send(validPayload);
    const id = created.body.data.id;

    const res = await request(app)
      .put(`/api/<feature>/${id}`)
      .send({ /* fill updatable fields */ });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should return 404 for non-existent id", async () => {
    const fakeId = new mongoose.Types.ObjectId().toHexString();
    const res = await request(app)
      .put(`/api/<feature>/${fakeId}`)
      .send({ /* fill updatable fields */ });

    // Could be 404 (id not found) or 400 (validation)
    expect([400, 404]).toContain(res.status);
  });
});

describe("DELETE /api/<feature>/:id — delete", () => {
  it("should delete an existing record", async () => {
    const created = await request(app)
      .post("/api/<feature>")
      .send(validPayload);
    const id = created.body.data.id;

    const res = await request(app)
      .delete(`/api/<feature>/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify it's gone
    const check = await request(app).get(`/api/<feature>/${id}`);
    expect(check.status).toBe(404);
  });

  it("should return 404 for non-existent id", async () => {
    const fakeId = new mongoose.Types.ObjectId().toHexString();
    const res = await request(app)
      .delete(`/api/${feature}/${fakeId}`);

    expect([200, 404]).toContain(res.status);
  });
});
```

### Rules for backend test generation

- Use `supertest` + `request(app)` — never start the real server
- Always include `beforeAll`/`afterEach`/`afterAll` for mongodb-memory-server cleanup
- For `ObjectId` generation, use `new mongoose.Types.ObjectId().toHexString()`
- Assert `res.body.success` AND `res.body.statusCode` (never just one)
- For routes protected by `authenticate` middleware, add a test expecting 401 without a token

## Step 3 — Generate frontend service unit test

Create `frontend/src/tests/unit/<feature>.service.test.ts`:

```typescript
import { jest } from "@jest/globals";
import { <feature>Service } from "@/features/<feature>/services/<feature>.service";

// Mock the apiClient — we only care that correct endpoints are called
jest.mock("@/shared/lib/apiClient", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import { apiClient } from "@/shared/lib/apiClient";

describe("<feature>Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should call GET /api/<feature>", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue([{ id: "1" }]);
      const result = await <feature>Service.getAll();
      expect(apiClient.get).toHaveBeenCalledWith("/api/<feature>", expect.anything());
      expect(result).toEqual([{ id: "1" }]);
    });
  });

  describe("getOne", () => {
    it("should call GET /api/<feature>/:id", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ id: "abc123" });
      const result = await <feature>Service.getOne("abc123");
      expect(apiClient.get).toHaveBeenCalledWith("/api/<feature>/abc123", expect.anything());
    });
  });

  describe("create", () => {
    it("should call POST /api/<feature> with payload", async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({ id: "new1" });
      const result = await <feature>Service.create({ name: "Test" });
      expect(apiClient.post).toHaveBeenCalledWith("/api/<feature>", { name: "Test" });
    });
  });

  describe("update", () => {
    it("should call PUT /api/<feature>/:id with payload", async () => {
      (apiClient.put as jest.Mock).mockResolvedValue({ id: "abc123", name: "Updated" });
      const result = await <feature>Service.update("abc123", { name: "Updated" });
      expect(apiClient.put).toHaveBeenCalledWith("/api/<feature>/abc123", { name: "Updated" });
    });
  });

  describe("delete", () => {
    it("should call DELETE /api/<feature>/:id", async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue(undefined);
      await <feature>Service.delete("abc123");
      expect(apiClient.delete).toHaveBeenCalledWith("/api/<feature>/abc123");
    });
  });
});
```

## Step 4 — Generate frontend slice unit test

Create `frontend/src/tests/unit/<feature>Slice.test.ts`:

```typescript
import { configureStore } from "@reduxjs/toolkit";
import { renderHook, act } from "@testing-library/react";
import <feature>Slice, {
  clearError,
  clearCurrent,
  fetchAll<Features>,
  fetch<Feature>ById,
  create<Feature>,
  update<Feature>,
  delete<Feature>,
} from "@/features/<feature>/store/<feature>Slice";

// Build a minimal store with just this slice
const createTestStore = () =>
  configureStore({
    reducer: {
      <feature>: <feature>Slice.reducer,
    },
  });

describe("<feature>Slice", () => {
  // ── Initial state ───────────────────────────────────────────────────────────
  it("should have correct initial state", () => {
    const store = createTestStore();
    const state = store.getState().<feature>;
    expect(state.items).toEqual([]);
    expect(state.current).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  // ── Synchronous reducers ────────────────────────────────────────────────────
  describe("clearError", () => {
    it("should set error to null", () => {
      const store = createTestStore();
      // Set an error first by dispatching a rejected thunk or manually:
      store.dispatch({ type: "<feature>/fetchAll/rejected", payload: "some error" });
      expect(store.getState().<feature>.error).toBe("some error");

      store.dispatch(clearError());
      expect(store.getState().<feature>.error).toBeNull();
    });
  });

  describe("clearCurrent", () => {
    it("should set current to null", () => {
      const store = createTestStore();
      store.dispatch({ type: "<feature>/fetchById/fulfilled", payload: { id: "1" } });
      expect(store.getState().<feature>.current).not.toBeNull();

      store.dispatch(clearCurrent());
      expect(store.getState().<feature>.current).toBeNull();
    });
  });

  // ── Async thunks (mocked service) ──────────────────────────────────────────
  // NOTE: For thunk tests, mock <feature>Service before importing the slice,
  // or use jest.mock(). See "Thunk testing pattern below."

  // describe("fetchAll<Features> lifecycle", () => {
  //   it("should handle pending → fulfilled", async () => { ... });
  //   it("should handle pending → rejected", async () => { ... });
  // });

  // describe("create<Feature>", () => {
  //   it("should append new item to items on success", async () => { ... });
  // });
});
```

### Thunk testing pattern (reference for generated tests)

For async thunk tests, the generated code should use this pattern:

```typescript
// Mock the service BEFORE importing the slice
jest.mock("@/features/<feature>/services/<feature>.service", () => ({
  <feature>Service: {
    getAll: jest.fn(),
    getOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

import { <feature>Service } from "@/features/<feature>/services/<feature>.service";
import <feature>Slice, { fetchAll<Features> } from "@/features/<feature>/store/<feature>Slice";

describe("fetchAll<Features>", () => {
  const store = createTestStore();

  it("handles pending → fulfilled", async () => {
    (<feature>Service.getAll as jest.Mock).mockResolvedValue([{ id: "1" }, { id: "2" }]);

    await act(async () => {
      await store.dispatch(fetchAll<Features>());
    });

    const state = store.getState().<feature>;
    expect(state.isLoading).toBe(false);
    expect(state.items).toHaveLength(2);
    expect(state.error).toBeNull();
  });

  it("handles pending → rejected", async () => {
    (<feature>Service.getAll as jest.Mock).mockRejectedValue(new Error("Network error"));

    await act(async () => {
      await store.dispatch(fetchAll<Features>());
    });

    const state = store.getState().<feature>;
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe("Network error");
  });
});
```

## Step 5 — Report

After generating files, report:

```markdown
✅ /test-cases <feature> <scope> complete

Created:
  - backend/src/tests/<feature>.test.ts          (integration — X routes)
  - frontend/src/tests/unit/<feature>.service.test.ts  (X methods)
  - frontend/src/tests/unit/<feature>Slice.test.ts     (X reducers + thunks)

Run with:
  cd backend && npx jest --config=jest.config.ts --testPathPattern="<feature>"
  cd frontend && npx jest --config=jest.config.ts --testPathPattern="<feature>"
```

## Scope behavior

| Scope value | Generates | Skips |
|---|---|---|
| `integration` (default) | Backend integration test | Frontend tests |
| `unit` | Frontend service + slice tests | Backend test |
| `both` | All three files | — |

## Rules

- **Never modify** existing source files (models, controllers, services, slices, reducers)
- **Never overwrite** existing test files — if `<feature>.test.ts` exists, append `.new` suffix or note it
- Only reads from `src/features/`, `frontend/src/features/`, `frontend/src/types/`
- Use `createAsyncThunk` pattern confirmed in `authSlice.ts` — thunk lifecycle is `pending → fulfilled → rejected`
- All backend tests use `supertest` against the app import — never start the actual server
- Frontend service tests mock `apiClient` — never make real HTTP calls

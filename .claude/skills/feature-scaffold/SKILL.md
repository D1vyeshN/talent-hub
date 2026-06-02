# Feature Scaffold Skill

Scaffold a new feature module — a typed API service + a Redux slice — following the
project's established patterns. Invoked as:

```
/feature-scaffold <feature-name> [operations]
```

## Parameters

| Param        | Required | Default   | Description                                              |
|--------------|----------|-----------|----------------------------------------------------------|
| feature-name | yes      | —         | Plural kebab-case (e.g. `jobs`, `applications`, `messages`) |
| operations   | no       | `crud`    | Comma-separated: `getAll`, `getOne`, `create`, `update`, `delete`. Presets: `crud`, `readonly`, `full` |

## Presets

| Preset  | Generates                                    |
|---------|----------------------------------------------|
| readonly | `getAll`, `getOne`                           |
| crud    | `getAll`, `getOne`, `create`, `update`, `delete` |
| full    | All CRUD + `approve`, `reject`               |

## Files Created

```
features/<feature>/
├── services/
│   └── <feature>.service.ts
└── store/
    └── <feature>Slice.ts
```

Only creates files — never modifies existing ones.

## Execution Steps

1. **Parse the feature name.** Derive the singular form:
   `jobs` → `Job`, `jobs` · `applications` → `Application`, `applications` · `messages` → `Message`, `messages`

2. **Explore existing context.** Spawn an `Explore` sub-agent to read:
   - `frontend/src/shared/lib/apiClient.ts` — confirm client surface (get, post, put, delete)
   - `frontend/src/features/auth/services/auth.service.ts` — confirm service pattern
   - `frontend/src/features/auth/store/authSlice.ts` — confirm slice pattern
   - `frontend/src/types/index.ts` — check if feature types already exist
   - `frontend/src/lib/mockData.ts` — check for mock data for this feature

3. **Generate the service file** (`features/<feature>/services/<feature>.service.ts`):

   ```typescript
   import { apiClient } from "@/shared/lib/apiClient";
   import type { <Feature> } from "@/types";

   // Response interfaces mirror backend { success, data, message } shape
   interface GetAllResponse<T> { items: T[]; total?: number; }

   interface GetOneResponse<T> { item: T; }

   export const <feature>Service = {
     // Only include methods requested — omit ones not needed

     getAll: async (): Promise<<Feature>[]> => {
       return apiClient.get<GetAllResponse<<Feature>>>("/api/<features>")
         .then(res => res.items);
     },

     getOne: async (id: string): Promise<<Feature>> => {
       return apiClient.get<GetOneResponse<<Feature>>>(`/api/<features>/${id}`)
         .then(res => res.item);
     },

     create: async (data: Partial<<Feature>>): Promise<<Feature>> => {
       return apiClient.post<<Feature>>(`/api/<features>`, data);
     },

     update: async (id: string, data: Partial<<Feature>>): Promise<<Feature>> => {
       return apiClient.put<<Feature>>(`/api/<features>/${id}`, data);
     },

     delete: async (id: string): Promise<void> => {
       return apiClient.delete<void>(`/api/<features>/${id}`);
     },
   };
   ```

4. **Generate the slice file** (`features/<feature>/store/<feature>Slice.ts`):

   ```typescript
   import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
   import { <feature>Service } from "../services/<feature>.service";
   import type { <Feature> } from "@/types";

   // ── State ──────────────────────────────────────────────────────────────

   interface <Feature>State {
     items: <Feature>[];
     current: <Feature> | null;
     isLoading: boolean;
     error: string | null;
   }

   const initialState: <Feature>State = {
     items: [],
     current: null,
     isLoading: false,
     error: null,
   };

   // ── Thunks ─────────────────────────────────────────────────────────────
   // Generate one thunk per requested operation:

   // getAll → fetch<Features>
   export const fetch<Features> = createAsyncThunk(
     "<feature>/fetchAll",
     async (_void, { rejectWithValue }) => {
       try { return await <feature>Service.getAll(); }
       catch (err: any) { return rejectWithValue(err.message); }
     }
   );

   // getOne → fetch<Feature>ById
   export const fetch<Feature>ById = createAsyncThunk(
     "<feature>/fetchById",
     async (id: string, { rejectWithValue }) => {
       try { return await <feature>Service.getOne(id); }
       catch (err: any) { return rejectWithValue(err.message); }
     }
   );

   // create → create<Feature>
   export const create<Feature> = createAsyncThunk(
     "<feature>/create",
     async (data: Partial<<Feature>>, { rejectWithValue }) => {
       try { return await <feature>Service.create(data); }
       catch (err: any) { return rejectWithValue(err.message); }
     }
   );

   // update → update<Feature>
   export const update<Feature> = createAsyncThunk(
     "<feature>/update",
     async ({ id, data }: { id: string; data: Partial<<Feature>> }, { rejectWithValue }) => {
       try { return await <feature>Service.update(id, data); }
       catch (err: any) { return rejectWithValue(err.message); }
     }
   );

   // delete → delete<Feature>
   export const delete<Feature> = createAsyncThunk(
     "<feature>/delete",
     async (id: string, { rejectWithValue }) => {
       try { await <feature>Service.delete(id); return id; }
       catch (err: any) { return rejectWithValue(err.message); }
     }
   );

   // ── Slice ──────────────────────────────────────────────────────────────

   const <feature>Slice = createSlice({
     name: "<feature>",
     initialState,
     reducers: {
       clearError(state) { state.error = null; },
       clearCurrent(state) { state.current = null; },
     },
     extraReducers: (builder) => {
       // Only add cases for requested operations

       // fetch<Features>
       builder
         .addCase(fetch<Features>.pending,  (s) => { s.isLoading = true; s.error = null; })
         .addCase(fetch<Features>.fulfilled, (s, a) => { s.isLoading = false; s.items = a.payload; s.current = null; })
         .addCase(fetch<Features>.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });

       // fetch<Feature>ById
       builder
         .addCase(fetch<Feature>ById.pending,  (s) => { s.isLoading = true; s.error = null; })
         .addCase(fetch<Feature>ById.fulfilled, (s, a) => { s.isLoading = false; s.current = a.payload; })
         .addCase(fetch<Feature>ById.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });

       // create<Feature>
       builder
         .addCase(create<Feature>.pending,  (s) => { s.isLoading = true; s.error = null; })
         .addCase(create<Feature>.fulfilled, (s, a) => { s.isLoading = false; s.items.push(a.payload); })
         .addCase(create<Feature>.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });

       // update<Feature>
       builder
         .addCase(update<Feature>.pending,  (s) => { s.isLoading = true; s.error = null; })
         .addCase(update<Feature>.fulfilled, (s, a) => {
           s.isLoading = false;
           const idx = s.items.findIndex(i => i._id === a.payload._id);
           if (idx !== -1) s.items[idx] = a.payload;
           if (s.current?._id === a.payload._id) s.current = a.payload;
         })
         .addCase(update<Feature>.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });

       // delete<Feature>
       builder
         .addCase(delete<Feature>.pending,  (s) => { s.isLoading = true; s.error = null; })
         .addCase(delete<Feature>.fulfilled, (s, a) => {
           s.isLoading = false;
           s.items = s.items.filter(i => i._id !== a.payload);
           if (s.current?._id === a.payload) s.current = null;
         })
         .addCase(delete<Feature>.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
     },
   });

   export const { clearError, clearCurrent } = <feature>Slice.actions;
   export default <feature>Slice.reducer;
   ```

5. **Report back.** List the files created and note:
   > "Wire this into `store/index.ts` by importing the reducer and adding it to the `configureStore` call. The 401 handler is already set up — no changes needed."

## Rules

- Follow the exact patterns from `auth.service.ts` and `authSlice.ts` — same imports, typing, error shape
- Use `createAsyncThunk` with `rejectWithValue` for all async actions
- The service returns data directly (already unwrapped by `apiClient`)
- Do NOT create models, controllers, routes, or pages — only service + slice
- Do NOT modify existing files

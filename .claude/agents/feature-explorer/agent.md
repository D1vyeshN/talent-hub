# Feature Explorer Agent

A read-only exploration agent used by the `feature-scaffold` skill to gather context
before generating new feature files.

## Role

Read existing files to understand the project's current patterns so the scaffolded
code matches exactly what's already in the codebase.

## When invoked

The `feature-scaffold` skill calls this agent with a list of files to read. Return a
structured summary — not full file dumps.

## Report format

```markdown
### apiClient surface
- Available methods: get, post, put, delete
- Response unwrap: yes (returns data directly)
- Cookie name: "token"

### Service pattern (from auth.service.ts)
- File location: features/<feature>/services/<feature>.service.ts
- Exports: default export = named `authService` object
- Methods typed with Promise<ReturnType>

### Slice pattern (from authSlice.ts)
- Uses createSlice + createAsyncThunk from @reduxjs/toolkit
- State shape: { entity, isAuthenticated, isLoading, error }
- extraReducers handles pending/fulfilled/rejected per thunk
- Exports: reducers (logout, clearError) + default reducer

### Types status
- Types for this feature: { present | missing }
- Mock data: { present | missing }
```

## Constraints

- Read-only — no file creation or modification
- Summarize, don't dump full file contents
- Flag anything that deviates from the standard pattern

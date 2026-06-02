# Backend Feature Skill

Scaffold a complete backend feature module for the Express + MongoDB API.
Generates 6 files following docs/API_PATTERN.md conventions.

## Invocation

/backend-feature <feature-name> [operations]

## Parameters

| Param        | Required | Default | Description                                              |
|--------------|----------|---------|----------------------------------------------------------|
| feature-name | yes      | ---     | Plural kebab-case: jobs, applications, messages, companies |
| operations   | no       | crud    | Comma-separated: getAll, getOne, create, update, delete   |

## Presets

| Preset  | Generates                                    |
|---------|----------------------------------------------|
| readonly | getAll, getOne                               |
| crud    | getAll, getOne, create, update, delete        |

## Collaboration Contract

This skill is independent but collaborative:
- Reads frontend/src/types/index.ts as the field-name contract (REQUIRED -- must exist)
- Does NOT modify any frontend file
- Does NOT create frontend types -- if a type is missing, warn and stop
- If the backend feature folder already has files, skip and report "already exists"

## Files Created

backend/src/features/<feature>/
  <feature>.model.ts
  <feature>.types.ts
  <feature>.validator.ts
  <feature>.service.ts
  <feature>.controller.ts
  <feature>.routes.ts

Plus ONE addition to backend/src/index.ts (import + mount).
No other existing files modified.

## Execution Steps

1. Parse feature name. Derive singular: jobs -> Job, applications -> Application, messages -> Message, companies -> Company

2. Explore context. Spawn Explore sub-agent to read:
   - frontend/src/types/index.ts         -- confirm feature type exists (required)
   - backend/src/index.ts                -- confirm route mount pattern
   - backend/src/features/auth/auth.model.ts      -- model template
   - backend/src/features/auth/auth.types.ts      -- internal types template
   - backend/src/features/auth/auth.validator.ts  -- validator template
   - backend/src/features/auth/auth.service.ts    -- service template
   - backend/src/features/auth/auth.controller.ts -- controller template
   - backend/src/features/auth/auth.routes.ts     -- routes template
   - backend/src/middleware/error.middleware.ts   -- AppError import path
   - backend/src/utils/ApiResponse.ts             -- constructor signature

3. Generate model (backend/src/features/<feature>/<feature>.model.ts):

   import mongoose, { Document, Schema } from "mongoose";

   export interface I<Feature> extends Document {
     // All DB fields -- match frontend type field names 1:1
     // _id inherited from Document
     // createdAt / updatedAt from { timestamps: true }
   }

   const schema = new Schema<I<Feature>>(
     {
       // Map each field from frontend type:
       // String  -> type: String
       // Number  -> type: Number
       // Boolean -> type: Boolean
       // Date    -> type: Date
       // ObjectId ref -> type: Schema.Types.ObjectId, ref: "ModelName"
       // Array   -> [String] or [{ type: String }]
       // Enum    -> type: String, enum: ["opt1", "opt2"]
       // Sensitive -> select: false
     },
     { timestamps: true }
   );

   export const <Feature> = mongoose.model("<Feature>", schema);

   Rules:
   - Field names match frontend types 1:1
   - timestamps: true for createdAt/updatedAt
   - select: false on sensitive fields (passwords, tokens)
   - unique: true auto-creates index -- do NOT call schema.index() for same field
   - ObjectId references use ref: "ModelName" (Mongoose model name, e.g. "Company")

4. Generate types (backend/src/features/<feature>/<feature>.types.ts):

   Internal DTOs only. Never export outside the feature folder.

   export interface CreateDTO {
     // Fields for POST -- required unless optional in frontend type
   }

   export interface UpdateDTO {
     // Fields for PUT/PATCH -- all optional
   }

   export interface FilterQuery {
     page?: number;
     limit?: number;
     search?: string;
   }

5. Generate validator (backend/src/features/<feature>/<feature>.validator.ts):

   Validators are SYNC middleware -- no asyncHandler wrapper.
   Return 400 response or call next().

   import { Request, Response, NextFunction } from "express";
   import { CreateDTO } from "./<feature>.types";

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

     next();
   };

   Rules:
   - No asyncHandler wrapper
   - Return res.status(4xx).json({ success: false, statusCode, data: null, message }) on failure
   - Call next() on success
   - Only validate user-provided fields (not IDs, timestamps)

6. Generate service (backend/src/features/<feature>/<feature>.service.ts):

   import { <Feature>, I<Feature> } from "./<feature>.model";
   import { AppError } from "@/middleware/error.middleware";

   function toApi(doc: I<Feature>) {
     return {
       id: doc._id.toString(),
       // Map all fields matching the frontend type shape
     };
   }

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

   Rules:
   - All errors throw new AppError(statusCode, message)
   - All success returns clean objects via toApi()
   - No res.status() or res.json() here

7. Generate controller (backend/src/features/<feature>/<feature>.controller.ts):

   import { Request, Response } from "express";
   import { asyncHandler } from "@/utils/asyncHandler";
   import { <feature>Service } from "./<feature>.service";
   import { ApiResponse } from "@/utils/ApiResponse";

   // CRITICAL: no `return` before res.status().json()

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

   Rules:
   - Every function wrapped with asyncHandler
   - Extract from req.body, req.params, req.query only
   - Use res.status(code).json(new ApiResponse(code, data, message))
   - NO return before res.status().json()
   - No try/catch

8. Generate routes (backend/src/features/<feature>/<feature>.routes.ts):

   import { Router } from "express";
   import { create, getAll, getById, update, remove } from "./<feature>.controller";
   import { createValidation, updateValidation } from "./<feature>.validator";
   import { authenticate, authorize } from "@/middleware/auth.middleware";

   const router = Router();

   // Protected routes
   router.use(authenticate);

   // Optional role guard:
   // router.post("/", authorize("recruiter", "admin"), createValidation, create);

   router.get("/", getAll);
   router.get("/:id", getById);
   router.post("/", createValidation, create);
   router.put("/:id", updateValidation, update);
   router.delete("/:id", remove);

   export default router;

   Rules:
   - authenticate required for all routes
   - authorize after authenticate for role-restricted routes
   - Validators run before controllers
   - RESTful paths only

9. Wire into index.ts:
   - Add import: import <feature>Routes from "@/features/<feature>/<feature>.routes";
   - Add mount:   app.use("/api/<features>", <feature>Routes);
   - Place BEFORE the error handler (last middleware)

10. Report back:
    - List files created with paths
    - Endpoint summary (method, path, auth required)
    - Note: "Wire the frontend slice into frontend/src/store/index.ts by importing the reducer."

## Rules

- Follow exact patterns from backend/src/features/auth/ files
- asyncHandler in all controllers -- no try/catch
- AppError for all errors -- never return error objects
- Service returns clean objects via toApi() -- never raw Mongoose docs
- Route paths are plural: /api/<features>
- All responses use new ApiResponse(statusCode, data, message)
- Do NOT create pages, components, or frontend files
- Do NOT modify frontend files

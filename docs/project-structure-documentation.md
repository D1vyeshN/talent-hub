# TalentHub Project Structure Documentation

## Overview

TalentHub is a MERN stack job platform with two user roles: candidate and recruiter. The application is structured with a clear separation between frontend (Next.js) and backend (Express + MongoDB).

## Architecture

### Frontend Structure (Next.js)

```
src/
├── app/                    # Next.js app router structure
│   ├── (auth)/             # Authentication pages (login, register)
│   ├── (main)/              # Main application pages
│   └── layout.tsx          # Root layout
├── components/             # Shared UI components
│   ├── layout/             # Layout components (Navbar, Sidebar, etc.)
│   └── ui/                 # Reusable UI components (Button, Card, etc.)
├── features/              # Feature-based business logic
├── shared/               # Shared libraries and utilities
├── lib/                  # Utility functions
├── store/                 # Redux store configuration and slices
├── types/                # Shared TypeScript types
└── pageFiles/           # Legacy page components (to be migrated)
```

### Backend Structure (Express + MongoDB)

```
src/
├── modules/              # Feature modules (organized by domain)
│   ├── auth/              # Authentication module
│   ├── users/             # User management
│   ├── jobs/             # Job listings and management
│   ├── companies/         # Company profiles
│   ├── candidate/         # Candidate features
│   ├── recruiter/        # Recruiter features
│   ├── application/      # Job applications
│   ├── notification/     # User notifications
│   ├── message/          # Messaging system
│   ├── admin/             # Admin dashboard
│   └── upload/           # File upload handling
├── config/               # Configuration files
├── middleware/           # Express middleware
├── utils/                # Utility functions
└── index.ts              # Main entry point
```

## Module-by-Module Breakdown

### 1. Auth Module

#### Backend (`src/modules/auth/`)
- `auth.controller.ts`: Handles authentication-related HTTP requests (login, register, logout)
- `auth.service.ts`: Business logic for authentication (JWT token generation, password hashing)
- `auth.routes.ts`: Defines authentication routes (/api/auth/login, /api/auth/register, etc.)
- `auth.validator.ts`: Input validation for authentication forms
- `auth.model.ts`: User model (if separate from users module)

#### Frontend (`src/features/auth/`)
- `services/auth.service.ts`: API client wrapper for authentication endpoints
- `store/authSlice.ts`: Redux slice for authentication state (user data, login status)

### 2. Users Module

#### Backend (`src/modules/users/`)
- `user.controller.ts`: User management endpoints
- `user.service.ts`: Business logic for user operations
- `user.routes.ts`: User API routes
- `user.model.ts`: User data model
- `user.types.ts`: TypeScript type definitions for user entities
- `user.validation.ts`: User input validation rules

### 3. Jobs Module

#### Backend (`src/modules/job/`)
- `job.controller.ts`: Job-related HTTP endpoints
- `job.service.ts`: Business logic for job operations (create, update, delete, search)
- `job.routes.ts`: Job API routes (/api/jobs, /api/jobs/:id, etc.)
- `job.model.ts`: Job data model (title, description, company, salary, etc.)
- `job.validation.ts`: Job posting validation rules

#### Frontend (`src/features/jobs/`)
- `services/jobs.service.ts`: API client for job-related endpoints

### 4. Companies Module

#### Backend (`src/modules/company/`)
- `company.controller.ts`: Company profile endpoints
- `company.service.ts`: Business logic for company operations
- `company.routes.ts`: Company API routes
- `company.model.ts`: Company data model
- `company.validation.ts`: Company profile validation

#### Frontend (`src/features/company/`)
- `services/company.service.ts`: API client for company-related endpoints
- `validation/company.validation.ts`: Frontend validation rules

### 5. Candidate Module

#### Backend (`src/modules/candidate/`)
- `candidate.controller.ts`: Candidate profile endpoints
- `candidate.service.ts`: Business logic for candidate operations
- `candidate.routes.ts`: Candidate API routes
- `candidate.model.ts`: Candidate data model (resumes, skills, experience)

### 6. Recruiter Module

#### Backend (`src/modules/recruiter/`)
- `recruiter.controller.ts`: Recruiter profile endpoints
- `recruiter.service.ts`: Business logic for recruiter operations
- `recruiter.routes.ts`: Recruiter API routes
- `recruiter.model.ts`: Recruiter data model
- `recruiter.validation.ts`: Recruiter profile validation

### 7. Application Module

#### Backend (`src/modules/application/`)
- `application.controller.ts`: Job application endpoints
- `application.service.ts`: Business logic for job applications
- `application.routes.ts`: Application API routes
- `application.model.ts`: Job application data model
- `application.validation.ts`: Application form validation

### 8. Notification Module

#### Backend (`src/modules/notification/`)
- `notification.controller.ts`: Notification endpoints
- `notification.service.ts`: Business logic for notifications
- `notification.routes.ts`: Notification API routes
- `notification.model.ts`: Notification data model

### 9. Message Module

#### Backend (`src/modules/message/`)
- `message.controller.ts`: Messaging endpoints
- `message.service.ts`: Business logic for messaging
- `message.routes.ts`: Messaging API routes
- `message.model.ts`: Message data model
- `conversation.model.ts`: Conversation data model

### 10. Admin Module

#### Backend (`src/modules/admin/`)
- `admin.controller.ts`: Admin dashboard endpoints
- `admin.service.ts`: Business logic for admin operations
- `admin.routes.ts`: Admin API routes
- `admin.model.ts`: Admin data model

#### Frontend (`src/features/admin/`)
- `admin.service.ts`: API client for admin endpoints
- `admin.types.ts`: Admin-related TypeScript types

### 11. Upload Module

#### Backend (`src/modules/upload/`)
- `upload.controller.ts`: File upload endpoints
- `upload.routes.ts`: Upload API routes

## Core Utilities and Configuration

### Backend Core Components

#### Config (`src/config/`)
- Database configuration
- Cloudinary configuration (for file uploads)
- Other environment-specific settings

#### Middleware (`src/middleware/`)
- `auth.middleware.ts`: Authentication verification
- `role.middleware.ts`: Role-based access control
- `validation.middleware.ts`: Request validation
- `upload.middleware.ts`: File upload handling
- `error.middleware.ts`: Error handling
- `httplogger.middleware.ts`: HTTP request logging

#### Utilities (`src/utils/`)
- `asyncHandler.ts`: Wrapper for async route handlers
- `ApiResponse.ts`: Standard API response format
- `ApiError.ts`: Custom API error class
- `logger.ts`: Application logging
- `pagination.ts`: Pagination utilities
- `cloudinaryUpload.ts`: Cloudinary upload utilities

#### Shared Types (`src/shared/types/`)
- Common TypeScript interfaces shared across modules

## Data Flow and Patterns

1. **Frontend to Backend Communication**:
   - All API calls go through `apiClient` (in `src/shared/lib/apiClient.ts`)
   - Redux store manages application state with feature slices
   - Components dispatch Redux actions which trigger thunks that call the API

2. **Backend Architecture**:
   - Controllers handle HTTP requests and responses
   - Services contain business logic and interact with models
   - Models handle database operations
   - Middleware handles cross-cutting concerns (authentication, validation, etc.)

3. **Authentication**:
   - JWT-based authentication with httpOnly cookies
   - Middleware verifies tokens on protected routes
   - Frontend stores token in cookies and attaches to requests

4. **Error Handling**:
   - Consistent API response format: `{ success, statusCode, data, message }`
   - Global error handling middleware normalizes all errors

This documentation provides a comprehensive overview of the project structure. Each module follows the same pattern of separation of concerns with controllers, services, models, and routes for backend features, and services and store slices for frontend features.
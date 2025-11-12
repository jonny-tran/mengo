# 🏗️ Mengo Architecture Guide

Tài liệu kiến trúc tổng thể của project Mengo, tập trung vào cấu trúc, patterns và best practices để developers mới và AI có thể hiểu và làm việc hiệu quả.

## 📋 Mục lục

1. [Tổng quan kiến trúc](#tổng-quan-kiến-trúc)
2. [Monorepo Structure](#monorepo-structure)
3. [Package Architecture](#package-architecture)
4. [Application Architecture](#application-architecture)
5. [Data Flow & Layers](#data-flow--layers)
6. [Patterns & Conventions](#patterns--conventions)
7. [Development Guidelines](#development-guidelines)

---

## 🎯 Tổng quan kiến trúc

Mengo được xây dựng theo mô hình **Monorepo với Package-Based Architecture**, tách biệt rõ ràng giữa:

- **Shared Packages**: Code có thể tái sử dụng (API client, database types)
- **Applications**: Frontend apps (Next.js web, future admin app)
- **Backend**: NestJS API server

### Core Principles

1. **DRY (Don't Repeat Yourself)**: Logic API, types, schemas được tập trung trong packages
2. **Separation of Concerns**: Framework-agnostic code tách biệt với framework-specific code
3. **Type Safety**: End-to-end type safety từ database → API → frontend
4. **Reusability**: Packages có thể dùng cho nhiều apps (web, admin, mobile trong tương lai)

### Tech Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Backend**: NestJS, Prisma, PostgreSQL
- **Styling**: Tailwind CSS + shadcn/ui
- **Validation**: Zod
- **HTTP Client**: Axios
- **State Management**: React hooks, Server Actions

---

## 📦 Monorepo Structure

```
mengo/
├── packages/              # Shared packages
│   ├── api-client/       # HTTP client, services, schemas
│   ├── database/         # Prisma schema & generated client
│   ├── typescript-config/# Shared TS configs
│   └── eslint-config/    # Shared ESLint configs
├── apps/                 # Applications
│   ├── web/              # Next.js web app (student portal)
│   └── backend/          # NestJS API server
└── package.json          # Root workspace config
```

### Package Management

- **Workspace Protocol**: `workspace:*` để link packages
- **Dependency Resolution**: pnpm hoist dependencies
- **Build System**: Turborepo cho parallel builds

---

## 📚 Package Architecture

### `@mengo/api-client` - API Client Package

**Mục đích**: Framework-agnostic HTTP client với validation và error handling.

**Cấu trúc**:

```
packages/api-client/
├── src/
│   ├── http/              # HTTP layer
│   │   ├── base-client.ts # Axios instance, interceptors
│   │   └── errors.ts      # Error classes
│   ├── schemas/           # Zod validation schemas
│   │   └── auth.ts        # Auth request/response schemas
│   ├── services/          # API service functions
│   │   ├── auth.service.ts
│   │   └── index.ts
│   ├── types/             # TypeScript types
│   │   └── index.ts
│   └── index.ts           # Main exports
├── package.json
└── tsconfig.json
```

**Key Features**:

1. **Axios-based HTTP Client**
   - Singleton instance với caching theo baseURL
   - Request/Response interceptors
   - Automatic error handling và transformation
   - Timeout configuration (30s default)

2. **Zod Validation**
   - Request body validation
   - Response validation
   - Type inference từ schemas
   - Error messages tự động

3. **Type Safety**
   - Types được export từ package
   - Integration với `@mengo/database` cho enums (Role, etc.)
   - End-to-end type safety

**Usage Pattern**:

```typescript
// Services export clean functions
import { requestOtp, verifyOtp } from "@mengo/api-client/services";
import type { AuthInfoResponse } from "@mengo/api-client/types";

// Services handle validation, HTTP calls, error handling
const response = await requestOtp("user@example.com");
```

**Design Decisions**:

- ✅ **Framework-agnostic**: Không import Next.js, React, hoặc bất kỳ framework nào
- ✅ **Reusable**: Có thể dùng trong Next.js, Vite, React Native, CLI tools
- ✅ **Type-safe**: Zod schemas → TypeScript types tự động
- ✅ **DRY**: Logic API chỉ viết một lần, dùng ở mọi nơi

---

### `@mengo/database` - Database Package

**Mục đích**: Prisma schema, migrations, và generated client.

**Cấu trúc**:

```
packages/database/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Migration files
├── generated/
│   └── client/            # Prisma generated client
└── package.json
```

**Key Features**:

1. **Single Source of Truth**
   - Database schema định nghĩa ở một nơi
   - Types được generate tự động
   - Enums (Role, TaskStatus) được share

2. **Type Export**
   - `Role` enum được import trong `@mengo/api-client`
   - Đảm bảo consistency giữa backend và frontend

**Usage Pattern**:

```typescript
// Import types/enums từ database package
import { Role } from "@mengo/database";
import type { User } from "@mengo/database";
```

---

## 🏛️ Application Architecture

### `apps/web` - Next.js Web Application

**Mục đích**: Student portal với authentication và workspace management.

**Cấu trúc**:

```
apps/web/
├── app/                   # Next.js App Router
│   ├── auth/              # Auth routes & server actions
│   ├── space/             # Protected student routes
│   └── api/               # Internal API routes
├── lib/
│   └── auth/
│       └── session.ts     # Next.js-specific session management
├── components/
│   ├── auth/              # Auth UI components
│   └── space/             # Workspace components
└── package.json
```

### Layer Separation

#### 1. **API Client Layer** (`@mengo/api-client`)

- **Responsibility**: Pure HTTP requests, validation
- **Location**: `packages/api-client`
- **Framework**: None (framework-agnostic)

#### 2. **Session Layer** (`lib/auth/session.ts`)

- **Responsibility**: Next.js cookies, redirects, route protection
- **Location**: `apps/web/lib/auth/session.ts`
- **Framework**: Next.js specific (`cookies()`, `redirect()`)

#### 3. **Actions Layer** (`app/auth/actions.ts`)

- **Responsibility**: Server Actions, form validation, business logic
- **Location**: `apps/web/app/auth/actions.ts`
- **Framework**: Next.js Server Actions

#### 4. **UI Layer** (`components/auth/*`)

- **Responsibility**: React components, form handling
- **Location**: `apps/web/components/auth/`
- **Framework**: React 19 (`useActionState`)

### Why This Separation?

```
┌─────────────────────────────────────┐
│   @mengo/api-client (Package)       │
│   ✅ Framework-agnostic              │
│   ✅ Reusable across apps            │
│   ✅ Pure HTTP + validation          │
└─────────────────────────────────────┘
              ↓ (import)
┌─────────────────────────────────────┐
│   lib/auth/session.ts                │
│   ✅ Next.js cookies()                │
│   ✅ Next.js redirect()               │
│   ✅ Route protection                 │
└─────────────────────────────────────┘
              ↓ (import)
┌─────────────────────────────────────┐
│   app/auth/actions.ts                │
│   ✅ Server Actions                  │
│   ✅ Form validation                 │
│   ✅ Business logic                  │
└─────────────────────────────────────┘
              ↓ (use in)
┌─────────────────────────────────────┐
│   components/auth/*.tsx              │
│   ✅ React components                │
│   ✅ useActionState                  │
│   ✅ UI rendering                    │
└─────────────────────────────────────┘
```

**Benefits**:

- **Reusability**: `@mengo/api-client` có thể dùng trong admin app (Vite) sau này
- **Maintainability**: Mỗi layer có trách nhiệm rõ ràng
- **Testability**: Có thể test từng layer độc lập
- **Flexibility**: Dễ thay đổi framework-specific code mà không ảnh hưởng API logic

---

## 🔄 Data Flow & Layers

### Authentication Flow

```
1. User submits form (LoginForm)
   ↓
2. Server Action (requestEmailOtp)
   - Validates input
   - Calls @mengo/api-client/services (requestOtp)
   - Returns state
   ↓
3. API Client Package
   - Validates with Zod schema
   - Makes HTTP request (Axios)
   - Validates response
   - Returns typed data
   ↓
4. Backend API (NestJS)
   - Processes request
   - Returns response
   ↓
5. Server Action handles response
   - Success → Redirect to OTP page
   - Error → Return error state
```

### Session Management Flow

```
1. User verifies OTP
   ↓
2. Server Action (verifyEmailOtp)
   - Calls API client
   - Receives tokens + user data
   ↓
3. Session Layer (setAuthCookies)
   - Stores tokens in httpOnly cookies
   - Next.js cookies() API
   ↓
4. Route Protection (requireStudentUser)
   - Reads token from cookies
   - Calls API client (getUserInfo)
   - Validates role
   - Redirects if unauthorized
```

### Key Patterns

1. **API Calls Always Go Through Package**

   ```typescript
   // ✅ Correct: Use package service
   import { requestOtp } from "@mengo/api-client/services";

   // ❌ Wrong: Direct fetch/axios calls
   await fetch("/auth/request-otp", ...);
   ```

2. **Framework-Specific Code Stays in App**

   ```typescript
   // ✅ Correct: Next.js code in app
   import { cookies } from "next/headers";

   // ❌ Wrong: Next.js code in package
   // Packages should be framework-agnostic
   ```

3. **Types Come from Packages**

   ```typescript
   // ✅ Correct: Import from package
   import type { AuthInfoResponse } from "@mengo/api-client/types";

   // ❌ Wrong: Define types locally
   interface AuthInfoResponse { ... }
   ```

---

## 📐 Patterns & Conventions

### 1. Package-Based API Architecture

**Pattern**: Tách API logic vào shared package

**Why**:

- DRY: Viết một lần, dùng nhiều nơi
- Consistency: Cùng validation, error handling
- Reusability: Dùng cho web, admin, mobile

**How**:

```typescript
// packages/api-client/src/services/auth.service.ts
export async function requestOtp(email: string) {
  return request({
    url: "/auth/request-otp",
    method: "POST",
    body: { email },
    bodySchema: requestOtpSchema, // Zod validation
    responseSchema: requestOtpResponseSchema,
  });
}
```

### 2. Framework-Specific Abstraction Layer

**Pattern**: Tạo abstraction layer cho framework-specific code

**Why**:

- Packages không phụ thuộc framework
- Dễ migrate hoặc support nhiều frameworks
- Clear separation of concerns

**How**:

```typescript
// apps/web/lib/auth/session.ts (Next.js specific)
import { getUserInfo } from "@mengo/api-client/services"; // Package
import { cookies } from "next/headers"; // Next.js

export async function fetchCurrentUser() {
  const token = await getAccessTokenFromCookies(); // Next.js cookies
  return await getUserInfo(token); // Package service
}
```

### 3. Zod-First Validation

**Pattern**: Validate với Zod, infer types từ schemas

**Why**:

- Single source of truth cho validation
- Type safety tự động
- Runtime + compile-time validation

**How**:

```typescript
// Schema defines validation + types
export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/),
});

// Types inferred automatically
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
```

### 4. Type Safety from Database to Frontend

**Pattern**: Types flow từ Prisma → API → Frontend

**Why**:

- Consistency across layers
- Catch errors at compile time
- Auto-completion và IntelliSense

**How**:

```typescript
// 1. Database defines enum
// packages/database/prisma/schema.prisma
enum Role {
  STUDENT,
  INSTRUCTOR,
}

// 2. Package imports enum
// packages/api-client/src/types/index.ts
import type { Role as PrismaRole } from "@mengo/database";
export type AuthRole = PrismaRole;

// 3. Frontend uses type
// apps/web/lib/auth/session.ts
import type { AuthInfoResponse } from "@mengo/api-client/types";
// AuthInfoResponse.role is type-safe Role enum
```

### 5. Error Handling Strategy

**Pattern**: Centralized error handling với custom error classes

**Why**:

- Consistent error messages
- Easy to handle errors in UI
- Type-safe error handling

**How**:

```typescript
// packages/api-client/src/http/errors.ts
export class ApiError extends Error {
  public readonly status?: number;
  public readonly payload?: AuthApiErrorPayload;
}

// Usage
try {
  await requestOtp(email);
} catch (error) {
  if (error instanceof ApiError) {
    // Handle API error
  }
}
```

---

## 🛠️ Development Guidelines

### Adding a New API Endpoint

1. **Define Schema** (Zod)

   ```typescript
   // packages/api-client/src/schemas/[feature].ts
   export const createProjectSchema = z.object({ ... });
   ```

2. **Create Service Function**

   ```typescript
   // packages/api-client/src/services/[feature].service.ts
   export async function createProject(data: CreateProjectInput) {
     return request({
       url: "/projects",
       method: "POST",
       body: data,
       bodySchema: createProjectSchema,
       responseSchema: projectResponseSchema,
     });
   }
   ```

3. **Export from Package**

   ```typescript
   // packages/api-client/src/services/index.ts
   export * from "./[feature].service";
   ```

4. **Use in App**
   ```typescript
   // apps/web/app/[feature]/actions.ts
   import { createProject } from "@mengo/api-client/services";
   ```

### Adding a New Feature Module

**Recommended Structure** (Feature-based):

```
apps/web/
├── features/
│   └── [feature-name]/
│       ├── components/     # Feature-specific UI
│       ├── pages/          # Feature routes
│       ├── actions/        # Server actions
│       └── hooks/          # React hooks (if needed)
```

**Current Structure** (Flat):

```
apps/web/
├── app/[feature]/          # Routes
├── components/[feature]/   # Components
└── lib/[feature]/          # Utilities
```

**Note**: Hiện tại dùng flat structure, có thể migrate sang feature-based sau.

### Type Safety Checklist

- ✅ Types từ packages, không define locally
- ✅ Zod schemas cho validation
- ✅ Prisma enums được import, không hardcode
- ✅ API responses được validate với Zod
- ✅ Error types được handle đúng

### Code Organization Rules

1. **Packages** (`packages/*`)
   - Framework-agnostic only
   - No Next.js, React, Vite imports
   - Pure TypeScript/JavaScript

2. **Apps** (`apps/*`)
   - Framework-specific code OK
   - Import từ packages
   - Business logic và UI

3. **Shared Code**
   - Types → Packages
   - Utilities → Packages (nếu framework-agnostic)
   - Configs → Packages (tsconfig, eslint)

---

## 🚀 Future Architecture Considerations

### Feature-Based Organization

**Current**: Flat structure

```
apps/web/
├── app/auth/
├── app/space/
├── components/auth/
└── components/space/
```

**Future** (Recommended):

```
apps/web/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── actions/
│   │   └── hooks/
│   └── space/
│       ├── components/
│       ├── pages/
│       └── hooks/
└── shared/
    ├── components/
    └── utils/
```

**Benefits**:

- Co-location: Related code ở cùng nơi
- Easier navigation
- Better for large codebases

### Admin App Architecture

Khi build admin app với Vite:

```
apps/admin/
├── features/
│   └── auth/
│       └── services/
│           └── session.ts  # localStorage instead of cookies
└── lib/
    └── api/
        └── client.ts        # Import @mengo/api-client
```

**Key Difference**:

- Admin app: `localStorage` cho tokens
- Web app: `httpOnly cookies` cho tokens
- Cùng dùng `@mengo/api-client` package

---

## 📝 Best Practices

### DO ✅

- Import services từ `@mengo/api-client/services`
- Import types từ `@mengo/api-client/types`
- Validate với Zod schemas
- Handle errors với `ApiError` class
- Keep packages framework-agnostic
- Use Prisma enums, không hardcode

### DON'T ❌

- Direct fetch/axios calls (dùng package services)
- Define types locally (import từ packages)
- Import Next.js trong packages
- Hardcode enums (import từ `@mengo/database`)
- Mix framework code với package code

---

## 🎓 Learning Resources

- **Monorepo**: [Turborepo Docs](https://turbo.build/repo/docs)
- **pnpm Workspaces**: [pnpm Workspaces](https://pnpm.io/workspaces)
- **Next.js App Router**: [Next.js Docs](https://nextjs.org/docs/app)
- **Zod**: [Zod Docs](https://zod.dev/)
- **Prisma**: [Prisma Docs](https://www.prisma.io/docs)
- **Axios**: [Axios Docs](https://axios-http.com/)

---

**Tài liệu này được cập nhật khi có thay đổi trong kiến trúc. Để hiểu chi tiết implementation, xem code comments và inline documentation.**

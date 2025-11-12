# Tài liệu Tích hợp Authentication APIs

Tài liệu này mô tả cách tích hợp Authentication APIs trong dự án Mengo, bao gồm kiến trúc, cách sử dụng, và các best practices.

## 📋 Mục lục

1. [Tổng quan](#tổng-quan)
2. [Kiến trúc](#kiến-trúc)
3. [Cấu trúc Package `@mengo/api-client`](#cấu-trúc-package-mengoapi-client)
4. [Cài đặt và Cấu hình](#cài-đặt-và-cấu-hình)
5. [Authentication Flow](#authentication-flow)
6. [Sử dụng trong Code](#sử-dụng-trong-code)
7. [Error Handling](#error-handling)
8. [Type Safety](#type-safety)
9. [Best Practices](#best-practices)

---

## Tổng quan

Dự án Mengo sử dụng kiến trúc **monorepo** với các package được tách biệt rõ ràng:

- **`@mengo/api-client`**: Package chứa logic HTTP client, validation, và type definitions (framework-agnostic)
- **`apps/web/lib/auth/session.ts`**: Layer quản lý session cho Next.js (cookies, redirects)
- **`apps/web/app/auth/actions.ts`**: Server Actions xử lý form và business logic
- **`apps/web/components/auth/*`**: UI components sử dụng React 19 `useActionState`

### Lợi ích của kiến trúc này

✅ **Reusability**: `@mengo/api-client` có thể được sử dụng trong các app khác (Vite, React Native, etc.)  
✅ **Maintainability**: Mỗi layer có trách nhiệm rõ ràng  
✅ **Testability**: Có thể test từng layer độc lập  
✅ **Type Safety**: Types được đồng bộ từ Prisma schema  

---

## Kiến trúc

### Layer Separation

```
┌─────────────────────────────────────┐
│   @mengo/api-client (Package)       │
│   ✅ Framework-agnostic              │
│   ✅ Reusable across apps            │
│   ✅ Pure HTTP + validation          │
│   ✅ Axios-based                     │
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

### Data Flow

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

---

## Cấu trúc Package `@mengo/api-client`

### File Structure

```
packages/api-client/
├── src/
│   ├── http/
│   │   ├── base-client.ts      # Axios instance, request logic
│   │   ├── errors.ts            # ApiError class, error normalization
│   │   └── index.ts             # Exports
│   ├── schemas/
│   │   └── auth.ts              # Zod schemas for validation
│   ├── services/
│   │   ├── auth.service.ts      # Auth API functions
│   │   └── index.ts             # Service exports
│   ├── types/
│   │   └── index.ts             # TypeScript types (inferred from Zod)
│   └── index.ts                 # Main entry point
├── package.json
└── tsconfig.json
```

### Core Components

#### 1. HTTP Client (`http/base-client.ts`)

- **Axios-based**: Sử dụng Axios thay vì native `fetch`
- **Base URL Resolution**: Tự động resolve từ environment variables
- **Request/Response Interceptors**: Xử lý headers, errors
- **Schema Validation**: Validate request/response với Zod
- **Error Handling**: Normalize errors thành `ApiError`

**Environment Variables** (theo thứ tự ưu tiên):
- `NEXT_PUBLIC_APIs_URL_LOCAL`
- `NEXT_PUBLIC_APIs_URL_HOST_VPS`

**Lưu ý**: Nếu không có environment variable nào được set, sẽ throw error thay vì dùng default URL.

#### 2. Error Handling (`http/errors.ts`)

```typescript
export class ApiError extends Error {
  public readonly status?: number;
  public readonly payload?: AuthApiErrorPayload;
  
  constructor(message: string, status?: number, payload?: AuthApiErrorPayload);
}

export function normalizeErrorMessage(
  payload: AuthApiErrorPayload | null,
  fallback: string
): string;
```

#### 3. Zod Schemas (`schemas/auth.ts`)

Tất cả schemas sử dụng `z.nativeEnum(Role)` từ `@mengo/database` để đảm bảo type safety:

```typescript
import { Role } from "@mengo/database";
import { z } from "zod";

export const verifyOtpResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string().nullable(),
    role: z.nativeEnum(Role), // ✅ Synced with Prisma
  }),
});
```

#### 4. Services (`services/auth.service.ts`)

Các functions chính:

- `requestOtp(email: string)`: Gửi OTP đến email
- `verifyOtp(email: string, otp: string)`: Xác thực OTP và nhận tokens
- `getUserInfo(accessToken: string)`: Lấy thông tin user
- `logout(accessToken: string)`: Đăng xuất

#### 5. Types (`types/index.ts`)

Types được infer từ Zod schemas:

```typescript
import type { z } from "zod";
import { verifyOtpResponseSchema } from "../schemas/auth";

export type VerifyOtpResponse = z.infer<typeof verifyOtpResponseSchema>;
export type AuthRole = Role; // Re-export từ @mengo/database
```

---

## Cài đặt và Cấu hình

### 1. Install Dependencies

Package `@mengo/api-client` đã được cấu hình trong monorepo workspace:

```json
// apps/web/package.json
{
  "dependencies": {
    "@mengo/api-client": "workspace:*",
    // ...
  }
}
```

### 2. TypeScript Configuration

Đảm bảo `tsconfig.json` có path aliases:

```json
// apps/web/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@mengo/database": ["../../packages/database"],
      "@mengo/database/*": ["../../packages/database/*"],
      "@mengo/api-client": ["../../packages/api-client/src"],
      "@mengo/api-client/*": ["../../packages/api-client/src/*"]
    }
  }
}
```

### 3. Environment Variables

Tạo file `.env.local` trong `apps/web/`:

```env
# API Base URL (chọn một trong hai)
NEXT_PUBLIC_APIs_URL_LOCAL=http://localhost:8080
# HOẶC
NEXT_PUBLIC_APIs_URL_HOST_VPS=https://your-api-domain.com
```

**Quan trọng**: 
- Không có default URL fallback
- Nếu không set environment variable, sẽ throw error với message: "API service is currently unavailable..."

### 4. Install Dependencies

```bash
# Từ project root
pnpm install
```

---

## Authentication Flow

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User nhập email → Click "Đăng nhập"                        │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. LoginForm component                                       │
│    - useActionState(requestEmailOtp)                         │
│    - Form submission                                         │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Server Action (requestEmailOtp)                           │
│    - Validate email format                                   │
│    - Call requestOtp(email) từ @mengo/api-client            │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. API Client (requestOtp)                                  │
│    - Validate với Zod schema                                 │
│    - POST /auth/request-otp                                  │
│    - Validate response                                       │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Backend API (NestJS)                                      │
│    - Generate OTP                                            │
│    - Send email via Resend                                   │
│    - Return { message: "OTP sent" }                         │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Server Action returns state                               │
│    - success: true → Redirect /auth/otp?email=...           │
│    - success: false → Show error toast                      │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. OTP Page                                                  │
│    - Check email param (required)                            │
│    - Check auth (optional - nếu đã login → redirect /space) │
│    - Render OTPForm                                          │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. User nhập OTP → Click "Xác thực"                         │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. Server Action (verifyEmailOtp)                            │
│    - Validate email + OTP                                    │
│    - Call verifyOtp(email, otp)                              │
│    - Check role === "STUDENT"                                │
│    - Call setAuthCookies(payload)                            │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 10. Session Layer (setAuthCookies)                           │
│     - Store accessToken trong httpOnly cookie                │
│     - Store refreshToken trong httpOnly cookie               │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 11. Redirect to /space                                       │
└─────────────────────────────────────────────────────────────┘
```

### Step-by-Step Code Flow

#### Step 1: Login Form

```typescript
// apps/web/components/auth/login-form.tsx
"use client";

import { useActionState } from "react";
import { requestEmailOtp } from "@/app/auth/actions";

export default function LoginForm() {
  const [state, formAction] = useActionState(requestEmailOtp, INITIAL_STATE);
  
  // Handle success/error with useEffect
  useEffect(() => {
    if (state.success && state.email) {
      router.push(`/auth/otp?email=${encodeURIComponent(state.email)}`);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);
  
  return (
    <form action={formAction}>
      {/* Form fields */}
    </form>
  );
}
```

#### Step 2: Server Action

```typescript
// apps/web/app/auth/actions.ts
"use server";

import { requestOtp, ApiError } from "@mengo/api-client/services";

export async function requestEmailOtp(
  _prevState: RequestEmailOtpState,
  formData: FormData,
): Promise<RequestEmailOtpState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  
  // Validate
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Invalid email format." };
  }
  
  try {
    await requestOtp(email); // ✅ Call API client
    return { success: true, email };
  } catch (error: unknown) {
    const message = error instanceof ApiError
      ? error.message
      : "Unable to send OTP code. Please try again.";
    return { success: false, error: message, email };
  }
}
```

#### Step 3: API Client Service

```typescript
// packages/api-client/src/services/auth.service.ts
import { request } from "../http";
import { requestOtpSchema, requestOtpResponseSchema } from "../schemas/auth";

export async function requestOtp(
  email: string,
): Promise<RequestOtpResponse> {
  return request({
    url: "/auth/request-otp",
    method: "POST",
    body: { email },
    bodySchema: requestOtpSchema,        // ✅ Validate request
    responseSchema: requestOtpResponseSchema, // ✅ Validate response
    fallbackErrorMessage: "Unable to send OTP code. Please try again.",
  });
}
```

#### Step 4: HTTP Client

```typescript
// packages/api-client/src/http/base-client.ts
export async function request<TBody, TResponse>({
  url,
  method = "GET",
  body,
  headers = {},
  bodySchema,
  responseSchema,
  baseURL,
  fallbackErrorMessage = "Request failed",
}: RequestConfig<TBody, TResponse>): Promise<TResponse> {
  // 1. Validate body với Zod
  if (bodySchema && body) {
    bodySchema.parse(body);
  }
  
  // 2. Resolve base URL từ env vars
  const instance = getAxiosInstance(baseURL);
  
  // 3. Make request
  const response = await instance.request({
    url,
    method,
    data: body,
    headers,
  });
  
  // 4. Validate response với Zod
  if (responseSchema) {
    responseSchema.parse(response.data);
  }
  
  return response.data;
}
```

---

## Sử dụng trong Code

### 1. Import Services

```typescript
import { requestOtp, verifyOtp, getUserInfo, logout } from "@mengo/api-client/services";
import { ApiError } from "@mengo/api-client/services"; // ApiError cũng được export từ services
```

### 2. Import Types

```typescript
import type {
  AuthInfoResponse,
  VerifyOtpResponse,
  RequestOtpResponse,
  AuthRole,
} from "@mengo/api-client/types";
```

### 3. Sử dụng trong Server Actions

```typescript
"use server";

import { requestOtp, ApiError } from "@mengo/api-client/services";

export async function myServerAction(formData: FormData) {
  try {
    const result = await requestOtp("user@example.com");
    // result is typed as RequestOtpResponse
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      // Handle API error
      return { success: false, error: error.message };
    }
    // Handle unexpected error
    return { success: false, error: "Unexpected error" };
  }
}
```

### 4. Sử dụng trong Session Management

```typescript
// apps/web/lib/auth/session.ts
import { getUserInfo, logout } from "@mengo/api-client/services";
import type { AuthInfoResponse } from "@mengo/api-client/types";

export async function fetchCurrentUser(): Promise<AuthInfoResponse | null> {
  const accessToken = await getAccessTokenFromCookies();
  if (!accessToken) {
    return null;
  }
  
  try {
    const user = await getUserInfo(accessToken); // ✅ Typed response
    return user;
  } catch {
    await clearAuthCookies();
    return null;
  }
}
```

### 5. Route Protection

```typescript
// apps/web/app/space/layout.tsx
import { requireStudentUser } from "@/lib/auth/session";

export default async function SpaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Redirect to /auth/login nếu chưa login
  // ✅ Redirect to /auth/login?error=forbidden nếu role !== "STUDENT"
  const user = await requireStudentUser();
  
  return (
    <div>
      {/* Layout content */}
      {children}
    </div>
  );
}
```

---

## Error Handling

### ApiError Class

Tất cả API errors được normalize thành `ApiError`:

```typescript
export class ApiError extends Error {
  public readonly status?: number;
  public readonly payload?: AuthApiErrorPayload;
  
  constructor(message: string, status?: number, payload?: AuthApiErrorPayload);
}
```

### Error Handling Pattern

```typescript
try {
  const result = await requestOtp(email);
} catch (error: unknown) {
  if (error instanceof ApiError) {
    // ✅ API error với status code và message
    console.error(`API Error (${error.status}): ${error.message}`);
    
    // ✅ Access error payload nếu có
    if (error.payload) {
      console.error("Error details:", error.payload);
    }
  } else {
    // ✅ Unexpected error (network, etc.)
    console.error("Unexpected error:", error);
  }
}
```

### Error Normalization

API client tự động normalize error messages từ backend:

```typescript
// Backend response:
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}

// Normalized thành:
ApiError {
  message: "email must be an email", // ✅ User-friendly
  status: 400,
  payload: { ... }
}
```

### Toast Notifications

Trong React components, sử dụng toast để hiển thị errors:

```typescript
"use client";

import { toast } from "sonner";

useEffect(() => {
  if (state.error) {
    toast.error(state.error); // ✅ Hiển thị error toast
  }
}, [state.error]);
```

---

## Type Safety

### 1. Types từ Prisma Schema

Role enum được import trực tiếp từ `@mengo/database`:

```typescript
// packages/api-client/src/types/index.ts
import { Role } from "@mengo/database";

export type AuthRole = Role; // ✅ Synced với Prisma
```

### 2. Types từ Zod Schemas

Response types được infer từ Zod schemas:

```typescript
// packages/api-client/src/types/index.ts
import type { z } from "zod";
import { verifyOtpResponseSchema } from "../schemas/auth";

export type VerifyOtpResponse = z.infer<typeof verifyOtpResponseSchema>;
// ✅ Type-safe, tự động sync với schema
```

### 3. Type Inference trong Services

```typescript
// packages/api-client/src/services/auth.service.ts
export async function verifyOtp(
  email: string,
  otp: string,
): Promise<VerifyOtpResponse> { // ✅ Return type được infer
  return request({
    // ...
    responseSchema: verifyOtpResponseSchema, // ✅ Validate và infer type
  });
}
```

### 4. Type Safety trong Components

```typescript
// apps/web/components/space/dashboard/app-sidebar.tsx
import type { AuthInfoResponse } from "@mengo/api-client/types";

interface AppSidebarProps {
  user: AuthInfoResponse; // ✅ Typed với user structure
}

export function AppSidebar({ user }: AppSidebarProps) {
  // ✅ user.role is typed as Role enum
  // ✅ user.email is typed as string
  // ✅ user.name is typed as string | null
  return <div>{user.email}</div>;
}
```

---

## Best Practices

### 1. ✅ Luôn sử dụng `ApiError` để handle errors

```typescript
// ✅ Good
try {
  await requestOtp(email);
} catch (error: unknown) {
  if (error instanceof ApiError) {
    return { error: error.message };
  }
  return { error: "Unexpected error" };
}

// ❌ Bad
try {
  await requestOtp(email);
} catch (error: any) {
  return { error: error.message }; // ❌ Không type-safe
}
```

### 2. ✅ Luôn validate input trước khi gọi API

```typescript
// ✅ Good
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  return { error: "Invalid email format." };
}
await requestOtp(email);

// ❌ Bad
await requestOtp(email); // ❌ Để API validate → tốn network request
```

### 3. ✅ Sử dụng `useActionState` cho forms (React 19)

```typescript
// ✅ Good
const [state, formAction] = useActionState(requestEmailOtp, INITIAL_STATE);
return <form action={formAction}>...</form>;

// ❌ Bad
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  // Manual form handling
};
```

### 4. ✅ Clear cookies khi có lỗi authentication

```typescript
// ✅ Good
try {
  const user = await getUserInfo(accessToken);
  return user;
} catch {
  await clearAuthCookies(); // ✅ Clear invalid tokens
  return null;
}
```

### 5. ✅ Sử dụng `requireStudentUser()` cho route protection

```typescript
// ✅ Good
export default async function ProtectedPage() {
  const user = await requireStudentUser(); // ✅ Auto redirect nếu không auth
  return <div>Protected content</div>;
}

// ❌ Bad
export default async function ProtectedPage() {
  const user = await fetchCurrentUser();
  if (!user) {
    redirect("/auth/login"); // ❌ Duplicate logic
  }
  // ...
}
```

### 6. ✅ Environment Variables

- **Luôn set environment variable** trước khi deploy
- **Không hardcode** API URLs trong code
- **Sử dụng `NEXT_PUBLIC_*`** prefix cho client-side accessible vars

### 7. ✅ Type Imports

```typescript
// ✅ Good - Import types từ package
import type { AuthInfoResponse } from "@mengo/api-client/types";

// ❌ Bad - Define types manually
interface AuthInfoResponse {
  // ❌ Duplicate, không sync với schema
}
```

---

## Troubleshooting

### Issue: "API base URL is not configured"

**Nguyên nhân**: Không có environment variable nào được set.

**Giải pháp**:
1. Tạo file `.env.local` trong `apps/web/`
2. Thêm một trong các biến:
   ```env
   NEXT_PUBLIC_APIs_URL_LOCAL=http://localhost:8080
   # HOẶC
   NEXT_PUBLIC_APIs_URL_HOST_VPS=https://your-api-domain.com
   ```
3. Restart Next.js dev server

### Issue: "Cannot POST /docs/auth/request-otp"

**Nguyên nhân**: Base URL có chứa `/docs` (Swagger UI path).

**Giải pháp**:
- Kiểm tra environment variable, đảm bảo không có `/docs` trong URL
- Base URL nên là: `http://localhost:8080` (không có trailing slash)

### Issue: "useActionState called outside a transition"

**Nguyên nhân**: Sử dụng `useActionState` không đúng cách.

**Giải pháp**:
- Pass `formAction` trực tiếp vào `<form action={formAction}>`
- Không cần `e.preventDefault()` trong form handler
- Xem ví dụ trong `apps/web/components/auth/login-form.tsx`

### Issue: "searchParams is a Promise"

**Nguyên nhân**: Next.js 15+ yêu cầu await `searchParams`.

**Giải pháp**:
```typescript
// ✅ Good
interface PageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const email = params.email;
}

// ❌ Bad
export default function Page({ searchParams }: { searchParams: { email?: string } }) {
  const email = searchParams.email; // ❌ Error in Next.js 15+
}
```

---

## Tài liệu tham khảo

- **Backend API Docs**: `apps/backend/docs/AUTH_API.md`
- **Architecture Overview**: `apps/web/ARCHITECTURE.md`
- **Setup Guide**: `SETUP.md`
- **Next.js Server Actions**: https://nextjs.org/docs/app/api-reference/functions/server-actions
- **React 19 useActionState**: https://react.dev/reference/react/useActionState
- **Axios Documentation**: https://axios-http.com/docs/intro
- **Zod Documentation**: https://zod.dev/

---

**Happy coding! 🚀**


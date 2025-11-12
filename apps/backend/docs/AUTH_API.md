# Mengo Backend API Documentation

## Base URL

```
http://localhost:8080
```

## Swagger Documentation

Swagger UI documentation có sẵn tại:

```
http://localhost:8080/docs
```

Bạn có thể:

- Xem tất cả các API endpoints
- Test các API trực tiếp từ Swagger UI
- Xem request/response schemas
- Xem các error responses
- Test Bearer token authentication

---

## Authentication API

### 1. Request OTP

Gửi mã OTP đến email của user để đăng nhập.

**Request:**

- **Method:** `POST`
- **URL:** `/auth/request-otp`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```

**Response (200 OK):**

```json
{
  "message": "OTP sent"
}
```

**Error Responses:**

**400 Bad Request** - Validation error:

```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

**500 Internal Server Error** - Email sending failed:

```json
{
  "statusCode": 500,
  "message": "Failed to send OTP email: <error message>",
  "error": "Internal Server Error"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:8080/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

**JavaScript/TypeScript Example:**

```typescript
const response = await fetch('http://localhost:8080/auth/request-otp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
  }),
});

const data = await response.json();
console.log(data);
// Output: { message: "OTP sent" }
```

---

### 2. Verify OTP

Xác thực OTP và nhận access token + refresh token.

**Request:**

- **Method:** `POST`
- **URL:** `/auth/verify-otp`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```

**Response (200 OK):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1dWlkLX N0cmluZyIsInJvbGUiOiJTVFVERU5UIiwiaWF0IjoxNjk5OTk5OTk5LCJleHAiOjE3MDAwODk5OTl9.signature",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1dWlkLX N0cmluZyIsImlhdCI6MTY5OTk5OTk5OSwiZXhwIjoxNzAwNTk5OTk5fQ.signature",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": null,
    "role": "STUDENT"
  }
}
```

**Error Responses:**

**400 Bad Request** - Validation error:

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "otp must be longer than or equal to 6 characters",
    "otp should not be empty"
  ],
  "error": "Bad Request"
}
```

**401 Unauthorized** - Invalid email or OTP:

```json
{
  "statusCode": 401,
  "message": "Invalid email or OTP",
  "error": "Unauthorized"
}
```

**401 Unauthorized** - OTP expired or invalid:

```json
{
  "statusCode": 401,
  "message": "OTP expired or invalid",
  "error": "Unauthorized"
}
```

**401 Unauthorized** - Invalid OTP:

```json
{
  "statusCode": 401,
  "message": "Invalid OTP",
  "error": "Unauthorized"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:8080/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "otp": "123456"
  }'
```

**JavaScript/TypeScript Example:**

```typescript
const response = await fetch('http://localhost:8080/auth/verify-otp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    otp: '123456',
  }),
});

const data = await response.json();
console.log(data);
// Output: {
//   accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
//   refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
//   user: {
//     id: "550e8400-e29b-41d4-a716-446655440000",
//     email: "user@example.com",
//     name: null,
//     role: "STUDENT"
//   }
// }

// Save tokens for later use
localStorage.setItem('accessToken', data.accessToken);
localStorage.setItem('refreshToken', data.refreshToken);
```

---

### 3. Get User Info

Lấy thông tin user từ access token (yêu cầu authentication).

**Request:**

- **Method:** `GET`
- **URL:** `/auth/info`
- **Headers:**
  ```
  Authorization: Bearer <accessToken>
  Content-Type: application/json
  ```

**Response (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": null,
  "role": "STUDENT"
}
```

**Error Responses:**

**401 Unauthorized** - Invalid or missing token:

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**401 Unauthorized** - User not found:

```json
{
  "statusCode": 401,
  "message": "User not found",
  "error": "Unauthorized"
}
```

**cURL Example:**

```bash
curl -X GET http://localhost:8080/auth/info \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**JavaScript/TypeScript Example:**

```typescript
const accessToken = localStorage.getItem('accessToken');

const response = await fetch('http://localhost:8080/auth/info', {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
console.log(data);
// Output: {
//   id: "550e8400-e29b-41d4-a716-446655440000",
//   email: "user@example.com",
//   name: "John Doe",
//   avatar: null,
//   role: "STUDENT"
// }
```

---

### 4. Logout

Đăng xuất user bằng cách xóa refresh token khỏi database (yêu cầu authentication).

**Request:**

- **Method:** `GET`
- **URL:** `/auth/logout`
- **Headers:**
  ```
  Authorization: Bearer <accessToken>
  Content-Type: application/json
  ```

**Response (200 OK):**

```json
{
  "message": "Logged out successfully"
}
```

**Error Responses:**

**401 Unauthorized** - Invalid or missing token:

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**401 Unauthorized** - User not found:

```json
{
  "statusCode": 401,
  "message": "User not found",
  "error": "Unauthorized"
}
```

**cURL Example:**

```bash
curl -X GET http://localhost:8080/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**JavaScript/TypeScript Example:**

```typescript
const accessToken = localStorage.getItem('accessToken');

const response = await fetch('http://localhost:8080/auth/logout', {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
console.log(data);
// Output: { message: "Logged out successfully" }

// Clear tokens from storage
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
```

---

## Authentication Flow

### Complete Flow Example

```typescript
// Step 1: Request OTP
const requestOtpResponse = await fetch(
  'http://localhost:8080/auth/request-otp',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'user@example.com' }),
  },
);
const requestOtpData = await requestOtpResponse.json();
// Response: { message: "OTP sent" }

// Step 2: User receives OTP via email
// User enters OTP from email

// Step 3: Verify OTP
const verifyOtpResponse = await fetch('http://localhost:8080/auth/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    otp: '123456', // OTP from email
  }),
});
const verifyOtpData = await verifyOtpResponse.json();
// Response: {
//   accessToken: "...",
//   refreshToken: "...",
//   user: { ... }
// }

// Save tokens
localStorage.setItem('accessToken', verifyOtpData.accessToken);
localStorage.setItem('refreshToken', verifyOtpData.refreshToken);

// Step 4: Get User Info (using access token)
const accessToken = localStorage.getItem('accessToken');
const userInfoResponse = await fetch('http://localhost:8080/auth/info', {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});
const userInfo = await userInfoResponse.json();
// Response: {
//   id: "...",
//   email: "...",
//   name: "...",
//   avatar: null,
//   role: "STUDENT"
// }

// Step 5: Logout (using access token)
const logoutResponse = await fetch('http://localhost:8080/auth/logout', {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});
const logoutData = await logoutResponse.json();
// Response: { message: "Logged out successfully" }

// Clear tokens
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
```

---

## Frontend Implementation Guide

### TypeScript Types

```typescript
// Types for API requests and responses
interface RequestOtpRequest {
  email: string;
}

interface RequestOtpResponse {
  message: string;
}

interface VerifyOtpRequest {
  email: string;
  otp: string;
}

interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: 'STUDENT' | 'INSTRUCTOR';
  };
}

interface UserInfoResponse {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: 'STUDENT' | 'INSTRUCTOR';
}

interface LogoutResponse {
  message: string;
}
```

### API Service Class

```typescript
class AuthService {
  private baseUrl = 'http://localhost:8080';

  async requestOtp(email: string): Promise<RequestOtpResponse> {
    const response = await fetch(`${this.baseUrl}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to request OTP');
    }

    return response.json();
  }

  async verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
    const response = await fetch(`${this.baseUrl}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to verify OTP');
    }

    return response.json();
  }

  async getUserInfo(accessToken: string): Promise<UserInfoResponse> {
    const response = await fetch(`${this.baseUrl}/auth/info`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get user info');
    }

    return response.json();
  }

  async logout(accessToken: string): Promise<LogoutResponse> {
    const response = await fetch(`${this.baseUrl}/auth/logout`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to logout');
    }

    return response.json();
  }
}

// Usage
const authService = new AuthService();

// Request OTP
await authService.requestOtp('user@example.com');

// Verify OTP
const { accessToken, refreshToken, user } = await authService.verifyOtp(
  'user@example.com',
  '123456',
);

// Get User Info
const userInfo = await authService.getUserInfo(accessToken);

// Logout
await authService.logout(accessToken);
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

function useAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load token from localStorage on mount
    const token = localStorage.getItem('accessToken');
    if (token) {
      setAccessToken(token);
      // Fetch user info
      fetchUserInfo(token);
    }
  }, []);

  const requestOtp = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await authService.requestOtp(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request OTP');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.verifyOtp(email, otp);
      setAccessToken(response.accessToken);
      setUser(response.user);
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const userInfo = await authService.getUserInfo(token);
      setUser(userInfo);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch user info',
      );
      // Clear token if invalid
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        setAccessToken(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      if (accessToken) {
        await authService.logout(accessToken);
      }
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  return {
    accessToken,
    user,
    loading,
    error,
    requestOtp,
    verifyOtp,
    logout,
    isAuthenticated: !!accessToken,
  };
}
```

---

## JWT Tokens

### Access Token

- **Purpose:** Authenticate API requests
- **Payload:** `{ sub: userId, role: userRole }`
- **Expiration:** 1 day (1d)
- **Secret:** `JWT_ACCESS_SECRET`
- **Usage:** Include in `Authorization: Bearer <token>` header

### Refresh Token

- **Purpose:** Refresh access token when expired
- **Payload:** `{ sub: userId }`
- **Expiration:** 7 days (7d)
- **Secret:** `JWT_REFRESH_SECRET`
- **Storage:** Hashed with bcrypt in database (field `hashedRefreshToken`)

---

## User Roles

- **STUDENT** - Default role for new users
- **INSTRUCTOR** - Assigned from membership in organization

---

## OTP Details

- **Format:** 6 digits (e.g., `123456`)
- **Expiration:** 5 minutes
- **Delivery:** Email (Resend API)
- **Storage:** Hashed with bcrypt in database
- **After verification:** OTP is deleted from database
- **Usage:** One-time use only

---

## Environment Variables

Đảm bảo các biến môi trường sau được cấu hình trong file `.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mengo?schema=public"

# JWT Secrets
JWT_ACCESS_SECRET="your-access-secret-key-here"
JWT_REFRESH_SECRET="your-refresh-secret-key-here"

# Resend API Key
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Server Port (optional, default: 8080)
PORT=8080
```

---

## Common Issues

### 1. OTP không được gửi

- Kiểm tra `RESEND_API_KEY` trong `.env`
- Kiểm tra email có hợp lệ không
- Kiểm tra Resend API quota

### 2. OTP expired or invalid

- OTP chỉ có hiệu lực trong 5 phút
- Mỗi OTP chỉ có thể sử dụng một lần
- Đảm bảo sử dụng OTP mới nhất được gửi

### 3. Invalid email or OTP

- Đảm bảo email đã được đăng ký (tự động tạo khi request OTP)
- Kiểm tra OTP chính xác (6 chữ số)
- Đảm bảo OTP chưa hết hạn

### 4. Unauthorized (401)

- Kiểm tra access token có hợp lệ không
- Kiểm tra token chưa hết hạn
- Kiểm tra `Authorization: Bearer <token>` header được gửi đúng
- Kiểm tra `JWT_ACCESS_SECRET` trong `.env`

### 5. JWT secrets not defined

- Đảm bảo `JWT_ACCESS_SECRET` và `JWT_REFRESH_SECRET` được cấu hình trong `.env`
- Restart server sau khi thay đổi `.env`

---

## Notes

- Server chạy trên port `8080` (mặc định) hoặc port được cấu hình trong biến môi trường `PORT`
- OTP được hash với bcrypt trước khi lưu vào database
- Refresh token được hash với bcrypt trước khi lưu vào database
- User role mặc định là `STUDENT` nếu không có membership
- User được tự động tạo khi request OTP (nếu chưa tồn tại)
- OTP sẽ tự động bị xóa sau khi verify thành công
- Access token cần được gửi trong header `Authorization: Bearer <token>` cho các API yêu cầu authentication
- Avatar field hiện tại trả về `null` (chưa có trong database schema)

# Google OAuth 2.0 API Documentation

## Base URL

```
http://localhost:8080
```

---

## Overview

Google OAuth 2.0 cho phép người dùng đăng nhập bằng tài khoản Google của họ. Flow này sử dụng OAuth 2.0 authorization code flow với redirect-based authentication.

**Đặc điểm:**
- Người dùng không cần nhập mật khẩu
- Tự động tạo user mới nếu email chưa tồn tại trong hệ thống
- Trả về cùng format `accessToken` và `refreshToken` như OTP flow
- Redirect-based flow (không thể test trực tiếp trên Swagger UI)

---

## Authentication Flow

```
1. User clicks "Login with Google" button
   ↓
2. Frontend redirects to: GET /auth/google
   ↓
3. Backend redirects to Google OAuth consent screen
   ↓
4. User grants permission on Google
   ↓
5. Google redirects back to: GET /auth/google/callback
   ↓
6. Backend validates user, creates/finds user in database
   ↓
7. Backend generates JWT tokens (accessToken, refreshToken)
   ↓
8. Backend redirects to: FRONTEND_URL/auth/callback?accessToken=...&refreshToken=...
   ↓
9. Frontend extracts tokens from URL and stores them
```

---

## API Endpoints

### 1. Initiate Google OAuth Flow

Bắt đầu quá trình đăng nhập với Google. Endpoint này sẽ redirect người dùng đến Google consent screen.

**Request:**

- **Method:** `GET`
- **URL:** `/auth/google`
- **Headers:** Không cần
- **Body:** Không cần

**Response:**

Endpoint này không trả về JSON response. Thay vào đó, nó sẽ redirect (HTTP 302) người dùng đến Google OAuth consent screen.

**Redirect URL (từ Google):**

Sau khi người dùng đồng ý, Google sẽ redirect về:
```
GET /auth/google/callback?code=<authorization_code>&scope=...
```

**cURL Example:**

```bash
# Lưu ý: cURL không thể follow redirect flow này
# Chỉ có thể test bằng trình duyệt
curl -L http://localhost:8080/auth/google
```

**Frontend Integration:**

```typescript
// Option 1: Direct redirect (Recommended)
window.location.href = 'http://localhost:8080/auth/google';

// Option 2: Using anchor tag
<a href="http://localhost:8080/auth/google">
  Login with Google
</a>

// Option 3: Using React Router (if needed)
import { useNavigate } from 'react-router-dom';

function GoogleLoginButton() {
  const navigate = useNavigate();
  
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/auth/google';
  };
  
  return (
    <button onClick={handleGoogleLogin}>
      Login with Google
    </button>
  );
}
```

---

### 2. Google OAuth Callback

Endpoint này được Google gọi sau khi người dùng đồng ý. Backend sẽ xử lý và redirect về frontend với tokens.

**Request:**

- **Method:** `GET`
- **URL:** `/auth/google/callback`
- **Query Parameters:** (Được Google tự động thêm)
  - `code`: Authorization code từ Google
  - `scope`: Các quyền đã được cấp
  - `authuser`: User index (nếu có nhiều account)
  - `prompt`: Prompt type

**Response:**

Endpoint này không trả về JSON response. Thay vào đó, nó sẽ redirect (HTTP 302) về frontend với tokens trong query parameters:

```
FRONTEND_URL/auth/callback?accessToken=<jwt_token>&refreshToken=<jwt_token>
```

**Frontend Callback Handler:**

Tạo một route/page để xử lý callback từ backend:

```typescript
// Example: /auth/callback page
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Redirect to home or dashboard
      navigate('/dashboard');
    } else {
      // Handle error
      navigate('/login?error=oauth_failed');
    }
  }, [searchParams, navigate]);

  return <div>Processing login...</div>;
}
```

---

## Frontend Integration Guide

### Step 1: Setup Google Login Button

```tsx
// components/GoogleLoginButton.tsx
export function GoogleLoginButton() {
  const handleGoogleLogin = () => {
    const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    window.location.href = `${backendUrl}/auth/google`;
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="google-login-button"
    >
      <img src="/google-icon.svg" alt="Google" />
      Continue with Google
    </button>
  );
}
```

### Step 2: Create Callback Handler Page

```tsx
// pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      navigate('/login?error=oauth_failed');
      return;
    }

    if (accessToken && refreshToken) {
      // Store tokens securely
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Optional: Fetch user info
      fetchUserInfo(accessToken);

      // Redirect to intended page or dashboard
      const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(redirectTo);
    } else {
      navigate('/login?error=missing_tokens');
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing login...</p>
      </div>
    </div>
  );
}

async function fetchUserInfo(token: string) {
  try {
    const response = await fetch('http://localhost:8080/auth/info', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const userInfo = await response.json();
    // Store user info if needed
    localStorage.setItem('user', JSON.stringify(userInfo));
  } catch (error) {
    console.error('Failed to fetch user info:', error);
  }
}
```

### Step 3: Setup Routes

```tsx
// App.tsx or router configuration
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthCallback } from './pages/AuthCallback';
import { LoginPage } from './pages/LoginPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/login" element={<LoginPage />} />
        {/* ... other routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

### Step 4: Complete Integration Example

```tsx
// pages/LoginPage.tsx
import { GoogleLoginButton } from '../components/GoogleLoginButton';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for error from query params
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    if (errorParam) {
      setError('Login failed. Please try again.');
    }
  }, []);

  const handleGoogleLogin = () => {
    // Store intended destination
    const currentPath = window.location.pathname;
    sessionStorage.setItem('redirectAfterLogin', currentPath);

    // Redirect to Google OAuth
    const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    window.location.href = `${backendUrl}/auth/google`;
  };

  return (
    <div className="login-page">
      <h1>Welcome</h1>
      {error && <div className="error-message">{error}</div>}
      
      <div className="login-options">
        <GoogleLoginButton onClick={handleGoogleLogin} />
        
        {/* Or use OTP login */}
        <OTPLoginForm />
      </div>
    </div>
  );
}
```

---

## Token Format

Sau khi đăng nhập thành công, bạn sẽ nhận được 2 tokens giống như OTP flow:

### Access Token

- **Purpose:** Authenticate API requests
- **Payload:** `{ sub: userId, role: userRole }`
- **Expiration:** 1 day (1d)
- **Usage:** Include in `Authorization: Bearer <token>` header

### Refresh Token

- **Purpose:** Refresh access token when expired
- **Payload:** `{ sub: userId }`
- **Expiration:** 7 days (7d)
- **Storage:** Hashed with bcrypt in database

**Example Response URL:**

```
http://localhost:3000/auth/callback?accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...&refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## User Creation Logic

**Nếu email từ Google chưa tồn tại trong database:**
- Tự động tạo user mới với:
  - `email`: Email từ Google account
  - `name`: Display name từ Google profile
  - `role`: Mặc định là `STUDENT` (có thể thay đổi qua membership)

**Nếu email đã tồn tại:**
- Đăng nhập với user hiện có
- Giữ nguyên role và membership

---

## Error Handling

### Common Errors

**1. Missing Environment Variables**

Nếu `CALLBACK_URL_OAUTH2` hoặc `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` chưa được cấu hình:

```
Error: CALLBACK_URL_OAUTH2 must be defined in environment variables
```

**Solution:** Đảm bảo các biến môi trường đã được cấu hình trong `.env` file.

**2. Google OAuth Configuration Mismatch**

Nếu callback URL không khớp với Google Console:

```
Error: redirect_uri_mismatch
```

**Solution:** 
- Kiểm tra `CALLBACK_URL_OAUTH2` trong `.env`
- Đảm bảo URL này đã được thêm vào "Authorized redirect URIs" trong Google Cloud Console

**3. Missing Email in Google Profile**

Nếu Google không cung cấp email:

```
Error: Google login failed: No email provided
```

**Solution:** Đảm bảo OAuth scope bao gồm `email`.

**4. Frontend Callback Errors**

Nếu tokens không được truyền về frontend:

```typescript
// Check URL parameters
const accessToken = searchParams.get('accessToken');
if (!accessToken) {
  // Handle error
  navigate('/login?error=missing_tokens');
}
```

---

## Environment Variables

Đảm bảo các biến môi trường sau được cấu hình trong file `.env`:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
CALLBACK_URL_OAUTH2="http://localhost:8080/auth/google/callback"

# Frontend URL (for redirect after login)
FRONTEND_URL="http://localhost:3000"

# JWT Secrets (same as OTP flow)
JWT_ACCESS_SECRET="your-access-secret-key-here"
JWT_REFRESH_SECRET="your-refresh-secret-key-here"
```

---

## Google Cloud Console Setup

### Step 1: Create OAuth 2.0 Credentials

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project của bạn
3. Điều hướng đến **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Chọn **Web application**
6. Điền thông tin:
   - **Name:** Mengo Backend OAuth
   - **Authorized redirect URIs:** 
     ```
     http://localhost:8080/auth/google/callback
     ```
     (hoặc URL production của bạn)

### Step 2: Configure OAuth Consent Screen

1. Điều hướng đến **APIs & Services** > **OAuth consent screen**
2. Chọn **External** (hoặc **Internal** nếu dùng Google Workspace)
3. Điền thông tin ứng dụng
4. Thêm scopes:
   - `profile`
   - `email`
5. Thêm test users (nếu app chưa được verify)

### Step 3: Copy Credentials

Sau khi tạo, copy:
- **Client ID** → `GOOGLE_CLIENT_ID`
- **Client Secret** → `GOOGLE_CLIENT_SECRET`

---

## Testing

### Manual Testing

1. **Start backend server:**
   ```bash
   cd apps/backend
   pnpm dev
   ```

2. **Open browser và navigate to:**
   ```
   http://localhost:8080/auth/google
   ```

3. **Expected flow:**
   - Redirect đến Google login page
   - Đăng nhập với Google account
   - Redirect về `http://localhost:8080/auth/google/callback`
   - Backend xử lý và redirect về frontend với tokens
   - Frontend lưu tokens và redirect đến dashboard

### Testing với Frontend

1. **Setup frontend callback route:**
   ```tsx
   <Route path="/auth/callback" element={<AuthCallback />} />
   ```

2. **Click "Login with Google" button:**
   ```tsx
   <button onClick={() => {
     window.location.href = 'http://localhost:8080/auth/google';
   }}>
     Login with Google
   </button>
   ```

3. **Verify tokens được lưu:**
   ```typescript
   console.log(localStorage.getItem('accessToken'));
   console.log(localStorage.getItem('refreshToken'));
   ```

---

## Security Considerations

1. **HTTPS in Production:**
   - Luôn sử dụng HTTPS cho production
   - Update `CALLBACK_URL_OAUTH2` và `FRONTEND_URL` với HTTPS URLs

2. **Token Storage:**
   - Không lưu tokens trong `localStorage` nếu có nguy cơ XSS
   - Cân nhắc sử dụng `httpOnly` cookies (cần backend support)

3. **State Parameter:**
   - Có thể thêm `state` parameter để prevent CSRF attacks
   - Hiện tại chưa implement, có thể thêm sau

4. **Token Validation:**
   - Luôn validate tokens trên backend
   - Sử dụng refresh token khi access token hết hạn

---

## Comparison với OTP Flow

| Feature | OTP Flow | Google OAuth Flow |
|---------|----------|-------------------|
| User Input | Email + OTP code | None (automatic) |
| User Creation | Auto-create on OTP request | Auto-create on first login |
| Token Format | Same JWT format | Same JWT format |
| Token Expiration | 1d access, 7d refresh | 1d access, 7d refresh |
| Testing | Swagger UI | Browser only |
| Security | Email verification | Google OAuth verification |

---

## Troubleshooting

### Issue: Redirect loop

**Cause:** Callback URL không khớp với Google Console

**Solution:** 
- Kiểm tra `CALLBACK_URL_OAUTH2` trong `.env`
- Đảm bảo URL chính xác trong Google Cloud Console

### Issue: "redirect_uri_mismatch" error

**Cause:** Callback URL trong code không khớp với Google Console

**Solution:**
- Kiểm tra `CALLBACK_URL_OAUTH2` environment variable
- Đảm bảo không có trailing slash
- Kiểm tra protocol (http vs https)

### Issue: Tokens không được truyền về frontend

**Cause:** `FRONTEND_URL` chưa được cấu hình hoặc sai

**Solution:**
- Kiểm tra `FRONTEND_URL` trong `.env`
- Đảm bảo frontend route `/auth/callback` đã được setup

### Issue: User không được tạo

**Cause:** Database connection issue hoặc Prisma error

**Solution:**
- Kiểm tra database connection
- Xem backend logs để tìm lỗi cụ thể
- Đảm bảo Prisma schema đã được migrate

---

## Notes

- Google OAuth flow là **redirect-based**, không thể test bằng Swagger UI
- Tokens được truyền qua URL query parameters (có thể thấy trong browser history)
- Frontend cần xử lý callback route để extract và lưu tokens
- User được tự động tạo nếu email chưa tồn tại
- Role mặc định là `STUDENT`, có thể thay đổi qua membership

---

## Support

Nếu gặp vấn đề, kiểm tra:
1. Backend logs để xem lỗi cụ thể
2. Google Cloud Console để verify OAuth configuration
3. Environment variables trong `.env` file
4. Network tab trong browser để xem redirect flow


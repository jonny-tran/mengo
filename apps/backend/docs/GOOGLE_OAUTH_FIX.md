# 🔧 Fix Google OAuth redirect_uri_mismatch Error

## ❌ Lỗi: `Error 400: redirect_uri_mismatch`

Lỗi này xảy ra khi callback URL trong **Google Cloud Console** không khớp với callback URL trong **backend .env file**.

## ✅ Giải pháp

### Bước 1: Kiểm tra Backend .env File

File: `apps/backend/.env`

Đảm bảo có:
```env
CALLBACK_URL_OAUTH2="http://localhost:8080/auth/google/callback"
```

**⚠️ Lưu ý quan trọng:**
- ❌ Không có dấu `/` ở cuối: `http://localhost:8080/auth/google/callback/`
- ✅ Đúng format: `http://localhost:8080/auth/google/callback`
- ✅ Đúng protocol: `http://` (không phải `https://` cho localhost)
- ✅ Đúng port: `8080` (không phải `8000`)
- ✅ Không có khoảng trắng thừa

### Bước 2: Update Google Cloud Console

1. **Truy cập:** https://console.cloud.google.com/apis/credentials

2. **Chọn OAuth 2.0 Client ID** của bạn

3. **Trong "Authorized redirect URIs":**
   - ❌ **Xóa** (nếu có): `http://localhost:8000/auth/google/callback`
   - ✅ **Thêm:** `http://localhost:8080/auth/google/callback`
   - ⚠️ **Không có dấu `/` ở cuối**

4. **Click "SAVE"**

### Bước 3: Restart Backend

**Sau khi sửa .env file, BẮT BUỘC phải restart backend:**

```bash
# 1. Dừng backend (Ctrl + C trong terminal)

# 2. Restart backend
cd apps/backend
pnpm dev
```

**⚠️ Quan trọng:** Backend chỉ đọc `.env` file khi khởi động. Nếu bạn sửa `.env` nhưng không restart, backend vẫn dùng giá trị cũ!

### Bước 4: Verify Configuration

Sau khi restart, kiểm tra:

1. **Backend đang chạy trên port 8080:**
   ```
   http://localhost:8080/docs
   ```

2. **Kiểm tra log backend:**
   - Nếu có lỗi về `CALLBACK_URL_OAUTH2`, nghĩa là environment variable chưa được load
   - Nếu không có lỗi, nghĩa là đã load thành công

3. **Test OAuth flow:**
   - Click "Login with Google" trên frontend
   - Nếu không còn lỗi `redirect_uri_mismatch`, nghĩa là đã fix thành công!

## 🔍 Debugging

### Kiểm tra callback URL backend đang dùng:

1. **Xem log backend khi khởi động:**
   - Nếu có lỗi: `CALLBACK_URL_OAUTH2 must be defined in environment variables`
   - → Nghĩa là `.env` file chưa được load

2. **Kiểm tra .env file location:**
   - File phải ở: `apps/backend/.env`
   - Không phải: `apps/backend/.env.local` hoặc `apps/backend/.env.example`

3. **Kiểm tra format URL:**
   ```bash
   # Trong terminal, chạy:
   cd apps/backend
   node -e "require('dotenv').config(); console.log(process.env.CALLBACK_URL_OAUTH2)"
   ```
   - Nếu output là `undefined`, nghĩa là `.env` file chưa được load
   - Nếu output là URL, kiểm tra xem có đúng format không

### Common Mistakes:

1. ❌ **Trailing slash:** `http://localhost:8080/auth/google/callback/`
   - ✅ Đúng: `http://localhost:8080/auth/google/callback`

2. ❌ **Wrong port:** `http://localhost:8000/auth/google/callback`
   - ✅ Đúng: `http://localhost:8080/auth/google/callback`

3. ❌ **HTTPS for localhost:** `https://localhost:8080/auth/google/callback`
   - ✅ Đúng: `http://localhost:8080/auth/google/callback`

4. ❌ **Forgot to restart backend:**
   - ✅ Phải restart backend sau khi sửa `.env`

5. ❌ **Google Cloud Console chưa được update:**
   - ✅ Phải update "Authorized redirect URIs" trong Google Cloud Console

## 📝 Checklist

- [ ] Backend `.env` file có `CALLBACK_URL_OAUTH2="http://localhost:8080/auth/google/callback"`
- [ ] Google Cloud Console có `http://localhost:8080/auth/google/callback` trong "Authorized redirect URIs"
- [ ] Đã xóa `http://localhost:8000/auth/google/callback` khỏi Google Cloud Console (nếu có)
- [ ] Backend đã được restart sau khi sửa `.env`
- [ ] Backend đang chạy trên port 8080
- [ ] URL không có trailing slash
- [ ] URL đúng protocol (`http://` cho localhost)

## 🎯 Expected Result

Sau khi fix, flow sẽ hoạt động như sau:

1. User clicks "Login with Google"
2. Redirect đến: `http://localhost:8080/auth/google`
3. Google OAuth consent screen
4. User grants permission
5. Google redirects về: `http://localhost:8080/auth/google/callback` ✅
6. Backend processes callback
7. Backend redirects về: `http://localhost:3000/auth/callback?accessToken=...&refreshToken=...`
8. Frontend processes tokens
9. Redirect đến: `/space` ✅

## 🆘 Still Not Working?

Nếu vẫn còn lỗi:

1. **Kiểm tra backend logs:**
   ```bash
   # Xem log backend khi click "Login with Google"
   # Tìm lỗi cụ thể
   ```

2. **Kiểm tra browser network tab:**
   - Xem request đến Google OAuth
   - Xem `redirect_uri` parameter trong URL
   - So sánh với URL trong Google Cloud Console

3. **Clear browser cache:**
   - Có thể browser đang cache redirect URL cũ
   - Clear cache hoặc dùng incognito mode

4. **Double-check Google Cloud Console:**
   - Đảm bảo đã click "SAVE" sau khi update
   - Đợi vài phút để Google update (đôi khi có delay)


# Mengo Backend

## Environment Variables

Tạo file `.env` trong thư mục `apps/backend/` với nội dung sau:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mengo?schema=public"

# JWT Secrets
JWT_ACCESS_SECRET="your-access-secret-key-here-change-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-key-here-change-in-production"

# Resend API Key
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Server Port (optional, default: 8080)
PORT=8080
```

## Getting Started

1. **Cài đặt dependencies:**
   ```bash
   pnpm install
   ```

2. **Tạo file .env:**
   ```bash
   cp .env.example .env
   # Sau đó chỉnh sửa các giá trị trong .env
   ```

3. **Generate Prisma Client:**
   ```bash
   cd packages/database
   pnpm db:generate
   ```

4. **Run database migrations:**
   ```bash
   cd packages/database
   pnpm db:migrate
   ```

5. **Start server:**
   ```bash
   cd apps/backend
   pnpm dev
   ```

6. **Access Swagger UI:**
   ```
   http://localhost:8080/docs
   ```

## API Documentation

Xem [docs/README.md](./docs/README.md) để biết thêm chi tiết về API.

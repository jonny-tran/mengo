# Hướng dẫn Setup Mengo Prototype

## 📋 Yêu cầu

- **Node.js** 18+ (đã có)
- **pnpm** 9.0.0+ (đã có) hoặc **npm**

## 🚀 Các bước setup

### 1. Cài đặt dependencies

```bash
# Di chuyển vào thư mục web
cd apps/web

# Cài đặt tất cả dependencies
pnpm install

# Hoặc nếu dùng npm:
# npm install
```

### 2. Environment Variables (Tùy chọn - Không bắt buộc cho prototype)

Vì đây là **prototype với simulated integrations**, bạn **KHÔNG CẦN** tạo `.env.local` file. Tất cả đã được simulate.

Nếu muốn tạo file `.env.local` (tùy chọn):

```bash
# Tạo file .env.local (copy từ .env.example nếu có)
# Nhưng không cần thiết vì tất cả đã được simulate
```

**Lưu ý:** Không cần API keys thật vì:
- LLM được simulate trong `/api/llm/generate`
- Database dùng localStorage (in-memory)
- Auth được simulate qua localStorage

### 3. Chạy development server

```bash
# Đảm bảo đang ở trong apps/web
pnpm dev

# Hoặc nếu dùng npm:
# npm run dev
```

Mở trình duyệt tại: **http://localhost:3000**

### 4. Seed data (Khuyến nghị cho lần đầu)

Sau khi app chạy, mở trình duyệt và:

1. Vào `/debug`
2. Click nút **"Seed Database"**
3. Hoặc gọi API trực tiếp:
   ```bash
   curl -X POST http://localhost:3000/api/debug/seed?variant=demo
   ```

## ✅ Kiểm tra setup

### Test các routes chính:

1. **App Dashboard:** http://localhost:3000/app
2. **Guest page:** http://localhost:3000/app/guest
3. **Board:** http://localhost:3000/app/board/[projectId] (sau khi generate plan)
4. **Task detail:** http://localhost:3000/app/task/[taskId]
5. **Instructor dashboard:** http://localhost:3000/instructor/dashboard
6. **Debug/Admin:** http://localhost:3000/debug

### Test flow đầy đủ:

1. Vào `/app/guest` hoặc `/app` (dashboard)
2. Paste brief: "Build a mini e-commerce platform to sell mugs with cart and checkout"
3. Click "Generate Plan"
4. Xem board được tạo
5. Click vào task để xem hints
6. Edit hints
7. Thêm comment
8. Mark task as done

## 🔧 Troubleshooting

### Lỗi: "Module not found"

```bash
# Xóa node_modules và cài lại
rm -rf node_modules
pnpm install
```

### Lỗi: "Port 3000 already in use"

```bash
# Chạy trên port khác
pnpm dev -- -p 3001
```

### Lỗi build

```bash
# Xóa cache và build lại
rm -rf .next
pnpm build
```

## 📝 Lệnh hữu ích

```bash
# Development
pnpm dev              # Chạy dev server

# Build
pnpm build            # Build production
pnpm start            # Chạy production build

# Lint
pnpm lint             # Kiểm tra code quality
```

## 🎯 Quick Start (Tóm tắt)

```bash
# 1. Cài dependencies
cd apps/web
pnpm install

# 2. Chạy dev server
pnpm dev

# 3. Mở browser: http://localhost:3000/app hoặc http://localhost:3000/app/guest

# 4. Seed data (tùy chọn): Vào /debug và click "Seed Database"
```

**Chúc bạn code vui vẻ! 🚀**


# Mengo Setup Guide

This guide will help you set up and run both the frontend and backend of the Mengo project.

## 📋 Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **pnpm** 9.0.0+ (MANDATORY - [Installation Guide](https://pnpm.io/installation))

To install pnpm:

```bash
npm install -g pnpm
```

## 🚀 Quick Start

### 1. Install Dependencies

From the project root directory:

```bash
pnpm install
```

This will install all dependencies for the entire monorepo (frontend, backend, and shared packages).

### 2. Database Setup

#### 2.1. Create Environment File for Backend

Create a `.env` file in `apps/backend/` directory:

```bash
cd apps/backend
touch .env
```

Add the following content to `apps/backend/.env`:

```env
# Database Connection (PostgreSQL)
# Replace with your actual NeonDB or local PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/mengo?schema=public"

# JWT Secrets (Generate strong random strings for production)
JWT_ACCESS_SECRET="your-access-secret-key-here-change-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-key-here-change-in-production"

# Resend API Key (for email OTP)
# Get your API key from https://resend.com/api-keys
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Server Port (optional, default: 8080)
PORT=8080
```

**Important Notes:**

- Replace `DATABASE_URL` with your actual PostgreSQL connection string (NeonDB or local)
- Generate strong random strings for JWT secrets (you can use: `openssl rand -base64 32`)
- Get your Resend API key from [Resend Dashboard](https://resend.com/api-keys)

#### 2.2. Generate Prisma Client

From the project root:

```bash
pnpm --filter=database db:generate
```

Or navigate to the database package:

```bash
cd packages/database
pnpm db:generate
```

#### 2.3. Run Database Migrations

From the project root:

```bash
pnpm --filter=database db:migrate
```

Or navigate to the database package:

```bash
cd packages/database
pnpm db:migrate
```

This will create all necessary tables in your database.

### 3. Run the Project

#### Option A: Run Both Frontend and Backend Together (Recommended)

From the project root, run:

```bash
pnpm dev
```

This will start both:

- **Backend API** (NestJS) at: http://localhost:8080
- **Frontend Web** (Next.js) at: http://localhost:3000

#### Option B: Run Separately

**Terminal 1 - Backend:**

```bash
cd apps/backend
pnpm dev
```

**Terminal 2 - Frontend:**

```bash
cd apps/web
pnpm dev
```

### 4. Verify Setup

#### Backend Verification

1. **Health Check:**
   - Open: http://localhost:8080
   - You should see a welcome message

2. **API Documentation (Swagger):**
   - Open: http://localhost:8080/docs
   - You should see the Swagger UI with all available endpoints

#### Frontend Verification

1. **Home Page:**
   - Open: http://localhost:3000
   - You should see the Mengo application

2. **Test Routes:**
   - Dashboard: http://localhost:3000/space
   - Login: http://localhost:3000/auth/login
   - Signup: http://localhost:3000/auth/signup

## 📝 Project Structure

```
mengo/
├── apps/
│   ├── web/          # Next.js Frontend (Port 3000)
│   └── backend/      # NestJS Backend (Port 8080)
├── packages/
│   ├── database/     # Prisma schema and migrations
│   ├── api-client/   # TypeScript API client
│   ├── eslint-config/
│   └── typescript-config/
└── package.json      # Root package.json with turbo scripts
```

## 🔧 Common Commands

### From Project Root

```bash
# Install all dependencies
pnpm install

# Run both frontend and backend in development mode
pnpm dev

# Build all apps and packages
pnpm build

# Run linter
pnpm lint

# Run type checking
pnpm check-types
```

### Database Commands

```bash
# Generate Prisma Client
pnpm --filter=database db:generate

# Run migrations
pnpm --filter=database db:migrate

# Open Prisma Studio (Database GUI)
pnpm --filter=database db:studio
```

### Backend Commands

```bash
cd apps/backend

# Development mode (with hot reload)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start:prod

# Run tests
pnpm test
```

### Frontend Commands

```bash
cd apps/web

# Development mode
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## 🐛 Troubleshooting

### Issue: "Module not found" or Dependency Errors

```bash
# Clean install from root
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
pnpm install
```

### Issue: "Port 3000 already in use" (Frontend)

```bash
# Kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Or run on a different port
cd apps/web
pnpm dev -- -p 3001
```

### Issue: "Port 8080 already in use" (Backend)

```bash
# Kill the process using port 8080
# Windows:
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:8080 | xargs kill -9

# Or change PORT in apps/backend/.env
```

### Issue: "DATABASE_URL is not defined"

1. Ensure you created `.env` file in `apps/backend/` directory
2. Check that `DATABASE_URL` is set correctly in the `.env` file
3. Restart the backend server after creating/updating `.env`

### Issue: "Prisma Client not generated"

```bash
# Generate Prisma Client
pnpm --filter=database db:generate

# If that doesn't work, try:
cd packages/database
pnpm db:generate
```

### Issue: Database Connection Errors

1. Verify your `DATABASE_URL` is correct
2. Ensure your PostgreSQL database is running
3. Check that the database exists and is accessible
4. For NeonDB: Verify your connection string and that the database is not paused

### Issue: Build Errors

```bash
# Clean build artifacts
rm -rf apps/web/.next
rm -rf apps/backend/dist

# Rebuild
pnpm build
```

## 📚 Additional Resources

- **Backend API Documentation:** See `apps/backend/docs/AUTH_API.md`
- **Frontend Architecture:** See `apps/web/ARCHITECTURE.md`
- **Auth Integration Guide:** See `apps/web/docs/AUTH_INTEGRATION.md`
- **Project Overview:** See `README.md`

## ✅ Next Steps

After successful setup:

1. **Test Authentication Flow:**
   - Sign up at http://localhost:3000/auth/signup
   - Verify OTP (check your email or Resend dashboard)
   - Log in at http://localhost:3000/auth/login

2. **Create Your First Project:**
   - Navigate to the dashboard
   - Paste a project brief
   - Generate a plan using AI

3. **Explore the API:**
   - Visit http://localhost:8080/docs for Swagger UI
   - Test endpoints using the interactive documentation

**Happy coding! 🚀**

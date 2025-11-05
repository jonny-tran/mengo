# 🏗️ Mengo Architecture & Code Guide

Tài liệu này mô tả chi tiết về cấu trúc code, chức năng và mục đích của từng file trong project Mengo.

## 📋 Mục lục

1. [Tổng quan kiến trúc](#tổng-quan-kiến-trúc)
2. [Cấu trúc thư mục](#cấu-trúc-thư-mục)
3. [Data Layer](#data-layer)
4. [API Routes](#api-routes)
5. [Pages & Routes](#pages--routes)
6. [Components](#components)
7. [Data Flow](#data-flow)
8. [Patterns & Conventions](#patterns--conventions)

---

## 🎯 Tổng quan kiến trúc

Mengo được xây dựng theo mô hình **Simulation-First Prototype**, nghĩa là:

- Tất cả external integrations (LLM, DB, Auth) được **simulate** (mô phỏng)
- Data được lưu trong **localStorage** (in-memory với persistence)
- Không cần API keys thật
- Có thể demo đầy đủ mà không cần setup phức tạp

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: React hooks + localStorage
- **Notifications**: Sonner (toast)

---

## 📁 Cấu trúc thư mục

```
apps/web/
├── app/                    # Next.js App Router (Pages & Routes)
│   ├── api/               # API endpoints (Server routes)
│   ├── space/               # Student/User routes (nested trong /space)
│   ├── instructor/        # Instructor routes
│   ├── import/            # CSV import page
│   ├── debug/             # Admin/Debug page
│   └── auth/              # Auth routes (simulated)
├── lib/                   # Core logic & utilities
│   └── mock-data.ts       # Database simulation
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   └── auth/             # Auth components
├── public/               # Static assets
└── README.md            # Setup guide
```

---

## 💾 Data Layer

### `lib/mock-data.ts` - Database Simulation

**Mục đích**: Mô phỏng database với in-memory storage và localStorage persistence.

**Chức năng chính**:

#### 1. **Type Definitions** (Dòng 1-78)

```typescript
export type TaskStatus = 'todo' | 'progress' | 'done';
export type HintLevel = 'metacognitive' | 'conceptual' | 'keywords';

export interface User { ... }
export interface Project { ... }
export interface Epic { ... }
export interface Task { ... }
export interface Hint { ... }
export interface Comment { ... }
export interface Team { ... }
export interface AnalyticsEvent { ... }
```

- Định nghĩa tất cả data models
- TypeScript interfaces đảm bảo type safety

#### 2. **Database Instance** (Dòng 80-292)

```typescript
export const database = {
  // Users
  get users() { ... }
  setUser(user: User) { ... }
  getUserById(id: string) { ... }

  // Projects
  setProject(project: Project) { ... }
  getProjectById(id: string) { ... }

  // ... và nhiều methods khác
}
```

**Cách hoạt động**:

- `dbInstance`: Biến private chứa toàn bộ data
- `loadDatabase()`: Load từ localStorage khi khởi động
- `saveDatabase()`: Lưu vào localStorage sau mỗi thay đổi
- Mỗi method (`setUser`, `setProject`, ...) tự động save

**Lưu ý quan trọng**:

- Server-side: Trả về empty database (vì không có `window`)
- Client-side: Load/save từ localStorage
- Key trong localStorage: `'mengo_db'`

**Ví dụ sử dụng**:

```typescript
// Thêm user
database.setUser({
  id: "user_1",
  name: "John",
  email: "john@example.com",
  role: "student",
});

// Lấy project
const project = database.getProjectById("proj_1");

// Lấy tất cả hints của task
const hints = database.getHintsByTaskId("task_1");
```

#### 3. **Helper Functions** (Dòng 297-320)

- Wrapper functions để backward compatibility
- Có thể deprecated trong tương lai

---

## 🔌 API Routes

Tất cả API routes nằm trong `app/api/`. Next.js App Router tự động tạo endpoints từ structure này.

### `app/api/llm/generate/route.ts` - Simulated LLM

**Route**: `POST /api/llm/generate`

**Mục đích**: Mô phỏng LLM API để generate project plan từ brief.

**Chức năng**:

1. Nhận `brief` string từ request body
2. Phân tích keywords trong brief
3. Trả về plan với template tương ứng (e-commerce, task management, hoặc default)
4. Support query params:
   - `?simulate_fail=true` - Test error flow
   - `?latency=800` - Simulate response time

**Input**:

```typescript
{
  brief: string;
  template?: 'default' | 'detailed';
  simulate_success?: boolean;
  latency_ms?: number;
}
```

**Output**:

```typescript
{
  project_title: string;
  epics: Array<{
    title: string;
    tasks: Array<{
      title: string;
      description: string;
      hints: Array<{
        level: "metacognitive" | "conceptual" | "keywords";
        content: string;
      }>;
    }>;
  }>;
}
```

**Templates**:

- **E-commerce**: Nếu brief chứa "e-commerce", "shop", "cart"
- **Task Management**: Nếu brief chứa "task", "kanban", "board"
- **Default**: Template generic cho các brief khác

**Validation**: Đảm bảo output có ≥3 epics hoặc ≥8 tasks

---

### `app/api/analytics/route.ts` - Event Tracking

**Routes**:

- `POST /api/analytics` - Record event
- `GET /api/analytics?type=xxx` - Get events

**Mục đích**: Track user actions để tính metrics (activation rate, time-to-first-task).

**Event Types**:

- `plan_created`
- `task_created`
- `hint_viewed`
- `task_completed`
- `task_assigned`

**Cách sử dụng**:

```typescript
// Record event
await fetch("/api/analytics", {
  method: "POST",
  body: JSON.stringify({
    type: "task_completed",
    projectId: "proj_1",
    taskId: "task_1",
    userId: "user_1",
  }),
});

// Get events
const res = await fetch("/api/analytics?type=plan_created");
const { events } = await res.json();
```

---

### `app/api/analytics/export/route.ts` - Export Events

**Route**: `GET /api/analytics/export?format=csv|json`

**Mục đích**: Export analytics events để phân tích.

**Formats**:

- `json` (default)
- `csv`

---

### `app/api/import/csv/route.ts` - CSV Import

**Route**: `POST /api/import/csv`

**Mục đích**: Import teams từ CSV file.

**CSV Format**:

```csv
team_name,member_emails,instructor_email
Team Alpha,"alice@example.com;bob@example.com",inst1@example.com
```

**Query Params**:

- `?simulate_bad_csv=true` - Test error handling

**Output**:

```typescript
{
  success: true;
  teamsCreated: number;
  teams: Team[];
  errors?: string[];
}
```

---

### `app/api/debug/seed/route.ts` - Seed Data

**Route**: `POST /api/debug/seed?variant=demo`

**Mục đích**: Populate database với sample data để testing/demo.

**Tạo**:

- 3 instructors
- 10 teams
- 3 projects (với epics, tasks, hints)
- 1 stuck task (để test instructor alerts)
- Analytics events

**Output**:

```typescript
{
  success: true;
  counts: {
    users: number;
    projects: number;
    teams: number;
    epics: number;
    tasks: number;
    hints: number;
    events: number;
  }
}
```

---

## 📄 Pages & Routes

### Student Routes (`/app/*`)

#### `app/app/page.tsx` - Dashboard

**Route**: `/app`

**Mục đích**: Dashboard hiển thị tất cả projects của user.

**Chức năng**:

- Hiển thị grid các projects
- Click vào project → navigate đến board
- Button "Create New Project" → navigate đến `/app/guest`

**Key Code**:

```typescript
const projects = getProjectsForUser(MOCK_USER_ID);
// Map projects thành cards
// Mỗi card có link đến /app/board/[projectId]
```

---

#### `app/app/guest/page.tsx` - Create Project

**Route**: `/app/guest`

**Mục đích**: Landing page để user paste brief và generate plan.

**Flow**:

1. User nhập brief vào textarea
2. Click "Generate Plan"
3. Call `/api/llm/generate` với brief
4. Parse response → Create project, epics, tasks, hints
5. Track `plan_created` event
6. Redirect đến `/app/board/[projectId]`

**Key Functions**:

- `handleGenerate()`: Main logic để generate plan
- `handlePreview()`: Preview brief (không generate)

**State Management**:

- `brief`: Brief text
- `isGenerating`: Loading state
- `showPreview`: Preview toggle

**Lưu ý**:

- Tự động tạo `guest_user` nếu chưa có
- Mỗi task được tạo với 3 hints (metacognitive, conceptual, keywords)

---

#### `app/app/board/[projectId]/page.tsx` - Kanban Board

**Route**: `/app/board/:projectId`

**Mục đích**: Kanban board với 3 columns (To Do, In Progress, Done).

**Chức năng**:

1. **Load data**: Project, epics, tasks, users
2. **Display columns**: 3 columns với tasks tương ứng
3. **Drag & Drop**: HTML5 DnD API để move tasks
4. **Assign tasks**: Dropdown để assign user
5. **Task cards**: Click → navigate đến task detail

**Key Functions**:

- `handleStatusChange()`: Update task status
- `handleAssign()`: Assign task to user
- `handleDragStart/Drop()`: Drag & drop logic
- `getTasksByStatus()`: Filter tasks by status

**State**:

- `project`, `epics`, `tasks`, `users`
- `draggedTask`: Task đang được drag

**UI Features**:

- Epics badges ở trên
- Task cards với hint preview
- Assign dropdown
- Back button về `/app/guest`

---

#### `app/app/task/[taskId]/page.tsx` - Task Detail

**Route**: `/app/task/:taskId`

**Mục đích**: Chi tiết task với 3 editable hints và comments.

**Chức năng**:

1. **Display task info**: Title, description, status, assignee
2. **3 editable hints**: Metacognitive, Conceptual, Keywords
3. **Edit hints**: Click Edit → Textarea → Save/Cancel
4. **Comments**: Add/view comments
5. **Status/Assignee**: Change dropdown

**Key Functions**:

- `handleHintEdit/Save/Cancel()`: Hint editing logic
- `handleStatusChange()`: Update status
- `handleAssign()`: Update assignee
- `handleAddComment()`: Add comment

**State**:

- `task`, `hints`, `comments`, `users`
- `editingHint`: Hint ID đang edit
- `editContent`: Content của hint đang edit
- `newComment`: Comment text input

**UI Sections**:

1. Task header (title, status, assignee)
2. Description
3. 3-level hints (editable)
4. Comments section

---

### Instructor Routes

#### `app/instructor/dashboard/page.tsx` - Instructor Dashboard

**Route**: `/instructor/dashboard`

**Mục đích**: Dashboard cho instructor để monitor teams và stuck tasks.

**Chức năng**:

1. **Check admin mode**: localStorage `mengo_admin === 'true'`
2. **Load teams**: Tất cả teams từ database
3. **Calculate stuck tasks**: Tasks > X days với no comments
4. **Display alerts**: Stuck teams với tasks
5. **Export CSV**: Export stuck teams data

**Key Functions**:

- `loadData()`: Load teams và calculate stuck
- `handleExportCSV()`: Export CSV file
- Stuck calculation: `task_age_days > threshold && comment_count === 0 && status !== 'done'`

**UI Sections**:

1. Header với buttons (Import CSV, Export CSV)
2. Stuck threshold input
3. Stuck Teams Alert (card với danh sách)
4. All Teams grid

**Protected Route**: Check admin mode, redirect nếu không có quyền

---

#### `app/import/page.tsx` - CSV Import

**Route**: `/import`

**Mục đích**: Upload CSV file để import teams.

**Chức năng**:

1. **File upload**: HTML file input
2. **Text paste**: Paste CSV content vào textarea
3. **Parse CSV**: Parse và validate format
4. **Create teams**: Call API để import
5. **Show results**: Success/error messages

**CSV Format**:

- Header: `team_name,member_emails,instructor_email`
- Member emails: Semicolon-separated
- Example trong code có template

**Key Functions**:

- `handleFileUpload()`: Handle file input
- `handleTextImport()`: Handle textarea paste
- `handleDownloadTemplate()`: Download CSV template

---

### Admin Routes

#### `app/debug/page.tsx` - Debug & Analytics

**Route**: `/debug`

**Mục đích**: Admin page để view analytics và manage database.

**Chức năng**:

1. **Display metrics**: Activation rate, median time-to-first-task
2. **Event statistics**: Counts by type
3. **Recent events**: Last 50 events
4. **Database actions**: Seed, Reset
5. **Export events**: Download CSV

**Key Functions**:

- `loadData()`: Calculate stats từ events
- `handleSeed()`: Call seed API
- `handleReset()`: Reset database
- `handleExportEvents()`: Export events CSV

**Metrics Calculation**:

- **Activation Rate**: `(plan_created_count / teams_count) * 100`
- **Median Time**: Tính từ `plan_created` → `task_completed` events

**Acceptance Criteria**:

- Activation ≥70% (badge green/red)
- Median time ≤24h (badge green/red)

---

## 🧩 Components

### `components/ui/*` - shadcn/ui Components

Tất cả components từ shadcn/ui library. Đã được cấu hình sẵn với Tailwind.

**Common components**:

- `Button`, `Card`, `Input`, `Textarea`
- `Select`, `Badge`, `Skeleton`
- `Dialog`, `Toast` (Sonner)

**Cách sử dụng**: Import và dùng như React components bình thường.

---

### `components/auth-form.tsx` - Auth Form

**Mục đích**: Simulated auth form (không dùng trong prototype).

**Chức năng**: Redirect đến `/app/guest` khi click.

---

### `components/auth/login-form.tsx` - Login Form

**Mục đích**: Login form UI (simulated).

**Chức năng**: Button "Continue as Guest" → `/app/guest`.

---

## 🔄 Data Flow

### 1. Generate Plan Flow

```
User → /app/guest
  ↓ (paste brief)
Click "Generate Plan"
  ↓
POST /api/llm/generate
  ↓ (simulate LLM)
Return plan JSON
  ↓
Create Project, Epics, Tasks, Hints
  ↓ (database.setProject, setEpic, setTask, setHint)
Track event: plan_created
  ↓
Redirect → /app/board/[projectId]
```

### 2. Task Interaction Flow

```
User → /app/board/[projectId]
  ↓ (click task card)
Navigate → /app/task/[taskId]
  ↓
Load task, hints, comments
  ↓
User edits hint
  ↓
database.updateHint()
  ↓
Update UI state
```

### 3. Analytics Flow

```
User action (e.g., complete task)
  ↓
database.addEvent({ type: 'task_completed', ... })
  ↓
Save to localStorage
  ↓
/instructor/dashboard hoặc /debug
  ↓
Load events → Calculate metrics
```

---

## 📐 Patterns & Conventions

### 1. **Simulation-First Pattern**

Tất cả external services được simulate:

- LLM → Template-based responses
- Database → localStorage
- Auth → localStorage flag

**Lợi ích**: Demo được ngay, không cần setup phức tạp.

---

### 2. **Client-Side Data Management**

- Database operations chạy trên client
- Server routes chỉ là API endpoints
- localStorage làm persistence layer

**Lưu ý**: Data sẽ mất nếu clear browser data.

---

### 3. **Type Safety**

Tất cả data models có TypeScript interfaces:

- Compile-time error checking
- IntelliSense support
- Documented structure

---

### 4. **Event-Driven Analytics**

Mọi user action được track qua events:

- Centralized tracking
- Dễ tính metrics
- Có thể export để phân tích

---

### 5. **Route Organization**

- Student routes: `/app/*`
- Instructor routes: `/instructor/*`
- Admin routes: `/debug`
- Public routes: `/import`

**Lợi ích**: Clear separation of concerns.

---

## 🚀 Mở rộng & Customization

### Thêm Feature Mới

1. **Thêm route mới**:
   - Tạo folder trong `app/`
   - Tạo `page.tsx`
   - Add link trong navigation

2. **Thêm API endpoint**:
   - Tạo `app/api/[name]/route.ts`
   - Export `GET` hoặc `POST` function

3. **Thêm data model**:
   - Thêm interface trong `lib/mock-data.ts`
   - Thêm methods trong `database` object

4. **Thêm component**:
   - Tạo file trong `components/`
   - Import và sử dụng

### Connect Real Services

Khi muốn connect real services:

1. **LLM API**:
   - Thay `generateSamplePlan()` trong `app/api/llm/generate/route.ts`
   - Call real API với API key

2. **Database**:
   - Thay `database` trong `lib/mock-data.ts`
   - Connect Supabase/PostgreSQL
   - Migrate data structure

3. **Auth**:
   - Implement real auth flow
   - Replace localStorage checks
   - Add auth middleware

---

## 📝 Notes

### Performance

- localStorage có giới hạn (~5-10MB)
- Nhiều data có thể làm chậm
- Consider pagination cho large lists

### Security

- Hiện tại không có real security
- localStorage có thể bị modify
- Cần validation khi connect real services

### Testing

- Seed data để test: `/debug` → "Seed Database"
- Reset data: `/debug` → "Reset Database"
- Test flows trong README.md

---

## 🎓 Learning Resources

- **Next.js App Router**: https://nextjs.org/docs/app
- **TypeScript**: https://www.typescriptlang.org/docs/
- **shadcn/ui**: https://ui.shadcn.com/
- **Tailwind CSS**: https://tailwindcss.com/docs

---

**Tài liệu này sẽ được cập nhật khi có thay đổi trong codebase.**

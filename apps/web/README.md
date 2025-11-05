# Mengo - Prototype PWA

Mengo converts a short project brief into a Trello-style team board with AI-generated epics, tasks, and a 3-level pedagogical hint scaffold per task (Metacognitive → Conceptual → Keywords).

## 🎯 Prototype Scope

This is a **simulation-first prototype** that implements:

- Guest brief → Generate plan → Trello-style board
- Task detail with 3-level editable hint scaffold
- Basic collaboration (assign, comment, status)
- Instructor CSV import + stuck alerts
- Analytics and event tracking

**All external integrations are simulated** (LLM, auth, DB) - no real API keys required.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
cd apps/web
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Build

```bash
pnpm build
pnpm start
```

## 📁 Project Structure

```
apps/web/
├── app/
│   ├── api/
│   │   ├── llm/generate/      # Simulated LLM endpoint
│   │   ├── analytics/          # Event tracking
│   │   ├── import/csv/        # CSV import
│   │   └── debug/seed/         # Seed data loader
│   ├── app/
│   │   ├── guest/              # Landing page with brief input
│   │   ├── board/[projectId]/  # Kanban board
│   │   └── task/[taskId]/      # Task detail with hints
│   ├── instructor/dashboard/    # Instructor view
│   ├── import/                 # CSV upload
│   └── debug/                  # Analytics & acceptance checks
├── lib/
│   └── mock-data.ts            # In-memory database with localStorage
└── components/ui/              # shadcn/ui components
```

## 🎮 Key Features

### 1. Guest Flow

- Navigate to `/app/guest`
- Paste project brief
- Click "Generate Plan"
- Board is populated with epics and tasks

### 2. Board View (`/app/board/:projectId`)

- Kanban columns: To Do, In Progress, Done
- Drag and drop tasks between columns
- Assign tasks to users
- View task hints preview

### 3. Task Detail (`/app/task/:taskId`)

- View task description
- **3 editable hints:**
  - Metacognitive (how to think)
  - Conceptual (what to review)
  - Keywords (what to search)
- Add comments
- Change status and assignee

### 4. Instructor Dashboard (`/instructor/dashboard`)

- View all teams
- See stuck alerts (tasks > X days with no comments)
- Export CSV for triage
- Adjust stuck threshold

### 5. CSV Import (`/import`)

- Upload CSV roster with format:
  ```
  team_name,member_emails,instructor_email
  Team Alpha,"alice@example.com;bob@example.com",inst1@example.com
  ```

## 🔧 Simulated Features

### LLM Generation

- **Endpoint:** `/api/llm/generate`
- **Simulation:** Deterministic responses based on brief keywords
- **Query params:**
  - `?simulate_fail=true` - Test error flow
  - `?latency=800` - Simulate response time

### Database

- **Storage:** In-memory with localStorage persistence
- **Reset:** Visit `/debug` and click "Reset Database"
- **Seed:** Visit `/debug` and click "Seed Database"

### Analytics

- **Events tracked:**
  - `plan_created`
  - `task_created`
  - `hint_viewed`
  - `task_completed`
  - `task_assigned`
- **View:** `/debug` page shows activation rate and time-to-first-task

### Authentication

- **Guest mode:** No login required
- **Instructor mode:** Toggle via localStorage (`mengo_admin=true`)

## 📊 Acceptance Criteria

### Success Metrics

- **Activation:** ≥70% of onboarded teams generate a plan
- **Time-to-first-task:** Median ≤24 hours from plan creation

### Validation

1. Visit `/debug` to view metrics
2. Seed database: POST `/api/debug/seed?variant=demo`
3. Check:
   - Plan generation creates ≥3 epics or ≥8 tasks
   - Each task shows 3 editable hints
   - Guest can generate and assign without login
   - Instructor can import CSV and see >0 stuck alerts

## 🧪 Testing Checklist

### Guest Flow

- [ ] Paste brief → Generate → Board shows ≥3 epics or ≥8 tasks
- [ ] Can assign tasks without login
- [ ] Can mark tasks as done

### Task Detail

- [ ] 3 hints visible (Metacognitive, Conceptual, Keywords)
- [ ] Hints are editable
- [ ] Can add comments
- [ ] Can change status

### Instructor

- [ ] Import CSV → Teams listed
- [ ] See at least 1 stuck alert (after seeding)
- [ ] Export CSV works

### Analytics

- [ ] Events logged: plan_created, task_created, hint_viewed, task_completed
- [ ] Debug page shows activation rate and median time

## 🎨 UI Components

Built with:

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** components
- **Sonner** for toasts

## 📝 API Endpoints

### POST `/api/llm/generate`

Generate plan from brief.

**Body:**

```json
{
  "brief": "Build a mini e-commerce...",
  "template": "default",
  "simulate_success": true,
  "latency_ms": 800
}
```

### POST `/api/import/csv`

Import teams from CSV.

**FormData:** `file` (CSV file)

### POST `/api/analytics`

Record analytics event.

**Body:**

```json
{
  "type": "plan_created",
  "projectId": "proj_1",
  "userId": "user_1"
}
```

### POST `/api/debug/seed?variant=demo`

Seed database with sample data (3 projects, 10 teams, 3 instructors).

## 🔐 Environment Variables

Create `.env.local` (optional for prototype):

```env
NEXT_PUBLIC_APP_NAME=Mengo
NEXT_PUBLIC_APP_VERSION=0.1.0
```

**Note:** All external services are simulated. No real API keys needed.

## 📸 Placeholder Images

Place images in `/public/assets/`:

- `board.png` - Team board screenshot
- `task_detail.png` - Task detail with hints
- `instructor_dashboard.png` - Instructor dashboard

## 🐛 Debugging

1. **View events:** `/debug`
2. **Reset database:** Click "Reset Database" on `/debug`
3. **Seed data:** Click "Seed Database" on `/debug`
4. **Check localStorage:** Open DevTools → Application → Local Storage → `mengo_db`

## 🚧 Known Limitations (Prototype)

- Drag-and-drop uses HTML5 API (basic implementation)
- No real authentication (simulated via localStorage)
- No real LLM (deterministic templates)
- No real database (localStorage only)
- No real-time collaboration
- No image uploads

## 📚 Next Steps (Post-Prototype)

- Connect real LLM API
- Add Supabase for persistence
- Implement real authentication
- Add real-time updates
- Improve drag-and-drop UX
- Add image uploads

## 📄 License

MIT

-- Mengo Initial Schema Migration
-- Based on navi-plan-builder (types.ts, mock-db.ts)

-- 1. Create Custom Enum Types
-- These correspond to the string literal types in types.ts

CREATE TYPE public.task_status AS ENUM (
  'todo',
  'progress',
  'done'
);

CREATE TYPE public.hint_level AS ENUM (
  'meta',    -- "Metacognitive" in docs
  'concept', -- "Conceptual" in docs
  'keywords'
);

CREATE TYPE public.analytics_event_type AS ENUM (
  'plan_created',
  'task_created',
  'hint_viewed',
  'task_completed'
);

-- 2. Create 'profiles' table
-- This table links to Supabase's auth.users and stores public user data.
-- Corresponds to owner_id, assignee_id, author, instructor_id in types.ts

CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  full_name text,
  avatar_url text,
  -- We can add roles here later, e.g., 'student' or 'instructor'
  updated_at timestamptz DEFAULT now()
);
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- Create policy: Users can see all profiles (simple for now)
CREATE POLICY "Allow all users to view profiles" ON public.profiles
  FOR SELECT USING (true);
-- Create policy: Users can update their own profile
CREATE POLICY "Allow users to update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);


-- 3. Create 'teams' table
-- Corresponds to Team in types.ts

CREATE TABLE public.teams (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  instructor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);
-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
-- Note: RLS policies for teams will be complex (based on membership) and added later.
-- For now, allow logged-in users to see all teams.
CREATE POLICY "Allow authenticated users to view teams" ON public.teams
  FOR SELECT USING (auth.role() = 'authenticated');


-- 4. Create 'team_members' join table
-- This handles the many-to-many relationship for `members: string[]` in types.ts

CREATE TABLE public.team_members (
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (team_id, user_id)
);
-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
-- Policy: Users can see memberships for their own teams. (Simplified: just check if user is in the list)
CREATE POLICY "Allow users to view their own team memberships" ON public.team_members
  FOR SELECT USING (auth.uid() = user_id);


-- 5. Create 'projects' table
-- Corresponds to Project in types.ts. This is the central "board".

CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  title text NOT NULL,
  brief text NOT NULL, -- The "pain point" - user pastes brief here
  created_at timestamptz DEFAULT now() NOT NULL
);
-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
-- Note: RLS policies will be based on team membership or ownership.
-- For now, allow owners to see their projects.
CREATE POLICY "Allow owner to view projects" ON public.projects
  FOR SELECT USING (auth.uid() = owner_id);


-- 6. Create 'epics' table
-- Corresponds to Epic in types.ts

CREATE TABLE public.epics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  "order" integer NOT NULL DEFAULT 0, -- Added for ordering Epics in UI
  created_at timestamptz DEFAULT now() NOT NULL
);
-- Enable RLS
ALTER TABLE public.epics ENABLE ROW LEVEL SECURITY;
-- Policy: Users can see epics for projects they have access to.
CREATE POLICY "Allow users to view epics for their projects" ON public.epics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = epics.project_id AND p.owner_id = auth.uid()
      -- This will be expanded to include team members
    )
  );


-- 7. Create 'tasks' table
-- Corresponds to Task in types.ts

CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  epic_id uuid REFERENCES public.epics(id) ON DELETE SET NULL,
  assignee_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status public.task_status NOT NULL DEFAULT 'todo',
  "order" integer NOT NULL DEFAULT 0, -- Added for ordering Tasks in UI
  created_at timestamptz DEFAULT now() NOT NULL
);
-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
-- Policy: Users can see tasks for projects they have access to.
CREATE POLICY "Allow users to view tasks for their projects" ON public.tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = tasks.project_id AND p.owner_id = auth.uid()
      -- This will be expanded to include team members
    )
  );


-- 8. Create 'acceptance_criteria' table
-- Corresponds to AcceptanceCriterion in types.ts

CREATE TABLE public.acceptance_criteria (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  text text NOT NULL,
  is_completed boolean NOT NULL DEFAULT false
);
-- Enable RLS
ALTER TABLE public.acceptance_criteria ENABLE ROW LEVEL SECURITY;
-- Policy: Users can see criteria for tasks they have access to.
CREATE POLICY "Allow users to view criteria for their tasks" ON public.acceptance_criteria
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.projects p ON t.project_id = p.id
      WHERE t.id = acceptance_criteria.task_id AND p.owner_id = auth.uid()
    )
  );


-- 9. Create 'hints' table
-- Corresponds to Hint in types.ts. This is the core "Pedagogy-First" feature.

CREATE TABLE public.hints (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  level public.hint_level NOT NULL,
  content text NOT NULL,
  editable_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL -- For instructor edits
);
-- Enable RLS
ALTER TABLE public.hints ENABLE ROW LEVEL SECURITY;
-- Policy: Users can see hints for tasks they have access to.
CREATE POLICY "Allow users to view hints for their tasks" ON public.hints
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.projects p ON t.project_id = p.id
      WHERE t.id = hints.task_id AND p.owner_id = auth.uid()
    )
  );


-- 10. Create 'comments' table
-- Corresponds to Comment in types.ts

CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);
-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
-- Policy: Users can see comments for tasks they have access to.
CREATE POLICY "Allow users to view comments for their tasks" ON public.comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.projects p ON t.project_id = p.id
      WHERE t.id = comments.task_id AND p.owner_id = auth.uid()
    )
  );
-- Policy: Users can create comments
CREATE POLICY "Allow users to insert comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);


-- 11. Create 'analytics_events' table
-- Corresponds to AnalyticsEvent in types.ts

CREATE TABLE public.analytics_events (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  type public.analytics_event_type NOT NULL,
  data jsonb,
  "timestamp" timestamptz DEFAULT now() NOT NULL
);
-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
-- Policy: Allow services or users to log events.
CREATE POLICY "Allow users to log analytics events" ON public.analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 12. Create Trigger Function to auto-create 'profile' on new user signup
-- This function handles creating a row in public.profiles when a new user signs up.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();
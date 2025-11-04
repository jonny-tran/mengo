// Mock data for prototype development - Simulation-First Implementation
// For Prototype depth, implement payments, auth, DB and third-party APIs as client-side mocks
// (e.g., in-memory arrays, setTimeout to mimic latency). Do not request real API keys.

export type TaskStatus = 'todo' | 'progress' | 'done';
export type HintLevel = 'metacognitive' | 'conceptual' | 'keywords';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'student' | 'team_lead' | 'instructor';
}

export interface Project {
  id: string;
  title: string;
  brief: string;
  ownerId: string;
  teamId?: string;
  createdAt: string;
}

export interface Epic {
  id: string;
  projectId: string;
  title: string;
  order: number;
  createdAt: string;
}

export interface Hint {
  id: string;
  taskId: string;
  level: HintLevel;
  content: string;
  editableBy?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  epicId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  memberEmails: string[];
  instructorEmail: string;
  createdAt: string;
}

export interface AnalyticsEvent {
  id: string;
  type: 'plan_created' | 'task_created' | 'hint_viewed' | 'task_completed' | 'task_assigned';
  userId?: string;
  projectId?: string;
  taskId?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// In-memory database with localStorage persistence
const STORAGE_KEY = 'mengo_db';

interface Database {
  users: Record<string, User>;
  projects: Record<string, Project>;
  epics: Record<string, Epic>;
  tasks: Record<string, Task>;
  hints: Record<string, Hint>;
  comments: Record<string, Comment>;
  teams: Record<string, Team>;
  events: AnalyticsEvent[];
}

// Initialize database from localStorage or create empty
function loadDatabase(): Database {
  if (typeof window === 'undefined') {
    // Server-side: return empty database
    return {
      users: {},
      projects: {},
      epics: {},
      tasks: {},
      hints: {},
      comments: {},
      teams: {},
      events: [],
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load database from localStorage', error);
  }

  return {
    users: {},
    projects: {},
    epics: {},
    tasks: {},
    hints: {},
    comments: {},
    teams: {},
    events: [],
  };
}

// Save database to localStorage
function saveDatabase(db: Database): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (error) {
    console.warn('Failed to save database to localStorage', error);
  }
}

// Create database instance
let dbInstance: Database = loadDatabase();

// Database operations
export const database = {
  // Users
  get users() {
    return dbInstance.users;
  },
  setUser(user: User) {
    dbInstance.users[user.id] = user;
    saveDatabase(dbInstance);
  },
  getUserById(id: string): User | undefined {
    return dbInstance.users[id];
  },
  getUserByEmail(email: string): User | undefined {
    return Object.values(dbInstance.users).find((u) => u.email === email);
  },

  // Projects
  get projects() {
    return dbInstance.projects;
  },
  setProject(project: Project) {
    dbInstance.projects[project.id] = project;
    saveDatabase(dbInstance);
  },
  getProjectById(id: string): Project | undefined {
    return dbInstance.projects[id];
  },

  // Epics
  get epics() {
    return dbInstance.epics;
  },
  setEpic(epic: Epic) {
    dbInstance.epics[epic.id] = epic;
    saveDatabase(dbInstance);
  },
  getEpicsByProjectId(projectId: string): Epic[] {
    return Object.values(dbInstance.epics)
      .filter((e) => e.projectId === projectId)
      .sort((a, b) => a.order - b.order);
  },

  // Tasks
  get tasks() {
    return dbInstance.tasks;
  },
  setTask(task: Task) {
    dbInstance.tasks[task.id] = task;
    saveDatabase(dbInstance);
  },
  getTaskById(id: string): Task | undefined {
    return dbInstance.tasks[id];
  },
  getTasksByProjectId(projectId: string): Task[] {
    return Object.values(dbInstance.tasks)
      .filter((t) => t.projectId === projectId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },
  getTasksByEpicId(epicId: string): Task[] {
    return Object.values(dbInstance.tasks)
      .filter((t) => t.epicId === epicId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  // Hints
  get hints() {
    return dbInstance.hints;
  },
  setHint(hint: Hint) {
    dbInstance.hints[hint.id] = hint;
    saveDatabase(dbInstance);
  },
  getHintsByTaskId(taskId: string): Hint[] {
    return Object.values(dbInstance.hints)
      .filter((h) => h.taskId === taskId)
      .sort((a, b) => {
        const order = ['metacognitive', 'conceptual', 'keywords'];
        return order.indexOf(a.level) - order.indexOf(b.level);
      });
  },
  updateHint(id: string, updates: Partial<Hint>) {
    const hint = dbInstance.hints[id];
    if (hint) {
      dbInstance.hints[id] = { ...hint, ...updates, updatedAt: new Date().toISOString() };
      saveDatabase(dbInstance);
    }
  },

  // Comments
  get comments() {
    return dbInstance.comments;
  },
  setComment(comment: Comment) {
    dbInstance.comments[comment.id] = comment;
    saveDatabase(dbInstance);
  },
  getCommentsByTaskId(taskId: string): Comment[] {
    return Object.values(dbInstance.comments)
      .filter((c) => c.taskId === taskId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  // Teams
  get teams() {
    return dbInstance.teams;
  },
  setTeam(team: Team) {
    dbInstance.teams[team.id] = team;
    saveDatabase(dbInstance);
  },
  getTeamById(id: string): Team | undefined {
    return dbInstance.teams[id];
  },

  // Analytics Events
  get events() {
    return dbInstance.events;
  },
  addEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>) {
    const newEvent: AnalyticsEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      timestamp: new Date().toISOString(),
    };
    dbInstance.events.push(newEvent);
    saveDatabase(dbInstance);
    return newEvent;
  },
  getEventsByType(type: AnalyticsEvent['type']): AnalyticsEvent[] {
    return dbInstance.events.filter((e) => e.type === type);
  },

  // Reset database
  reset() {
    dbInstance = {
      users: {},
      projects: {},
      epics: {},
      tasks: {},
      hints: {},
      comments: {},
      teams: {},
      events: [],
    };
    saveDatabase(dbInstance);
  },
};

// Export db for backward compatibility (will be removed later)
export const db = database;

// Helper functions for compatibility
export function getProjectsForUser(userId: string): Project[] {
  return Object.values(database.projects).filter((project) => project.ownerId === userId);
}

export function getProjectById(projectId: string): Project | undefined {
  return database.getProjectById(projectId);
}

export function getUserById(userId: string): User | undefined {
  return database.getUserById(userId);
}

export function getEpicsForProject(projectId: string): Epic[] {
  return database.getEpicsByProjectId(projectId);
}

export function getTasksForProject(projectId: string): Task[] {
  return database.getTasksByProjectId(projectId);
}

export function getTasksForEpic(epicId: string): Task[] {
  return database.getTasksByEpicId(epicId);
}


// Mock data for prototype development
// Based on navi-plan-builder structure

export type TaskStatus = 'todo' | 'progress' | 'done';
export type HintLevel = 'meta' | 'concept' | 'keywords';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'student' | 'instructor';
}

export interface Project {
  id: string;
  name: string;
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

export interface Task {
  id: string;
  projectId: string;
  epicId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assigneeId?: string;
  order: number;
  createdAt: string;
}

// Mock Database
export const db = {
  users: {
    'u-jonny': {
      id: 'u-jonny',
      name: 'Jonny Tran',
      email: 'jonny@example.com',
      role: 'student' as const,
    },
    'u-instructor': {
      id: 'u-instructor',
      name: 'Instructor',
      email: 'instructor@example.com',
      role: 'instructor' as const,
    },
  },
  projects: {
    'p-1': {
      id: 'p-1',
      name: 'E-commerce Platform',
      brief: 'Build a full-stack e-commerce platform with user authentication, product catalog, shopping cart, and payment integration.',
      ownerId: 'u-han',
      createdAt: new Date().toISOString(),
    },
    'p-2': {
      id: 'p-2',
      name: 'Task Management App',
      brief: 'Create a task management application with Kanban boards, team collaboration, and real-time updates.',
      ownerId: 'u-han',
      createdAt: new Date().toISOString(),
    },
    'p-3': {
      id: 'p-3',
      name: 'Learning Management System',
      brief: 'Develop an LMS platform for online courses with video streaming, quizzes, and progress tracking.',
      ownerId: 'u-han',
      createdAt: new Date().toISOString(),
    },
  },
  epics: {
    'e-1': {
      id: 'e-1',
      projectId: 'p-1',
      title: 'User Authentication',
      order: 0,
      createdAt: new Date().toISOString(),
    },
    'e-2': {
      id: 'e-2',
      projectId: 'p-1',
      title: 'Product Catalog',
      order: 1,
      createdAt: new Date().toISOString(),
    },
    'e-3': {
      id: 'e-3',
      projectId: 'p-2',
      title: 'Kanban Board',
      order: 0,
      createdAt: new Date().toISOString(),
    },
  },
  tasks: {
    't-1': {
      id: 't-1',
      projectId: 'p-1',
      epicId: 'e-1',
      title: 'Implement login page',
      description: 'Create a responsive login page with email and password fields',
      status: 'todo' as TaskStatus,
      assigneeId: 'u-han',
      order: 0,
      createdAt: new Date().toISOString(),
    },
    't-2': {
      id: 't-2',
      projectId: 'p-1',
      epicId: 'e-1',
      title: 'Add password reset functionality',
      description: 'Implement forgot password flow with email verification',
      status: 'progress' as TaskStatus,
      assigneeId: 'u-han',
      order: 1,
      createdAt: new Date().toISOString(),
    },
    't-3': {
      id: 't-3',
      projectId: 'p-1',
      epicId: 'e-2',
      title: 'Design product card component',
      description: 'Create a reusable product card with image, title, price, and add to cart button',
      status: 'done' as TaskStatus,
      assigneeId: 'u-han',
      order: 0,
      createdAt: new Date().toISOString(),
    },
  },
};

// Helper functions
export function getProjectsForUser(userId: string): Project[] {
  return Object.values(db.projects).filter((project) => project.ownerId === userId);
}

export function getProjectById(projectId: string): Project | undefined {
  return db.projects[projectId as keyof typeof db.projects];
}

export function getUserById(userId: string): User | undefined {
  return db.users[userId as keyof typeof db.users];
}

export function getEpicsForProject(projectId: string): Epic[] {
  return Object.values(db.epics)
    .filter((epic) => epic.projectId === projectId)
    .sort((a, b) => a.order - b.order);
}

export function getTasksForProject(projectId: string): Task[] {
  return Object.values(db.tasks)
    .filter((task) => task.projectId === projectId)
    .sort((a, b) => a.order - b.order);
}

export function getTasksForEpic(epicId: string): Task[] {
  return Object.values(db.tasks)
    .filter((task) => task.epicId === epicId)
    .sort((a, b) => a.order - b.order);
}

